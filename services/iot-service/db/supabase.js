const { createClient } = require('@supabase/supabase-js');

// Charger les variables d'environnement
require('dotenv').config(); // S'assurer que le chemin est correct

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erreur: Les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies.");
    // Ne pas faire process.exit(1) ici pour permettre au serveur de démarrer même sans DB
    // pour les tests de route de base. La gestion d'erreur se fera à l'utilisation.
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
