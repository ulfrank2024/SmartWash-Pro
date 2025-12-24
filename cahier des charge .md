Vision du Projet
Créer une plateforme IoT (Internet des Objets) permettant de piloter, surveiller et rentabiliser des stations de lavage auto au Cameroun depuis n'importe où dans le monde (ex: Gatineau). Le système assure une transparence totale pour les investisseurs et une gestion simplifiée pour l'exploitant.

2. Architecture Technique (Stack)
Edge (Hardware) : ESP32 (C++) + Monnayeurs (Impulsions) + Modules Relais.

Communication : MQTT (Temps réel) et API REST (Sauvegarde/Logs).

Backend : Node.js / Express.

Base de Données : Supabase (PostgreSQL pour données structurées/finance, Authentification, Stockage pour photos).

Frontend : React.js + Tailwind CSS + Recharts.

3. Modules de l'Application (Côté Web)
🔴 MODULE A : Suivi de Construction (Avant ouverture)
C'est ici que tu gères l'argent des investisseurs pour bâtir le site.

Gestion Budgétaire (CAPEX) : Saisie des dépenses (Ciment, Tuyaux, Main d'œuvre).

Preuve par l'image : Upload de photos des reçus et de l'avancement du chantier (Firebase Storage).

Timeline (Gantt) : Suivi des étapes (Fondation -> Plomberie -> Électricité -> Montage du Rack).

Rapport Investisseur : Export PDF automatique des dépenses vs budget prévisionnel.

🟢 MODULE B : Monitoring & Opérations (En exploitation)
C'est le cœur du système une fois la station ouverte.

Dashboard Live : État des 10 postes (Libre, Occupé, Panne).

Télémétrie : Temps restant sur chaque poste, crédit inséré en direct.

Contrôle à distance : Possibilité de débloquer un poste (ex: geste commercial) ou de redémarrer le système à distance.

💰 MODULE C : Finance & Audit (Le "Mur anti-vol")
Traçabilité totale : Chaque pièce de 100/500 CFA insérée génère une ligne en base de données avec timestamp.

Audit de caisse : L'employé déclare la somme collectée ; le système compare avec le montant numérique. Écart affiché en rouge.

Répartition Automatique (Revenue Split) : Calcul automatique des dividendes (Investisseurs), des charges et de la marge nette.

👥 MODULE D : Gestion RH & Maintenance
Pointage RFID : Les employés badgent sur la station pour marquer leur présence.

Maintenance Préventive : Alerte (Push/Email) quand une pompe atteint X heures d'utilisation pour vidange.

Logs d'erreurs : Historique des coupures de courant ou de déconnexion Wi-Fi.

4. Spécifications du Firmware (Côté ESP32)
Mode Offline First : Si le Wi-Fi tombe, l'ESP32 stocke les transactions dans sa mémoire Flash et les synchronise dès le retour du réseau.

Sécurité : Cryptage léger des données envoyées pour éviter qu'un petit malin ne simule des fausses pièces via le réseau.

Watchdog : Redémarrage automatique du système en cas de plantage du code.

5. Modèle de Données (Schéma Supabase/PostgreSQL Simplifié)
Sites : Nom, ville, budget total.

Machines : ID, type (Esclave/Maître), état actuel.

Transactions : Montant, durée, date, machine_id.

Dépenses : Catégorie, montant, photo_reçu.

Utilisateurs : Rôles (Admin, Investisseur, Manager, Employé).