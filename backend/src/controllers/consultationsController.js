import pool from "../config/database.js";

export const getConsultations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        c.doctor_id AS "doctorId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        c.consultation_date AS "consultationDate",
        c.diagnosis,
        c.notes
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN staff s ON s.id = c.doctor_id
      ORDER BY c.consultation_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement des consultations",
      error: error.message,
    });
  }
};

export const getConsultationById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        c.doctor_id AS "doctorId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        c.consultation_date AS "consultationDate",
        c.diagnosis,
        c.notes
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN staff s ON s.id = c.doctor_id
      WHERE c.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement de la consultation",
      error: error.message,
    });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const { patientId, doctorId, consultationDate, diagnosis, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Le patient est obligatoire" });
    }

    const result = await pool.query(
      `
      INSERT INTO consultations (
        patient_id,
        doctor_id,
        consultation_date,
        diagnosis,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        patient_id AS "patientId",
        doctor_id AS "doctorId",
        consultation_date AS "consultationDate",
        diagnosis,
        notes
      `,
      [
        patientId,
        doctorId || 1,
        consultationDate || new Date(),
        diagnosis || null,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la consultation",
      error: error.message,
    });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const { patientId, doctorId, consultationDate, diagnosis, notes } = req.body;

    const result = await pool.query(
      `
      UPDATE consultations
      SET
        patient_id = $1,
        doctor_id = $2,
        consultation_date = $3,
        diagnosis = $4,
        notes = $5
      WHERE id = $6
      RETURNING
        id,
        patient_id AS "patientId",
        doctor_id AS "doctorId",
        consultation_date AS "consultationDate",
        diagnosis,
        notes
      `,
      [
        patientId,
        doctorId || 1,
        consultationDate || new Date(),
        diagnosis || null,
        notes || null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la modification de la consultation",
      error: error.message,
    });
  }
};

export const deleteConsultation = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM consultations WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }

    res.json({ message: "Consultation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la consultation",
      error: error.message,
    });
  }
};