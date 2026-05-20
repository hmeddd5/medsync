/**
 * ====================================================================
 * ROUTER : DOSSIER MÉDICAL & PRESCRIPTIONS (backend/routes/records.js)
 * ====================================================================
 * Ce fichier définit les "routes" de l'API pour gérer les notes médicales
 * et les ordonnances des patients.
 * 
 * Qu'est-ce qu'un "Router" ?
 * C'est un sous-système d'Express qui regroupe plusieurs routes de façon
 * logique. Cela nous évite d'écrire tout le code dans `server.js`.
 */

const express = require("express");
const router = express.Router();

// Importation du "barge" de sécurité. Le middleware authenticateToken vérifie
// que l'utilisateur est bien connecté (il vérifie la signature de son jeton JWT).
const { authenticateToken } = require("../middleware/auth");

// Nous exportons une fonction qui prend en argument "pool", qui est notre
// connexion à la base de données PostgreSQL. Cela nous permet d'exécuter des requêtes SQL.
module.exports = (pool) => {

  /**
   * ==========================================
   * 1. GESTION DES NOTES CLINIQUES (COMPTES-RENDUS)
   * ==========================================
   */

  /**
   * ROUTE : GET /api/records/patients/:patientId/notes
   * RÔLE : Récupérer toutes les notes cliniques d'un patient donné.
   * DROITS : Autorisé aux médecins (DOCTOR) et infirmiers (NURSE). Interdit à la réception.
   * 
   * `:patientId` est un paramètre dynamique dans l'URL. Exemple : /api/records/patients/5/notes
   */
  router.get("/patients/:patientId/notes", authenticateToken, async (req, res) => {
    try {
      const { role } = req.user; // On extrait le rôle du jeton de l'utilisateur connecté
      const { patientId } = req.params; // On extrait l'ID du patient depuis l'URL

      // Règle de confidentialité (HIPAA) : Seul le personnel médical (médecin, infirmier) accède aux notes.
      if (role !== "DOCTOR" && role !== "NURSE") {
        return res.status(403).json({
          error: "Accès interdit. Seul le personnel médical est autorisé à consulter les données cliniques (Secret Médical)."
        });
      }

      // Requête SQL avec Jointure (JOIN) pour récupérer la note et le nom de son rédacteur
      const query = `
        SELECT 
          cn.id, 
          cn.note_text AS "noteText", 
          cn.created_at AS "createdAt",
          s.first_name AS "authorFirstName", 
          s.last_name AS "authorLastName",
          s.role AS "authorRole"
        FROM clinical_notes cn
        JOIN staff s ON cn.author_id = s.id
        WHERE cn.patient_id = $1
        ORDER BY cn.created_at DESC
      `;

      // $1 est remplacé de manière sécurisée par patientId pour éviter les injections SQL.
      const { rows } = await pool.query(query, [patientId]);
      res.json(rows); // On renvoie la liste au format JSON pour le Frontend

    } catch (err) {
      console.error("Erreur GET notes:", err);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des notes." });
    }
  });

  /**
   * ROUTE : POST /api/records/patients/:patientId/notes
   * RÔLE : Ajouter une nouvelle note clinique pour un patient.
   * DROITS : Médecins (DOCTOR) et infirmiers (NURSE) uniquement.
   */
  router.post("/patients/:patientId/notes", authenticateToken, async (req, res) => {
    try {
      const { id: authorId, role } = req.user; // ID de l'employé connecté (auteur) et son rôle
      const { patientId } = req.params;
      const { noteText } = req.body; // Récupération du corps de la requête JSON

      // Sécurité : Seul le personnel médical peut écrire des notes.
      if (role !== "DOCTOR" && role !== "NURSE") {
        return res.status(403).json({ error: "Accès refusé. Vous devez être membre du personnel soignant." });
      }

      // Validation des données entrantes
      if (!noteText || typeof noteText !== "string" || noteText.trim() === "") {
        return res.status(400).json({ error: "Le texte de la note ne peut pas être vide." });
      }

      // Requête SQL pour insérer la note dans la base de données.
      // On retourne (RETURNING *) les données insérées pour confirmer la réussite.
      const insertQuery = `
        INSERT INTO clinical_notes (patient_id, author_id, note_text)
        VALUES ($1, $2, $3)
        RETURNING id, note_text AS "noteText", created_at AS "createdAt"
      `;

      const { rows } = await pool.query(insertQuery, [patientId, authorId, noteText.trim()]);
      
      // On répond au Frontend avec un statut "201 Created" en lui renvoyant la note créée.
      res.status(201).json(rows[0]);

    } catch (err) {
      console.error("Erreur POST note:", err);
      res.status(500).json({ error: "Erreur serveur lors de la sauvegarde de la note." });
    }
  });

  /**
   * ==========================================
   * 2. GESTION DES PRESCRIPTIONS (ORDONNANCES)
   * ==========================================
   */

  /**
   * ROUTE : GET /api/records/patients/:patientId/prescriptions
   * RÔLE : Obtenir l'historique des prescriptions (ordonnances) d'un patient.
   * DROITS : Médecins (DOCTOR) et infirmiers (NURSE). Interdit aux réceptionnistes.
   */
  router.get("/patients/:patientId/prescriptions", authenticateToken, async (req, res) => {
    try {
      const { role } = req.user;
      const { patientId } = req.params;

      if (role !== "DOCTOR" && role !== "NURSE") {
        return res.status(403).json({
          error: "Accès interdit. Seule l'équipe soignante est autorisée à consulter les ordonnances."
        });
      }

      // Requête de jointure pour récupérer la prescription et les détails du médecin signataire
      const query = `
        SELECT 
          pr.id, 
          pr.medication_name AS "medicationName", 
          pr.dosage, 
          pr.instructions, 
          pr.created_at AS "createdAt",
          s.first_name AS "doctorFirstName", 
          s.last_name AS "doctorLastName"
        FROM prescriptions pr
        JOIN staff s ON pr.doctor_id = s.id
        WHERE pr.patient_id = $1
        ORDER BY pr.created_at DESC
      `;

      const { rows } = await pool.query(query, [patientId]);
      res.json(rows);

    } catch (err) {
      console.error("Erreur GET prescriptions:", err);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des prescriptions." });
    }
  });

  /**
   * ROUTE : POST /api/records/patients/:patientId/prescriptions
   * RÔLE : Émettre une nouvelle ordonnance de médicament pour un patient.
   * DROITS : Médecins (DOCTOR) UNIQUEMENT (loi clinique stricte). Les infirmiers n'ont pas ce droit !
   */
  router.post("/patients/:patientId/prescriptions", authenticateToken, async (req, res) => {
    try {
      const { id: doctorId, role } = req.user;
      const { patientId } = req.params;
      const { medicationName, dosage, instructions } = req.body;

      // Sécurité clinique stricte (RBAC) : seul le rôle DOCTOR est autorisé !
      if (role !== "DOCTOR") {
        return res.status(403).json({
          error: "Accès interdit. Seuls les médecins titulaires (DOCTOR) ont le droit légal de prescrire des ordonnances."
        });
      }

      // Validation de la saisie
      if (!medicationName || !dosage || !instructions) {
        return res.status(400).json({ error: "Veuillez fournir le nom du médicament, le dosage et la posologie." });
      }

      // Insertion dans la base de données
      const insertQuery = `
        INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, instructions)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, medication_name AS "medicationName", dosage, instructions, created_at AS "createdAt"
      `;

      const { rows } = await pool.query(insertQuery, [
        patientId,
        doctorId,
        medicationName.trim(),
        dosage.trim(),
        instructions.trim()
      ]);

      res.status(201).json(rows[0]);

    } catch (err) {
      console.error("Erreur POST prescription:", err);
      res.status(500).json({ error: "Erreur serveur lors de la création de la prescription." });
    }
  });

  return router; // On renvoie le routeur complet configuré
};
