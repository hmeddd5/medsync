import pool from "../config/database.js";

export const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        a.staff_id AS "staffId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        a.appointment_date AS "appointmentDate",
        a.reason,
        a.status,
        a.created_at AS "createdAt"
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN staff s ON s.id = a.staff_id
      ORDER BY a.appointment_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement des rendez-vous" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        a.staff_id AS "staffId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        a.appointment_date AS "appointmentDate",
        a.reason,
        a.status,
        a.created_at AS "createdAt"
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN staff s ON s.id = a.staff_id
      WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement du rendez-vous" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { patientId, staffId, appointmentDate, reason, status } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments (
        patient_id,
        staff_id,
        appointment_date,
        reason,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        patient_id AS "patientId",
        staff_id AS "staffId",
        appointment_date AS "appointmentDate",
        reason,
        status,
        created_at AS "createdAt"`,
      [
        patientId,
        staffId || 1,
        appointmentDate,
        reason,
        status || "PENDING",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du rendez-vous" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { patientId, staffId, appointmentDate, reason, status } = req.body;

    const result = await pool.query(
      `UPDATE appointments
       SET
        patient_id = $1,
        staff_id = $2,
        appointment_date = $3,
        reason = $4,
        status = $5
       WHERE id = $6
       RETURNING
        id,
        patient_id AS "patientId",
        staff_id AS "staffId",
        appointment_date AS "appointmentDate",
        reason,
        status,
        created_at AS "createdAt"`,
      [
        patientId,
        staffId || 1,
        appointmentDate,
        reason,
        status || "PENDING",
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du rendez-vous" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    res.json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du rendez-vous" });
  }
};