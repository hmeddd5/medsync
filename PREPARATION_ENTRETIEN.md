# Préparation aux Entretiens - Plateforme Clinique (EpicClinical Web)

Ce document regroupe les questions techniques et méthodologiques types que les recruteurs ou tech leads peuvent poser lors d'un entretien de recrutement au sujet de ce projet, ainsi que les réponses clés pour valoriser ton travail.

---

## 💡 Questions / Réponses type

### Q1: Comment fonctionne la sécurité dans ton application ?
* **Réponse :** "La sécurité repose sur deux piliers :
  1. **L'authentification par JWT** : Une fois connecté, l'utilisateur reçoit un token crypté (JWT) stocké de manière sécurisée qui valide son identité à chaque requête API.
  2. **L'autorisation par rôles (RBAC)** : Côté backend, j'ai mis en place des middlewares de vérification qui s'assurent que le rôle de l'utilisateur connecté (ex: `DOCTOR`, `NURSE` ou `RECEPTIONIST`) possède les droits requis pour exécuter l'action demandée (comme prescrire un médicament ou planifier un rendez-vous). Côté frontend, l'interface s'adapte dynamiquement pour masquer ou désactiver les actions non autorisées selon le rôle."

### Q2: Pourquoi avoir créé un statut d'archivage au lieu de supprimer le patient de la base de données ?
* **Réponse :** "Dans le secteur médical, la réglementation (notamment HIPAA) interdit généralement la suppression immédiate et définitive des données de santé d'un patient pour des raisons légales et de traçabilité. J'ai donc implémenté un système de **suppression logique (Soft Delete)** via un statut `ARCHIVED` en base de données. Le patient est retiré des flux actifs et masqué de l'interface principale, mais reste disponible dans un historique dédié d'archivage pour être restauré si besoin."

### Q3: Comment as-tu structuré ta base de données pour ce projet ?
* **Réponse :** "J'ai conçu un schéma relationnel sous **PostgreSQL** avec plusieurs tables liées par des clés étrangères pour garantir l'intégrité des données :
  - `users` : gère le personnel de la clinique (rôles, mots de passe hashés de manière sécurisée avec bcrypt).
  - `patients` : stocke les informations administratives et démographiques (nom, prénom, téléphone, adresse, statut d'archivage).
  - `appointments` : lie un patient à un médecin avec une date, un motif et un statut de rendez-vous.
  - `medical_records` & `prescriptions` : stockent l'historique clinique rédigé par les praticiens."

### Q4: Comment as-tu optimisé l'ergonomie et l'interface utilisateur ?
* **Réponse :** "Mon objectif était de concevoir une application qui offre une expérience premium loin des designs génériques. J'ai configuré un système de design moderne :
  - Choix de polices élégantes (`Outfit` pour les titres, `Plus Jakarta Sans` pour le texte).
  - Effets de survol discrets, animations fluides et utilisation de verre dépoli (`backdrop-filter: blur(8px)`) pour les fenêtres modales.
  - Importance accordée à l'accessibilité avec un contraste renforcé pour les formulaires de saisie pour s'assurer que le texte écrit soit toujours parfaitement lisible quel que soit le navigateur."
