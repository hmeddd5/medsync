import pool from "../config/database.js";

export const getPrescriptions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pr.id,
        pr.consultation_id AS "consultationId",
        pr.medication,
        pr.dosage,
        pr.instructions,
        c.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        c.doctor_id AS "doctorId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        c.consultation_date AS "consultationDate",
        c.diagnosis
      FROM prescriptions pr
      JOIN consultations c ON c.id = pr.consultation_id
      JOIN patients p ON p.id = c.patient_id
      JOIN staff s ON s.id = c.doctor_id
      ORDER BY pr.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement des prescriptions",
      error: error.message,
    });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        pr.id,
        pr.consultation_id AS "consultationId",
        pr.medication,
        pr.dosage,
        pr.instructions,
        c.patient_id AS "patientId",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        c.doctor_id AS "doctorId",
        s.first_name AS "doctorFirstName",
        s.last_name AS "doctorLastName",
        c.consultation_date AS "consultationDate",
        c.diagnosis
      FROM prescriptions pr
      JOIN consultations c ON c.id = pr.consultation_id
      JOIN patients p ON p.id = c.patient_id
      JOIN staff s ON s.id = c.doctor_id
      WHERE pr.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Prescription introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement de la prescription",
      error: error.message,
    });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const { consultationId, medication, dosage, instructions } = req.body;

    if (!consultationId) {
      return res.status(400).json({ message: "La consultation est obligatoire" });
    }

    if (!medication) {
      return res.status(400).json({ message: "Le médicament est obligatoire" });
    }

    const result = await pool.query(
      `
      INSERT INTO prescriptions (
        consultation_id,
        medication,
        dosage,
        instructions
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        consultation_id AS "consultationId",
        medication,
        dosage,
        instructions
      `,
      [
        consultationId,
        medication,
        dosage || null,
        instructions || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la prescription",
      error: error.message,
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { consultationId, medication, dosage, instructions } = req.body;

    const result = await pool.query(
      `
      UPDATE prescriptions
      SET
        consultation_id = $1,
        medication = $2,
        dosage = $3,
        instructions = $4
      WHERE id = $5
      RETURNING
        id,
        consultation_id AS "consultationId",
        medication,
        dosage,
        instructions
      `,
      [
        consultationId,
        medication,
        dosage || null,
        instructions || null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Prescription introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la modification de la prescription",
      error: error.message,
    });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM prescriptions WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Prescription introuvable" });
    }

    res.json({ message: "Prescription supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la prescription",
      error: error.message,
    });
  }
};