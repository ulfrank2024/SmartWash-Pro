const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const multer = require('multer'); // Importez Multer
const path = require('path'); // Nécessaire pour extraire l'extension du fichier

// Configuration de Multer pour le stockage en mémoire
const upload = multer({ storage: multer.memoryStorage() });

// --- CITIES ENDPOINTS ---
// GET all cities
router.get('/cities', async (req, res) => {
    console.log("Récupération de la liste des villes");
    try {
        const { data, error } = await supabase
            .from('Cities')
            .select('*');

        if (error) {
            console.error("Erreur lors de la récupération des villes depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des villes.',
                message_en: 'Internal server error while fetching cities.'
            });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération des villes :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// POST a new city
router.post('/cities', async (req, res) => {
    const { name, country } = req.body;
    console.log(`Tentative de création d'une nouvelle ville: ${name}, ${country}`);
    try {
        const { data, error } = await supabase
            .from('Cities')
            .insert([{ name, country }])
            .select();

        if (error) {
            console.error("Erreur lors de la création de la ville dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la création de la ville.',
                message_en: 'Internal server error while creating city.'
            });
        }
        res.status(201).json({
            message: 'Ville créée avec succès.',
            message_en: 'City created successfully.',
            city: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la création de la ville :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// --- SERVICE POINTS ENDPOINTS ---
// GET all service points (and filter by city_id)
router.get('/service-points', async (req, res) => {
    const { city_id } = req.query;
    console.log(`Récupération de la liste des points de service (filtré par city_id: ${city_id})`);
    try {
        let query = supabase.from('ServicePoints').select('*');
        if (city_id) {
            query = query.eq('city_id', city_id);
        }
        const { data, error } = await query;

        if (error) {
            console.error("Erreur lors de la récupération des points de service depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des points de service.',
                message_en: 'Internal server error while fetching service points.'
            });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération des points de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// POST a new service point
router.post('/service-points', async (req, res) => {
    const { name, city_id, address, budget_prev, status_construction } = req.body;
    console.log(`Tentative de création d'un nouveau point de service: ${name}`);
    try {
        const { data, error } = await supabase
            .from('ServicePoints')
            .insert([{ name, city_id, address, budget_prev, status_construction }])
            .select();

        if (error) {
            console.error("Erreur lors de la création du point de service dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la création du point de service.',
                message_en: 'Internal server error while creating service point.'
            });
        }
        res.status(201).json({
            message: 'Point de service créé avec succès.',
            message_en: 'Service point created successfully.',
            servicePoint: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la création du point de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// GET a single service point by ID
router.get('/service-points/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Récupération du point de service avec l'ID: ${id}`);
    try {
        const { data, error } = await supabase
            .from('ServicePoints')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Erreur lors de la récupération du point de service depuis Supabase :", error);
            return res.status(404).json({
                message: 'Point de service non trouvé.',
                message_en: 'Service point not found.'
            });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération du point de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// PUT (update) a service point by ID
router.put('/service-points/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    console.log(`Tentative de mise à jour du point de service ${id} avec les données:`, updates);
    try {
        const { data, error } = await supabase
            .from('ServicePoints')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("Erreur lors de la mise à jour du point de service dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la mise à jour du point de service.',
                message_en: 'Internal server error while updating service point.'
            });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({
                message: 'Point de service non trouvé.',
                message_en: 'Service point not found.'
            });
        }
        res.status(200).json({
            message: 'Point de service mis à jour avec succès.',
            message_en: 'Service point updated successfully.',
            servicePoint: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la mise à jour du point de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// DELETE a service point by ID
router.delete('/service-points/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Tentative de suppression du point de service avec l'ID: ${id}`);
    try {
        const { error } = await supabase
            .from('ServicePoints')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erreur lors de la suppression du point de service dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la suppression du point de service.',
                message_en: 'Internal server error while deleting service point.'
            });
        }
        res.status(204).send(); // No content for successful deletion
    } catch (err) {
        console.error("Erreur inattendue lors de la suppression du point de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});


// --- WASHING STATIONS ENDPOINTS ---
// GET all washing stations for a given service point
router.get('/service-points/:servicePointId/washing-stations', async (req, res) => {
    const { servicePointId } = req.params;
    console.log(`Récupération des stations de lavage pour le point de service: ${servicePointId}`);
    try {
        const { data, error } = await supabase
            .from('WashingStations')
            .select('*')
            .eq('service_point_id', servicePointId);

        if (error) {
            console.error("Erreur lors de la récupération des stations de lavage depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des stations de lavage.',
                message_en: 'Internal server error while fetching washing stations.'
            });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération des stations de lavage :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// POST a new washing station for a service point
router.post('/service-points/:servicePointId/washing-stations', async (req, res) => {
    const { servicePointId } = req.params;
    const { name, type } = req.body; // status, last_heartbeat will be set by IoT service
    console.log(`Tentative de création d'une nouvelle station de lavage pour le point de service ${servicePointId}: ${name}`);
    try {
        const { data, error } = await supabase
            .from('WashingStations')
            .insert([{ service_point_id: servicePointId, name, type }])
            .select();

        if (error) {
            console.error("Erreur lors de la création de la station de lavage dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la création de la station de lavage.',
                message_en: 'Internal server error while creating washing station.'
            });
        }
        res.status(201).json({
            message: 'Station de lavage créée avec succès.',
            message_en: 'Washing station created successfully.',
            washingStation: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la création de la station de lavage :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// GET a single washing station by ID
router.get('/washing-stations/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Récupération de la station de lavage avec l'ID: ${id}`);
    try {
        const { data, error } = await supabase
            .from('WashingStations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Erreur lors de la récupération de la station de lavage depuis Supabase :", error);
            return res.status(404).json({
                message: 'Station de lavage non trouvée.',
                message_en: 'Washing station not found.'
            });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération de la station de lavage :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// PUT (update) a washing station by ID
router.put('/washing-stations/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    console.log(`Tentative de mise à jour de la station de lavage ${id} avec les données:`, updates);
    try {
        const { data, error } = await supabase
            .from('WashingStations')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("Erreur lors de la mise à jour de la station de lavage dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la mise à jour de la station de lavage.',
                message_en: 'Internal server error while updating washing station.'
            });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({
                message: 'Station de lavage non trouvée.',
                message_en: 'Washing station not found.'
            });
        }
        res.status(200).json({
            message: 'Station de lavage mise à jour avec succès.',
            message_en: 'Washing station updated successfully.',
            washingStation: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la mise à jour de la station de lavage :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// DELETE a washing station by ID
router.delete('/washing-stations/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Tentative de suppression de la station de lavage avec l'ID: ${id}`);
    try {
        const { error } = await supabase
            .from('WashingStations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erreur lors de la suppression de la station de lavage dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la suppression de la station de lavage.',
                message_en: 'Internal server error while deleting washing station.'
            });
        }
        res.status(204).send(); // No content for successful deletion
    } catch (err) {
        console.error("Erreur inattendue lors de la suppression de la station de lavage :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});


// --- Deprecated/Updated PROJECTS ENDPOINTS ---
// The original '/' route now fetches from 'ServicePoints'.
router.get('/', async (req, res) => {
    console.log("Récupération de la liste des points de service (anciennement projets)");
    try {
        const { data, error } = await supabase
            .from('ServicePoints') // Updated to ServicePoints
            .select('*');

        if (error) {
            console.error("Erreur lors de la récupération des points de service depuis Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la récupération des points de service.',
                message_en: 'Internal server error while fetching service points.'
            });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur inattendue lors de la récupération des points de service :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Route pour créer une nouvelle dépense pour un point de service avec upload de photo
router.post('/:servicePointId/expenses', upload.single('photo'), async (req, res) => {
    const { servicePointId } = req.params;
    const { amount, description, date } = req.body; // photo_url sera géré via le fichier
    let photo_url = null;

    console.log(`Tentative d'ajout d'une dépense au point de service ${servicePointId}:`, { amount, description, date });

    try {
        if (req.file) {
            const file = req.file;
            const fileExtension = path.extname(file.originalname);
            const fileName = `${Date.now()}-${file.originalname.replace(fileExtension, '')}${fileExtension}`;
            const filePath = `${servicePointId}/${fileName}`; // Organiser par servicePointId

            // Upload du fichier vers Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('project-expenses') // Nom de votre bucket Supabase Storage
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false // Ne pas remplacer si le fichier existe déjà
                });

            if (uploadError) {
                console.error("Erreur lors de l'upload de la photo vers Supabase Storage :", uploadError);
                return res.status(500).json({
                    message: 'Erreur lors de l\'upload de la photo.',
                    message_en: 'Error uploading photo.'
                });
            }

            // Obtenir l'URL publique du fichier
            const { data: publicUrlData } = supabase.storage
                .from('project-expenses')
                .getPublicUrl(filePath);
            
            photo_url = publicUrlData.publicUrl;
            console.log("Photo uploadée, URL :", photo_url);
        }

        // Insérer la dépense dans la base de données
        const { data: expenseData, error: expenseError } = await supabase
            .from('Expenses') // Updated to Expenses
            .insert([
                { service_point_id: servicePointId, amount, description, date, photo_url } // Updated column name
            ])
            .select(); // Ajouter .select() pour retourner les données insérées

        if (expenseError) {
            console.error("Erreur lors de l'insertion de la dépense dans Supabase :", expenseError);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de l\'ajout de la dépense.',
                message_en: 'Internal server error while adding expense.'
            });
        }

        res.status(201).json({
            message: 'Dépense ajoutée avec succès.',
            message_en: 'Expense added successfully.',
            expense: expenseData[0] // Retourner le premier élément inséré
        });

    } catch (err) {
        console.error("Erreur inattendue lors de l'ajout de la dépense :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

module.exports = router;
