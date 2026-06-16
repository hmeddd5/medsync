  const express = require("express");

  module.exports = (pool) => {
  const router = express.Router();

  // GET /api/appointments
  router.get("/", async (req, res) => {
    try {
      const query = `
        SELECT 
          a.id,
          a.appointment_date AS "appointmentDate",
          a.status,
          p.id AS "patientId",
          p.first_name AS "patientFirstName",
          p.last_name AS "patientLastName",
          s.id AS "staffId",
          s.full_name AS "staffName",
          s.role AS "staffRole"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN staff s ON a.staff_id = s.id
        ORDER BY a.appointment_date ASC
      `;

      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des rendez-vous." });
    }
  });

  // POST /api/appointments
    router.post("/", async (req, res) => {
    try {
      const { patientId, staffId, appointmentDate, status } = req.body;

      if (!patientId || !staffId || !appointmentDate) {
        return res.status(400).json({ error: "Veuillez fournir patientId, staffId et appointmentDate." });
      }

      const { rows } = await pool.query(
        `INSERT INTO appointments (patient_id, staff_id, appointment_date, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [patientId, staffId, appointmentDate, status || "scheduled"]
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la création du rendez-vous." });
    }
  });

  // PATCH /api/appointments/:id/status
    router.patch("/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["scheduled", "confirmed", "completed", "cancelled"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Statut invalide." });
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