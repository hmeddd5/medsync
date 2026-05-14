const express = require("express");
const { authenticateToken } = require("../middleware/auth");

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/appointments
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      
      let query = `
        SELECT 
          a.id, a.appointment_date AS "appointmentDate", a.reason, a.status,
          p.id AS "patientId", p.first_name AS "patientFirstName", p.last_name AS "patientLastName",
          s.id AS "doctorId", s.first_name AS "doctorFirstName", s.last_name AS "doctorLastName"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN staff s ON a.doctor_id = s.id
      `;

      const values = [];

      // Si c'est un médecin, il ne voit que ses propres rendez-vous
      if (user.role === 'DOCTOR') {
        query += ` WHERE a.doctor_id = $1`;
        values.push(user.id);
      }
      
      query += ` ORDER BY a.appointment_date ASC`;

      const { rows } = await pool.query(query, values);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des rendez-vous." });
    }
  });

  // POST /api/appointments
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      
      // Seule la réception (et peut-être Admin si implémenté plus tard) peut créer un RDV
      if (user.role !== 'RECEPTIONIST') {
        return res.status(403).json({ error: "Seul le personnel de réception peut planifier un rendez-vous." });
      }

      const { patientId, doctorId, appointmentDate, reason } = req.body;

      if (!patientId || !doctorId || !appointmentDate || !reason) {
        return res.status(400).json({ error: "Veuillez fournir toutes les informations nécessaires." });
      }

      const { rows } = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [patientId, doctorId, appointmentDate, reason]
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la création du rendez-vous." });
    }
  });

  // PATCH /api/appointments/:id/status
  router.patch("/:id/status", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Statut invalide." });
      }

      // Règles métiers : 
      // La réception peut tout faire (Annuler, etc.)
      // Un médecin peut marquer comme COMPLETED ou NO_SHOW ses propres RDVs
      if (user.role === 'DOCTOR' && status === 'CANCELLED') {
        return res.status(403).json({ error: "Un médecin ne peut pas annuler un rendez-vous (veuillez contacter la réception)." });
      }

      const { rows } = await pool.query(
        `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Rendez-vous introuvable." });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
    }
  });

  return router;
};
