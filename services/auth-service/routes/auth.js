const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase'); // Assurez-vous que le chemin est correct

// Exemple de route de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Tentative de login pour: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Erreur de connexion Supabase :", error);
            return res.status(401).json({
                message: 'Identifiants invalides.',
                message_en: 'Invalid credentials.',
                error: error.message
            });
        }

        res.status(200).json({
            message: 'Connexion réussie.',
            message_en: 'Login successful.',
            user: data.user,
            session: data.session
        });

    } catch (err) {
        console.error("Erreur inattendue lors de la connexion :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Exemple de route d'enregistrement
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Tentative d'enregistrement pour: ${email}`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error("Erreur d'enregistrement Supabase :", error);
            return res.status(400).json({
                message: 'Erreur lors de l\'enregistrement.',
                message_en: 'Registration error.',
                error: error.message
            });
        }

        // After successful sign-up, you might want to create an entry in your 'profiles' table
        // with a default role. This is a common pattern with Supabase auth.
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { user_id: data.user.id, email: data.user.email, role: 'Employee' } // Default role
            ]);

        if (profileError) {
            console.error("Erreur lors de la création du profil utilisateur :", profileError);
            // Decide how to handle this: rollback user creation or log and proceed
        }

        res.status(201).json({
            message: 'Enregistrement réussi. Veuillez vérifier votre email pour confirmer votre compte.',
            message_en: 'Registration successful. Please check your email to confirm your account.',
            user: data.user,
            session: data.session
        });

    } catch (err) {
        console.error("Erreur inattendue lors de l'enregistrement :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// Nouvelle route pour l'authentification via badge RFID
router.post('/rfid-login', async (req, res) => {
    const { rfid_tag_id } = req.body;
    console.log(`Tentative de connexion RFID pour le tag: ${rfid_tag_id}`);

    if (!rfid_tag_id) {
        return res.status(400).json({
            message: 'L\'ID du badge RFID est requis.',
            message_en: 'RFID badge ID is required.'
        });
    }

    try {
        // Supposons une table 'profiles' qui lie les utilisateurs aux tags RFID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, role, assigned_service_point_id')
            .eq('rfid_tag_id', rfid_tag_id)
            .single();

        if (profileError || !profile) {
            console.error("Erreur lors de la recherche de profil RFID ou tag non trouvé :", profileError);
            return res.status(404).json({
                message: 'Badge RFID non reconnu ou utilisateur introuvable.',
                message_en: 'RFID badge not recognized or user not found.'
            });
        }

        // Dans un vrai scénario, on pourrait générer un token ou récupérer plus de détails utilisateur.
        res.status(200).json({
            message: 'Connexion RFID réussie.',
            message_en: 'RFID login successful.',
            user_id: profile.user_id,
            role: profile.role,
            assigned_service_point_id: profile.assigned_service_point_id
        });

    } catch (err) {
        console.error("Erreur inattendue lors de la connexion RFID :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// --- USER MANAGEMENT ENDPOINTS (Admin only) ---
// PUT to update a user's role
router.put('/users/:userId/role', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body; // Expected roles: Admin, Investor, Manager, Employee, CashCollector, MaintenancePersonnel

    console.log(`Tentative de mise à jour du rôle de l'utilisateur ${userId} vers: ${role}`);

    // In a real application, you would add authentication and authorization checks here
    // e.g., ensure the requesting user is an 'Admin'

    try {
        const { data, error } = await supabase
            .from('profiles') // Assuming 'profiles' table stores roles
            .update({ role: role })
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error("Erreur lors de la mise à jour du rôle utilisateur dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de la mise à jour du rôle utilisateur.',
                message_en: 'Internal server error while updating user role.'
            });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.',
                message_en: 'User not found.'
            });
        }
        res.status(200).json({
            message: 'Rôle utilisateur mis à jour avec succès.',
            message_en: 'User role updated successfully.',
            user: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de la mise à jour du rôle utilisateur :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

// PUT to assign a user to a service point
router.put('/users/:userId/assign-service-point', async (req, res) => {
    const { userId } = req.params;
    const { service_point_id } = req.body; // Can be null to unassign

    console.log(`Tentative d'assignation de l'utilisateur ${userId} au point de service: ${service_point_id}`);

    // In a real application, you would add authentication and authorization checks here
    // e.g., ensure the requesting user is an 'Admin' and service_point_id is valid

    try {
        const { data, error } = await supabase
            .from('profiles') // Assuming 'profiles' table stores assigned service point
            .update({ assigned_service_point_id: service_point_id })
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error("Erreur lors de l'assignation du point de service à l'utilisateur dans Supabase :", error);
            return res.status(500).json({
                message: 'Erreur interne du serveur lors de l\'assignation du point de service.',
                message_en: 'Internal server error while assigning service point.'
            });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.',
                message_en: 'User not found.'
            });
        }
        res.status(200).json({
            message: 'Point de service assigné à l\'utilisateur avec succès.',
            message_en: 'Service point assigned to user successfully.',
            user: data[0]
        });
    } catch (err) {
        console.error("Erreur inattendue lors de l'assignation du point de service à l'utilisateur :", err);
        res.status(500).json({
            message: 'Erreur interne du serveur.',
            message_en: 'Internal server error.'
        });
    }
});

module.exports = router;
