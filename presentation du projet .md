# SmartWash Pro - Système de Gestion IoT Multi-Sites

## 📌 Vision
Solution Fullstack pour automatiser, monitorer et auditer des stations de lavage auto au Cameroun depuis l'étranger (Canada). Le système lie le matériel physique (ESP32 + Monnayeurs) à un Dashboard Web (React/Node).

## 🛠 Stack Technique
- **Frontend:** React.js, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, Socket.io (Temps Réel)
- **Database:**  Supabase (PostgreSQL, Authentification, Stockage)
- **Hardware:** ESP32 (C++), MQTT/HTTP, Monnayeurs Multi-pièces

## 📂 Structure du Projet
- `/frontend`: Dashboard React pour Admin & Investisseurs.
- `/backend`: API Node.js et gestion des flux IoT.
- `/firmware`: Code C++ pour les ESP32 (Maître et Esclaves).
- `/docs`: Documentation technique et Schémas de câblage.

## 🚀 Objectifs Prioritaires
1. Suivi financier anti-fraude (Monnayeur -> Cloud).
2. Gestion du chantier (CAPEX/Photos) pour les investisseurs.
3. Monitoring temps réel des 10 postes de lavage.

# Architecture des Données & Flux

## 1. Modèle de Données (Supabase/PostgreSQL)
- **Sites:** (id, nom, ville, budget_prev, statut_construction)
- **Transactions:** (id, station_id, montant_cfa, duree, timestamp)
- **Expenses:** (id, site_id, categorie, montant, photo_url, valide_par_admin)
- **Attendance:** (id, employe_id, badge_rfid, check_in, check_out)

## 2. États des Stations (IoT)
L'ESP32 doit envoyer les états suivants :
- `AVAILABLE` (Vert)
- `BUSY` (Orange - Décompte en cours)
- `OFFLINE` (Gris - Perte de connexion)
- `ERROR` (Rouge - Blocage monnayeur ou panne)

## 3. Sécurité & Audit
- Chaque transaction doit être logguée avant d'être validée.
- Comparaison entre `Total_Electronique` et `Caisse_Physique` pour détecter les écarts.

# Roadmap de Développement

## ✅ Étape 1 : Initialisation (En cours)
- [ ] Setup du repository Git.
- [ ] Architecture de la base de données PostgreSQL.
- [ ] Module "Construction" (Saisie des dépenses et upload de photos).

## 🏗 Étape 2 : Connectivité IoT (Dès le 24/12)
- [ ] Création de l'endpoint API `/api/v1/iot/collect`.
- [ ] Simulation d'envoi de données JSON depuis l'ESP32 vers le Backend.
- [ ] Gestion du mode Offline (Stockage local ESP32).

## 📊 Étape 3 : Dashboard React
- [ ] Vue "Investisseur" (Suivi du budget de construction).
- [ ] Vue "Live" (État des 10 postes avec Socket.io).
- [ ] Graphiques financiers (Revenus journaliers/mensuels).

## 🔒 Étape 4 : RH & Maintenance
- [ ] Gestion des accès par badges RFID.
- [ ] Calcul automatique des paies et bonus.

- Architecture en Microservices
- Nous allons découper l'application en services indépendants qui communiquent - via une API Gateway ou un Message Broker (RabbitMQ/MQTT).

1. auth-service (Node.js/Supabase)
Rôle : Gestion des utilisateurs (Admin, Investisseurs, Employés).

Fonction : Login JWT, Permissions (RBAC), Profils. Supabase gérera l'authentification.

2. project-service (Node.js+ Firebase Storage)
Rôle : Suivi de la construction (CAPEX).

Fonction : Gestion des phases de chantier, upload des reçus, suivi du budget initial.

3. iot-ingestion-service (Node.js/Go + MQTT/Redis)
Rôle : Le point d'entrée des ESP32.

Fonction : Réception des impulsions des monnayeurs, état "Live" des machines, stockage temporaire dans Redis pour une vitesse maximale.

4. finance-service (Node.js/Supabase)
Rôle : Le "Grand Livre" comptable.

Fonction : Calcul des revenus, Revenue Split (Investisseurs), rapports fiscaux, détection des fraudes. Supabase hébergera les données financières.

5. notification-service (Node.js)
Rôle : Alertes.

Fonction : Push Firebase (mobile), SMS pour les pannes critiques, Emails pour les rapports mensuels.

smartwash-pro/
├── README.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── docker-compose.yml       # Pour lancer tous les services d'un coup
├── services/
│   ├── auth-service/        # Port 5001
│   ├── project-service/     # Port 5002
│   ├── iot-service/         # Port 5003
│   └── finance-service/     # Port 5004
├── gateway/                 # Nginx ou Kong (Port 80/443)
└── frontend/                # React App (Consomme la Gateway)

## 🌐 Communication inter-services
- **Interne:** Les services communiquent via gRPC ou via un Broker (RabbitMQ) pour les événements asynchrones (ex: Une transaction validée déclenche une mise à jour dans le service Finance).
- **Externe:** Le Frontend React communique uniquement avec la **Gateway**.

## 💾 Stratégie de Base de Données
- Chaque microservice possède sa propre base de données (Database per Service) pour garantir l'indépendance. 
- Utilisation de Supabase (basé sur PostgreSQL) pour la consistance transactionnelle et les fonctionnalités BaaS (Finance/Auth, Stockage, Authentification).