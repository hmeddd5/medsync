# 🏗️ Cours d'Architecture Backend : Comprendre la Structure du Projet

Ce document t'explique comment est organisé le code de notre application et pourquoi nous faisons certains choix d'architecture (très valorisés en entretien d'embauche !).

---

## 1. Dictionnaire des Sigles Techniques (À connaître par cœur)

Dans le monde professionnel et en entretien, on utilise beaucoup de sigles. Voici ce qu'ils signifient concrètement dans notre projet :

| Sigle | Signification | Rôle dans notre projet |
| :--- | :--- | :--- |
| **API** | *Application Programming Interface* (Interface de Programmation) | C'est le "pont" qui permet à notre Frontend (React) de parler à notre Backend (Node.js). |
| **REST** | *Representational State Transfer* | C'est un style d'architecture pour concevoir les APIs. Il utilise les méthodes HTTP standards (`GET` pour lire, `POST` pour créer, `PATCH`/`PUT` pour modifier, `DELETE` pour supprimer). |
| **JWT** | *JSON Web Token* (Jeton Web JSON) | C'est comme un "badge d'accès" virtuel temporaire. Quand tu te connectes, le serveur te donne ce badge. Le Frontend le présente à chaque requête pour prouver qui il est et quel est son rôle sans avoir à ressaisir son mot de passe. |
| **RBAC** | *Role-Based Access Control* (Contrôle d'accès basé sur les rôles) | C'est la logique de sécurité : restreindre les fonctionnalités selon le rôle de l'utilisateur (ex: seul un docteur peut prescrire, seul le réceptionniste peut créer un rendez-vous). |
| **EHR / DME**| *Electronic Health Record* / *Dossier Médical Électronique* | C'est le nom de la fiche santé numérique du patient, regroupant son historique, ses notes cliniques et ses ordonnances. |
| **HIPAA** | *Health Insurance Portability and Accountability Act* | Une loi américaine très stricte sur la protection des données médicales. Dans notre projet, nous simulons cela en empêchant les réceptionnistes d'accéder aux données médicales sensibles (secret médical). |

---

## 2. Pourquoi séparer les routes dans `records.js`, `appointments.js` au lieu de tout mettre dans `server.js` ?

C'est une excellente question ! Au tout début, mettre toutes les routes dans un seul fichier `server.js` semble plus simple. Mais dans un projet professionnel, on ne fait **jamais** cela. Voici pourquoi :

### 💡 L'analogie du meuble de rangement
Imagine un bureau de secrétaire :
- **L'approche Monolithe (`server.js` unique)** : Tu ranges tous les dossiers clients, les fiches de paie, les contrats de maintenance et les plannings en vrac sur une seule et unique table. Rapidement, la table déborde, tu mets du temps à retrouver un document, et si quelqu'un renverse son café sur la table, **tout** est détruit ou inutilisable.
- **L'approche Modulaire (avec des fichiers séparés)** : Tu as un classeur étiqueté "Rendez-vous" (`appointments.js`), un classeur "Connexions" (`auth.js`), et un classeur "Dossiers Médicaux" (`records.js`). Le fichier `server.js` sert juste de bureau d'accueil : il redirige les demandes vers le bon classeur.

### Les avantages techniques concrets :

1. **La Lisibilité et la Maintenance** :
   Si ton projet grossit et possède 100 routes différentes, ton fichier `server.js` ferait plus de 3000 lignes ! Il serait impossible de s'y retrouver. En séparant, chaque fichier fait moins de 150 lignes et a un rôle unique (Principe de Responsabilité Unique ou *Single Responsibility Principle*).

2. **Le Travail en Équipe (Git)** :
   Si tu travailles à plusieurs développeurs sur le projet :
   - Si tout est dans `server.js` : deux développeurs modifiant deux fonctionnalités différentes vont modifier le même fichier au même endroit. Cela crée des **conflits Git** très pénibles à résoudre.
   - En séparant : le développeur A travaille sur `appointments.js` et le développeur B travaille sur `records.js`. Aucun risque de conflit !

3. **La Réutilisabilité** :
   En utilisant `express.Router()`, nous créons des mini-applications indépendantes. Si demain nous voulons changer de serveur ou exporter la logique des rendez-vous ailleurs, il suffit de copier-coller le fichier `appointments.js`.

---

## 3. Comment fonctionne le routage modulaire avec Express ?

Voici comment Express organise cela en coulisse :

1. Dans un fichier de route (par exemple `backend/routes/records.js`), on crée un **Router** :
   ```javascript
   const express = require("express");
   const router = express.Router();

   // On définit les routes par rapport à la racine de ce routeur
   router.get("/notes", (req, res) => { ... });
   
   module.exports = router;
   ```
2. Dans le fichier principal `backend/server.js`, on "branche" (ou monte) ce routeur sur un préfixe d'URL :
   ```javascript
   const recordsRoutes = require("./routes/records");
   
   // On dit à Express : toutes les URLs qui commencent par "/api/records"
   // doivent être gérées par le fichier records.js
   app.use("/api/records", recordsRoutes);
   ```
   *Résultat :* Si le Frontend appelle `GET /api/records/notes`, Express sait qu'il doit l'envoyer au routeur de `records.js`, qui exécutera la fonction associée à `/notes`.
