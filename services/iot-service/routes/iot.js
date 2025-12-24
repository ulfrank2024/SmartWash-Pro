const express = require('express');
const router = express.Router();

/**
 * Endpoint pour la collecte des données IoT depuis les stations de lavage.
 * Route: POST /api/v1/iot/collect
 * 
 * Body attendu (exemple):
 * {
 *   "station_id": "STATION_001",
 *   "event_type": "transaction", // ou "status_update"
 *   "payload": {
 *     "montant_cfa": 500,
 *     "duree_sec": 300,
 *     "timestamp": "2025-12-24T10:00:00Z"
 *   }
 * }
 */
router.post('/collect', (req, res) => {
    const data = req.body;
    
    console.log('Données IoT reçues :', JSON.stringify(data, null, 2));

    // TODO: Valider les données reçues (schéma, etc.)
    
    // TODO: Insérer les données dans la base de données Supabase
    // Exemple :
    // const { error } = await supabase
    //   .from('transactions')
    //   .insert([
    //     { station_id: data.station_id, ...data.payload },
    //   ]);

    // if (error) {
    //     console.error("Erreur lors de l'insertion dans Supabase :", error);
    //     return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    // }

    res.status(200).json({ success: true, message: 'Données reçues avec succès.' });
});

module.exports = router;
