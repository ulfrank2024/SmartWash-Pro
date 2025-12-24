const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erreur: Les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
