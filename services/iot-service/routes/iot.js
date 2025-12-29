const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase'); // Assurez-vous que le chemin est correct

module.exports = (io) => { // Accepter l'instance io

    /**
     * Endpoint pour la collecte des données IoT depuis les stations de lavage.
     * Route: POST /api/v1/iot/collect
     * 
     * Body attendu (exemple):
     * {
     *   "washing_station_id": "UUID_DE_LA_STATION",
     *   "event_type": "transaction", // ou "status_update"
     *   "payload": {
     *     "montant_cfa": 500,
     *     "duree_sec": 300,
     *     "timestamp": "2025-12-24T10:00:00Z",
     *     "status": "AVAILABLE" // pour event_type "status_update"
     *   }
     * }
     */
    router.post('/collect', async (req, res) => {
        const { washing_station_id, event_type, payload } = req.body;
        const received_at = new Date().toISOString();

        console.log('Données IoT reçues :', JSON.stringify(req.body, null, 2));

        if (!washing_station_id || !event_type || !payload) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes: washing_station_id, event_type et payload sont requis.',
                message_en: 'Missing data: washing_station_id, event_type, and payload are required.'
            });
        }

        try {
            if (event_type === 'transaction') {
                const { montant_cfa, duree_sec } = payload;
                if (!montant_cfa || !duree_sec) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payload manquant pour la transaction: montant_cfa et duree_sec sont requis.',
                        message_en: 'Missing payload for transaction: montant_cfa and duree_sec are required.'
                    });
                }
                const { error: transactionError } = await supabase
                    .from('Transactions')
                    .insert([{
                        washing_station_id,
                        montant: montant_cfa,
                        duree: duree_sec,
                        date: payload.timestamp || received_at // Use payload timestamp if provided
                    }]);

                if (transactionError) {
                    console.error("Erreur lors de l'insertion de la transaction dans Supabase :", transactionError);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur interne du serveur lors de l'enregistrement de la transaction IoT.",
                        message_en: "Internal server error while saving IoT transaction."
                    });
                }
                // Émettre la transaction pour le frontend si nécessaire
                io.emit('iotTransaction', { washing_station_id, ...payload });

            } else if (event_type === 'status_update') {
                const { status } = payload;
                if (!status) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payload manquant pour la mise à jour de statut: status est requis.',
                        message_en: 'Missing payload for status update: status is required.'
                    });
                }
                const { data: updatedStation, error: statusUpdateError } = await supabase
                    .from('WashingStations')
                    .update({ status: status, last_heartbeat: received_at })
                    .eq('id', washing_station_id)
                    .select();
                
                if (statusUpdateError) {
                    console.error("Erreur lors de la mise à jour du statut de la station de lavage dans Supabase :", statusUpdateError);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur interne du serveur lors de la mise à jour du statut de la station IoT.",
                        message_en: "Internal server error while updating IoT station status."
                    });
                }
                // Émettre le statut mis à jour pour le frontend
                if (updatedStation && updatedStation.length > 0) {
                    io.emit('iotStatusUpdate', { station_id: washing_station_id, status: updatedStation[0].status });
                }

            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Type d\'événement IoT non supporté.',
                    message_en: 'Unsupported IoT event type.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Données IoT reçues et traitées avec succès.',
                message_en: 'IoT data received and processed successfully.'
            });

        } catch (err) {
            console.error("Erreur inattendue lors du traitement des données IoT :", err);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur.',
                message_en: 'Internal server error.'
            });
        }
    });

    // GET detailed IoT data for a specific washing station (e.g., recent transactions)
    router.get('/washing-stations/:washingStationId/data', async (req, res) => {
        const { washingStationId } = req.params;
        const { limit = 10, offset = 0 } = req.query; // Pagination

        console.log(`Récupération des données IoT détaillées pour la station ${washingStationId}`);

        try {
            const { data: transactions, error } = await supabase
                .from('Transactions')
                .select('*')
                .eq('washing_station_id', washingStationId)
                .order('date', { ascending: false })
                .range(offset, offset + limit - 1); // Supabase range is inclusive

            if (error) {
                console.error("Erreur lors de la récupération des transactions pour la station :", error);
                return res.status(500).json({
                    message: "Erreur interne du serveur lors de la récupération des transactions.",
                    message_en: "Internal server error while fetching transactions."
                });
            }

            res.status(200).json(transactions);
        } catch (err) {
            console.error("Erreur inattendue lors de la récupération des données IoT de la station :", err);
            res.status(500).json({
                message: 'Erreur interne du serveur.',
                message_en: 'Internal server error.'
            });
        }
    });

    // GET aggregated IoT data for a specific service point (e.g., status of all washing stations)
    router.get('/service-points/:servicePointId/data', async (req, res) => {
        const { servicePointId } = req.params;
        console.log(`Récupération des données IoT agrégées pour le point de service ${servicePointId}`);

        try {
            // Get all washing stations for this service point with their current status
            const { data: washingStations, error: wsError } = await supabase
                .from('WashingStations')
                .select('id, name, status, type, last_heartbeat')
                .eq('service_point_id', servicePointId);

            if (wsError) {
                console.error("Erreur lors de la récupération des stations de lavage pour le point de service :", wsError);
                return res.status(500).json({
                    message: "Erreur interne du serveur lors de la récupération des stations de lavage.",
                    message_en: "Internal server error while fetching washing stations for service point."
                });
            }

            // Optionally, get aggregated transaction data for the service point (e.g., daily total)
            // This would require more complex Supabase queries or view
            // For now, let's just return the washing stations status
            res.status(200).json({ servicePointId, washingStations });

        } catch (err) {
            console.error("Erreur inattendue lors de la récupération des données IoT agrégées :", err);
            res.status(500).json({
                message: 'Erreur interne du serveur.',
                message_en: 'Internal server error.'
            });
        }
    });


    return router;
};
