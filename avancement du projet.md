# Avancement du Projet SmartWash Pro

## ✅ Étape 1 : Initialisation
- [ ] Setup du repository Git.
- [x] Architecture de la base de données (Passage à Supabase).
- [x] Module "Construction" (Saisie des dépenses et upload de photos).
- [x] Création des répertoires des microservices.
- [x] Installation des dépendances des microservices (Node.js + Supabase client).
- [x] Configuration des variables d'environnement (Supabase URL/Key) pour les microservices.
- [x] Mise à jour des documents de conception (`.md`) pour refléter l'utilisation de Supabase.

## 🏗 Étape 2 : Connectivité IoT (Dès le 24/12)
- [x] Création de l'endpoint API `/api/v1/iot/collect`.
- [x] Simulation d'envoi de données JSON depuis l'ESP32 vers le Backend.
- [ ] Gestion du mode Offline (Stockage local ESP32).

## ✅ Étape 3 : Dashboard React
- [x] Création du répertoire pour le frontend (`frontend/dashboard`).
- [x] Initialisation de l'application React (`create-react-app`).
- [x] Configuration de Tailwind CSS dans l'application React.
- [x] Vue "Investisseur" (Suivi du budget de construction).
- [x] Vue "Live" (État des 10 postes avec Socket.io).
- [x] Graphiques financiers (Revenus journaliers/mensuels).

## ✅ Étape 4 : RH & Maintenance
- [x] Gestion des accès par badges RFID.
- [x] Calcul automatique des paies et bonus.

## ✅ Étape 5 : Améliorations UI/UX
- [x] Rendre l'application responsive.
- [x] Implémenter un menu hamburger responsive pour la navigation mobile.
- [x] Rendre le fond de l'overlay du menu mobile semi-transparent.
- [x] Placer le bouton de fermeture du menu mobile (icône croix) à l'intérieur de l'overlay du menu.

## 💡 Améliorations futures du Frontend
- [ ] Implémenter la vue "Timeline (Gantt)" pour le suivi de construction (Module A).
- [x] Développer l'interface d'Audit de Caisse (Module C).
- [ ] Ajouter les contrôles à distance pour les postes de lavage (Module B).
- [x] Améliorer la visualisation des états des stations (IoT) avec des indicateurs clairs.
- [ ] Implémenter la page de "Logs d'erreurs" et "Maintenance Préventive" (Module D).