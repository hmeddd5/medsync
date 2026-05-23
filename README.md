# Plateforme Clinique - Guide du Projet & Préparation aux Entretiens

Ce document explique le fonctionnement de la plateforme clinique étape par étape. Il t'aidera à comprendre chaque fonctionnalité et à l'expliquer simplement lors d'un entretien de recrutement.

---

## Le Plan Réalisé (Roadmap Technique)

Toutes les étapes du projet ont été complétées avec succès :
1. **Étape 1 : Fondations et Architecture** ✅ (React, Node.js, Express, PostgreSQL, Docker)
2. **Étape 2 : Authentification et Sécurité (RBAC)** ✅ (Gestion des Rôles : Médecin, Infirmier, Réceptionniste)
3. **Étape 3 : Agenda de la Clinique** ✅ (Prise, modification et annulation sécurisée de rendez-vous)
4. **Étape 4 & 4.5 : Dossiers Patients Clinique & Archivage** ✅ (Coordonnées complètes, archivage conforme et sécurité HIPAA)
5. **Étape 5 & 6 : Notes Cliniques & Prescriptions** ✅ (Timeline des visites et gestion d'ordonnances)
6. **Étape 8 : Refonte Visuelle et Design Premium** ✅ (Polices Google Fonts, thème Indigo/Cyan, micro-animations, verre dépoli)

---

## 🛠️ Détail des Étapes Réalisées

### Étape 1 : Initialisation & Architecture
- **Frontend** : Application construite avec **React** et **Vite** pour un affichage rapide et dynamique.
- **Backend** : Serveur API avec **Node.js** et **Express** pour traiter les requêtes métiers.
- **Base de données** : **PostgreSQL** hébergé dans un conteneur **Docker** pour isoler et faciliter l'installation du système de stockage de données.

---

### Étape 2 : Sécurité et Gestion des Accès (Rôles & RBAC)
Nous avons mis en place une gestion des utilisateurs basée sur les rôles (Role-Based Access Control) sécurisée par des jetons **JWT** (JSON Web Tokens).
- **Médecin (DOCTOR)** : Accès en lecture seule sur l'agenda global, droit de consulter et d'éditer les dossiers cliniques complets (notes et prescriptions).
- **Infirmière (NURSE)** : Droit de consulter les rendez-vous et d'ajouter des observations de base.
- **Réceptionniste (RECEPTIONIST)** : Gestion complète du planning et de l'agenda, création de dossiers patients. Interdiction absolue d'accéder aux informations médicales sensibles.

---

### Étape 3 : Agenda et Planification
- Un calendrier d'agenda clinique répertorie les rendez-vous de la journée.
- **Sécurité métier** : Seul le réceptionniste peut créer et annuler des rendez-vous. Le médecin et le réceptionniste peuvent valider qu'un rendez-vous est terminé.

---

### Étape 4 & 4.5 : Fiche Patient Détaillée & Système d'Archivage
- **Champs démographiques** : Ajout du numéro de téléphone, de l'adresse email et de l'adresse de domicile pour chaque patient.
- **Système d'Archivage (Sortie du système)** : Pour respecter les réglementations médicales (non-destruction définitive immédiate des données de santé), un patient n'est pas "supprimé" mais **archivé** (statut `ARCHIVED`).
- Les dossiers archivés sont isolés dans un filtre spécial ("Afficher les dossiers archivés"), grisés visuellement, et peuvent être restaurés en un clic si nécessaire.
- **Conformité HIPAA** : Si un réceptionniste tente de cliquer sur le "Dossier complet" (médical) d'un patient, un écran d'interdiction HIPAA moderne s'affiche pour bloquer l'accès.

---

### Étape 5 & 6 : Notes de Consultation et Ordonnances
- Les médecins peuvent rédiger des notes cliniques qui s'affichent sous forme de **Timeline** chronologique.
- Ajout d'un système de prescriptions médicales permettant de renseigner le médicament, la posologie, et les détails de l'ordonnance.

---

### Étape 8 : Refonte Visuelle & Thème Premium
- **Polices Premium** : Utilisation de `Outfit` pour les titres (rendu géométrique moderne) et `Plus Jakarta Sans` pour les textes.
- **Transitions & Survol** : Effets de translation discrète sur les cartes, boutons arrondis soignés et surbrillances colorées.
- **Superpositions Modernes** : Utilisation de `backdrop-filter: blur(8px)` pour donner un aspect de verre dépoli aux modaux.
- **Contraste de sécurité** : Colorisation forcée des formulaires de saisie en fond blanc et texte sombre pour éliminer tout risque d'écriture invisible.

---

## 💡 Préparation aux Entretiens : Questions / Réponses type

### Q1: Comment fonctionne la sécurité dans ton application ?
*   **Réponse :** "La sécurité repose sur deux piliers :
    1.  **L'authentification par JWT** : Une fois connecté, l'utilisateur reçoit un token crypté qui valide son identité à chaque requête API.
    2.  **L'autorisation par rôles (RBAC)** : Côté backend, j'ai des middlewares qui vérifient si le rôle (ex: `DOCTOR` ou `RECEPTIONIST`) a le droit d'exécuter l'action (comme prescrire un médicament ou annuler un rendez-vous). Côté frontend, l'interface s'adapte dynamiquement pour masquer ou désactiver les actions non autorisées."

### Q2: Pourquoi avoir créé un statut d'archivage au lieu de supprimer le patient de la base de données ?
*   **Réponse :** "Dans le domaine de la santé, la réglementation interdit généralement de supprimer définitivement les données médicales d'un patient pour des raisons de traçabilité et de responsabilité légale. J'ai donc implémenté un système de **suppression logique (Soft Delete)** via un statut `ARCHIVED` en base de données. Le patient est retiré des flux actifs mais reste disponible pour restauration."

### Q3: Comment as-tu structuré ta base de données pour ce projet ?
*   **Réponse :** "J'ai conçu un schéma relationnel sous **PostgreSQL** avec plusieurs tables reliées par des clés étrangères :
    - `users` : gère le personnel médical (rôles, mots de passe hashés avec bcrypt).
    - `patients` : stocke les informations administratives (nom, prénom, téléphone, statut d'archivage).
    - `appointments` : lie un patient à un médecin avec une date, un motif et un statut.
    - `medical_records` & `prescriptions` : stockent l'historique clinique rédigé par les praticiens."

### Q4: Comment as-tu optimisé l'ergonomie et l'interface utilisateur ?
*   **Réponse :** "J'ai banni le design générique pour créer une interface premium et aérée. J'ai importé des polices modernes (`Plus Jakarta Sans` & `Outfit`), implémenté des ombres portées douces, des micro-animations de transition au survol des cartes, et des fenêtres modales en verre dépoli (glassmorphism). J'ai aussi veillé au contraste des inputs pour garantir l'accessibilité dans tous les navigateurs."
