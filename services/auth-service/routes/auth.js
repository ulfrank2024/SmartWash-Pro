const express = require('express');
const router = express.Router();

// Exemple de route de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Tentative de login pour: ${email}`);
    // TODO: Implémenter la logique de login avec Supabase
    res.status(501).json({ message: 'Login non implémenté.' });
});

// Exemple de route d'enregistrement
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    console.log(`Tentative d'enregistrement pour: ${email}`);
    // TODO: Implémenter la logique d'enregistrement avec Supabase
    res.status(501).json({ message: 'Register non implémenté.' });
});

module.exports = router;
