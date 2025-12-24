# Avancement du Projet SmartWash Pro

## ✅ Étape 1 : Initialisation
- [ ] Setup du repository Git.
- [x] Architecture de la base de données (Passage à Supabase).
- [ ] Module "Construction" (Saisie des dépenses et upload de photos).
- [x] Création des répertoires des microservices.
- [x] Installation des dépendances des microservices (Node.js + Supabase client).
- [x] Configuration des variables d'environnement (Supabase URL/Key) pour les microservices.
- [x] Mise à jour des documents de conception (`.md`) pour refléter l'utilisation de Supabase.

## 🏗 Étape 2 : Connectivité IoT (Dès le 24/12)
- [x] Création de l'endpoint API `/api/v1/iot/collect`.
- [x] Simulation d'envoi de données JSON depuis l'ESP32 vers le Backend.
- [ ] Gestion du mode Offline (Stockage local ESP32).

## 📊 Étape 3 : Dashboard React
- [ ] Vue "Investisseur" (Suivi du budget de construction).
- [ ] Vue "Live" (État des 10 postes avec Socket.io).
- [ ] Graphiques financiers (Revenus journaliers/mensuels).

## 🔒 Étape 4 : RH & Maintenance
- [ ] Gestion des accès par badges RFID.
- [ ] Calcul automatique des paies et bonus.