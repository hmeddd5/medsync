# Plateforme Clinique - Guide du Projet & Préparation aux Entretiens

Ce document explique le projet de façon simple. Il t'aidera à comprendre chaque étape et à l'expliquer lors d'un entretien, même pour des personnes moins techniques.

---

## Le Plan sur 2 Semaines (Roadmap type Epic Systems / Cerner)

Pour construire une plateforme complète (comme celles utilisées dans les vrais hôpitaux), voici comment nous allons répartir le travail, étape par étape :

**Semaine 1 : Les Fondations et la Gestion de Base**
*   **Étape 1 : Architecture (Terminé ✅)** - Relier le Frontend (ce qu'on voit sur l'écran) au Backend (le moteur en coulisse) et à la Base de données (la mémoire qui stocke l'info).
*   **Étape 2 : Sécurité et Accès (En cours 🔄)** - Créer un système de connexion sécurisée (Login) avec des rôles différents (Médecin, Infirmière).
*   **Étape 3 : Gestion des Rendez-vous** - Permettre de prendre, modifier et annuler des rendez-vous avec un calendrier interactif.
*   **Étape 4 : Dossier Patient** - Créer une fiche détaillée pour chaque patient (historique, poids, taille, allergies).

**Semaine 2 : Le Cœur Médical**
*   **Étape 5 : Consultations** - Permettre au médecin d'écrire des notes cliniques pendant un rendez-vous (le résumé de la visite).
*   **Étape 6 : Prescriptions et Médicaments** - Ajouter la possibilité de prescrire des médicaments et de noter si le patient a une réaction (allergie ou effet secondaire).
*   **Étape 7 : Dashboard (Tableau de bord)** - Une page d'accueil récapitulative pour le médecin avec ses rendez-vous du jour et les alertes urgentes.
*   **Étape 8 : Finalisation et Design Premium** - Améliorer le visuel (couleurs, animations) pour avoir un rendu très professionnel et facile à utiliser.

---

## Étape 1 : Initialisation du Projet (Validée ✅)

**Titre du Commit à utiliser :** `Init : configuration initiale du projet (React, Node, base de données)`

### Ce que nous avons fait (explications simples) :
1. **Frontend avec React** : C'est la partie "visuelle" du site (les boutons, les formulaires, l'affichage). Nous avons créé une page simple qui affiche la liste des patients.
2. **Backend avec Node.js** : C'est le "cerveau" ou le serveur du site. Il reçoit les demandes du Frontend (ex: "Affiche-moi les patients") et va chercher les bonnes informations.
3. **Base de données avec PostgreSQL et Docker** : C'est la "mémoire". Elle stocke les noms et prénoms des patients. Nous utilisons **Docker** (un outil qui crée des "boîtes" isolées appelées conteneurs) pour installer facilement cette base de données sans compliquer la configuration de ton ordinateur.
4. **La connexion entre tout ça** : Nous avons fait en sorte que le Frontend (React) arrive à parler au Backend (Node.js), qui lui-même arrive à lire et écrire dans la Base de données (PostgreSQL).

### 💡 Points à aborder en entretien (Comment l'expliquer) :

*   **Comment est structuré ton projet ?**
    *   *Réponse :* "J'utilise **React** pour mon Frontend (l'interface utilisateur visible) et **Node.js** pour mon Backend (le serveur invisible qui gère la logique). Toutes les données sont sauvegardées de manière structurée dans une base de données **PostgreSQL**."
*   **Pourquoi utilises-tu Docker ?**
    *   *Réponse :* "J'utilise Docker pour ma base de données. Ça permet de créer un conteneur (une petite machine virtuelle très légère). L'avantage, c'est que n'importe quel développeur peut lancer le projet facilement, sans avoir besoin d'installer et de configurer la base de données à la main sur son ordinateur."
*   **Comment le Frontend et le Backend se parlent-ils ?**
    *   *Réponse :* "Ils communiquent via une **API** (une sorte de pont ou de messager entre deux programmes). Le Frontend demande des informations via l'API, et le Backend lui répond avec les données demandées."
*   **C'est quoi Vite ? (l'outil utilisé avec React)**
    *   *Réponse :* "Vite est l'outil qui fait tourner mon Frontend pendant que je code. Il est très rapide et met à jour la page web instantanément (ce qu'on appelle le Hot Module Replacement ou HMR) à chaque fois que je sauvegarde mon code, ce qui me fait gagner beaucoup de temps."
