const express = require('express');
const router = express.Router();

// Exemple de route pour obtenir tous les projets
router.get('/', (req, res) => {
    console.log("Récupération de la liste des projets");
    // TODO: Implémenter la logique avec Supabase
    res.status(501).json({ message: 'Non implémenté.' });
});

// Exemple de route pour créer une nouvelle dépense pour un projet
router.post('/:projectId/expenses', (req, res) => {
    const { projectId } = req.params;
    const expense = req.body;
    console.log(`Ajout d'une dépense au projet ${projectId}:`, expense);
    // TODO: Implémenter la logique avec Supabase (upload photo, etc.)
    res.status(501).json({ message: 'Non implémenté.' });
});

module.exports = router;
