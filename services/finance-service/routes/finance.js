const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase'); // Assurez-vous que le chemin est correct

// Route pour obtenir un rapport financier
router.get('/report', async (req, res) => {
    console.log("Génération d'un rapport financier");
    const { start_date, end_date, service_point_id, washing_station_id } = req.query;

    try {
        let query = supabase.from('Transactions') // Updated table name
            .select('montant, date, washing_station_id');

        if (start_date) {
            query = query.gte('date', start_date);
        }
        if (end_date) {
            query = query.lte('date', end_date);
        }
        if (washing_station_id) {
            query = query.eq('washing_station_id', washing_station_id);
        }

        // If service_point_id is provided, we need to join with WashingStations
        if (service_point_id) {
            // This requires a more complex query or RLS policies in Supabase
            // For simplicity, we'll fetch washing stations first
            const { data: washingStations, error: wsError } = await supabase
                .from('WashingStations')
                .select('id')
                .eq('service_point_id', service_point_id);

            if (wsError) {
                console.error("Erreur lors de la récupération des stations de lavage pour le point de service :", wsError);
                return res.status(500).json({
                    message: "Erreur interne du serveur lors de la récupération des stations de lavage pour le rapport.",
                    message_en: "Internal server error while fetching washing stations for report."
                });
            }
            const wsIds = washingStations.map(ws => ws.id);
            if (wsIds.length === 0) {
                return res.status(200).json({
                    message: 'Aucune transaction trouvée pour le point de service spécifié.',
                    message_en: 'No transactions found for the specified service point.',
                    report: {
                        totalRevenue: 0,
                        numberOfTransactions: 0,
                        period_start: start_date || 'Début des données',
                        period_end: end_date || 'Fin des données'
                    }
                });
            }
            query = query.in('washing_station_id', wsIds);
        }

        const { data: transactions, error } = await query;

        if (error) {
            console.error("Erreur lors de la récupération des transactions pour le rapport :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des transactions pour le rapport.',
                message_en: 'Internal server error while fetching transactions for report.'
            });
        }

        const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.montant, 0); // Updated 'amount' to 'montant'
        const numberOfTransactions = transactions.length;

        res.status(200).json({
            message: 'Rapport financier généré avec succès.',
            message_en: 'Financial report generated successfully.',
            report: {
                totalRevenue,
                numberOfTransactions,
                period_start: start_date || 'Début des données',
                period_end: end_date || 'Fin des données'
            }
        });

    } catch (err) {
        console.error("Erreur inattendue lors de la génération du rapport financier :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Route pour l'audit de caisse
router.post('/audit', async (req, res) => {
    const { declared_cash, service_point_id, period_start, period_end } = req.body; // Renamed caisse_physique to declared_cash
    console.log(`Audit de caisse pour le point de service ${service_point_id}: Déclaré=${declared_cash}, Période=${period_start}-${period_end}`);

    if (declared_cash === undefined || !service_point_id || !period_start || !period_end) {
        return res.status(400).json({
            message: 'Le montant déclaré, le service_point_id et les dates de période sont requis pour l\'audit.',
            message_en: 'Declared amount, service_point_id, and period dates are required for audit.'
        });
    }

    try {
        // 1. Récupérer toutes les WashingStations pour le service_point_id donné
        const { data: washingStations, error: wsError } = await supabase
            .from('WashingStations')
            .select('id')
            .eq('service_point_id', service_point_id);

        if (wsError) {
            console.error("Erreur lors de la récupération des stations de lavage pour l'audit :", wsError);
            return res.status(500).json({
                message: "Erreur interne du serveur lors de la récupération des stations de lavage pour l'audit.",
                message_en: "Internal server error while fetching washing stations for audit."
            });
        }
        const wsIds = washingStations.map(ws => ws.id);

        if (wsIds.length === 0) {
            return res.status(404).json({
                message: 'Aucune station de lavage trouvée pour ce point de service.',
                message_en: 'No washing stations found for this service point.'
            });
        }

        // 2. Agréger les montants électroniques de toutes les transactions pour ces stations sur la période
        const { data: transactions, error: txError } = await supabase
            .from('Transactions')
            .select('montant')
            .in('washing_station_id', wsIds)
            .gte('date', period_start)
            .lte('date', period_end);

        if (txError) {
            console.error("Erreur lors de l'agrégation des transactions pour l'audit :", txError);
            return res.status(500).json({
                message: "Erreur interne du serveur lors de l'agrégation des transactions pour l'audit.",
                message_en: "Internal server error while aggregating transactions for audit."
            });
        }

        const electronicTotal = transactions.reduce((sum, tx) => sum + tx.montant, 0);
        const discrepancy = declared_cash - electronicTotal;

        // Enregistrer le résultat de l'audit
        const auditResult = {
            service_point_id,
            period_start,
            period_end,
            declared_cash,
            electronic_total: electronicTotal,
            discrepancy,
            audit_date: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('Audits') // Assuming 'Audits' table (was 'audits')
            .insert([auditResult]);

        if (error) {
            console.error("Erreur lors de l'enregistrement de l'audit dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de l\'enregistrement de l\'audit.',
                message_en: 'Internal server error while saving audit.'
            });
        }

        res.status(200).json({
            message: 'Audit de caisse enregistré avec succès.',
            message_en: 'Cash audit recorded successfully.',
            audit: auditResult
        });

    } catch (err) {
        console.error("Erreur inattendue lors de l'audit de caisse :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Nouvelle route pour récupérer les revenus journaliers et mensuels
router.get('/revenues', async (req, res) => {
    console.log("Récupération des revenus journaliers et mensuels");
    const { service_point_id, washing_station_id } = req.query;

    try {
        let query = supabase.from('Transactions') // Updated table name
            .select('montant, date, washing_station_id');

        if (washing_station_id) {
            query = query.eq('washing_station_id', washing_station_id);
        }

        if (service_point_id) {
            const { data: washingStations, error: wsError } = await supabase
                .from('WashingStations')
                .select('id')
                .eq('service_point_id', service_point_id);

            if (wsError) {
                console.error("Erreur lors de la récupération des stations de lavage pour les revenus :", wsError);
                return res.status(500).json({
                    message: "Erreur interne du serveur lors de la récupération des stations de lavage pour les revenus.",
                    message_en: "Internal server error while fetching washing stations for revenues."
                });
            }
            const wsIds = washingStations.map(ws => ws.id);
            if (wsIds.length === 0) {
                return res.status(200).json({
                    daily: {},
                    monthly: {},
                    message: 'Aucun revenu trouvé pour le point de service spécifié.',
                    message_en: 'No revenues found for the specified service point.'
                });
            }
            query = query.in('washing_station_id', wsIds);
        }

        const { data: transactions, error } = await query;

        if (error) {
            console.error("Erreur lors de la récupération des transactions depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des transactions.',
                message_en: 'Internal server error while fetching transactions.'
            });
        }

        const dailyRevenues = {};
        const monthlyRevenues = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date); // Updated 'created_at' to 'date'
            const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const month = date.toISOString().substring(0, 7); // YYYY-MM

            dailyRevenues[day] = (dailyRevenues[day] || 0) + transaction.montant; // Updated 'amount' to 'montant'
            monthlyRevenues[month] = (monthlyRevenues[month] || 0) + transaction.montant; // Updated 'amount' to 'montant'
        });

        res.status(200).json({
            daily: dailyRevenues,
            monthly: monthlyRevenues,
            message: 'Revenus récupérés avec succès.',
            message_en: 'Revenues fetched successfully.'
        });

    } catch (err) {
        console.error("Erreur inattendue lors de la récupération des revenus :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Nouvelle route pour le calcul automatique des paies et bonus
router.post('/calculate-payroll', async (req, res) => {
    const { period_start, period_end, employee_ids } = req.body;
    console.log(`Calcul de la paie pour la période du ${period_start} au ${period_end}`);

    if (!period_start || !period_end) {
        return res.status(400).json({
            message: 'Les dates de début et de fin de période sont requises.',
            message_en: 'Period start and end dates are required.'
        });
    }

    try {
        let query = supabase.from('Employees').select('id, salary, bonus_rate'); // Assuming Employees table

        if (employee_ids && employee_ids.length > 0) {
            query = query.in('id', employee_ids);
        }

        const { data: employees, error } = await query;

        if (error) {
            console.error("Erreur lors de la récupération des employés depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des employés.',
                message_en: 'Internal server error while fetching employees.'
            });
        }

        const payrollResults = employees.map(employee => {
            // Simplifié : calcul du salaire de base et bonus pour la période donnée
            // Dans un scénario réel, des facteurs comme les heures travaillées, les absences, etc. seraient pris en compte.
            const baseSalary = employee.salary; // Supposons un salaire mensuel
            const bonus = baseSalary * (employee.bonus_rate || 0); // Bonus en pourcentage du salaire

            return {
                employee_id: employee.id,
                period_start,
                period_end,
                base_salary: baseSalary,
                bonus_amount: bonus,
                total_pay: baseSalary + bonus
            };
        });

        res.status(200).json({
            message: 'Calcul de la paie et des bonus effectué avec succès.',
            message_en: 'Payroll and bonus calculation successful.',
            results: payrollResults
        });

    } catch (err) {
        console.error("Erreur inattendue lors du calcul de la paie :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

module.exports = router;
