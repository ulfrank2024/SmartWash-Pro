# Plan de Développement

Ce document liste les prochaines étapes pour l'évolution du projet, suite à l'expansion des fonctionnalités pour supporter des points de service multiples et une gestion hiérarchique.

## Phase 1: Modèles de Données Backend (Terminé)
- [x] Mettre à jour le modèle de données du `project-service` pour inclure les villes, les points de service et lier les stations de lavage aux points de service.
- [x] Mettre à jour le modèle de données de l'`auth-service` pour inclure les rôles utilisateur et lier les utilisateurs aux points de service.
- [x] Mettre à jour le `iot-service` pour associer les données IoT à des stations de lavage spécifiques.
- [x] Mettre à jour le `finance-service` pour adapter le suivi financier aux stations de lavage et aux points de service.

## Phase 2: Implémentation des Endpoints API

- [x] Implémenter les endpoints API dans le `project-service` pour créer et gérer les villes, les points de service et les stations de lavage.
- [x] Implémenter les endpoints API dans l'`auth-service` pour assigner des rôles et des points de service aux utilisateurs.
- [x] Implémenter les endpoints API dans l'`iot-service` pour récupérer les données IoT agrégées/détaillées par point de service/station de lavage.
- [x] Implémenter les endpoints API dans le `finance-service` pour l'audit de caisse et les rapports financiers par point de service/station de lavage.

## Phase 3: Implémentation Frontend

- [x] Développer le tableau de bord Admin pour la gestion des points de service (création/gestion des villes, points de service, stations de lavage).
- [x] Développer l'interface utilisateur pour l'assignation des utilisateurs (collecteurs, personnel de maintenance) aux points de service.
- [x] Améliorer la "Live View" pour permettre la sélection d'un point de service et afficher le statut en temps réel des stations de lavage de ce point.
- [x] Améliorer la "Cash Audit View" pour les collecteurs, filtrée par leur point de service assigné et comparant avec les données numériques agrégées des stations de lavage.
- [x] Améliorer les "Finance Charts" pour filtrer les données financières par point de service.