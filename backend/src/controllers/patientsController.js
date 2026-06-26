import pool from "../config/database.js";

export const getPatients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        birth_date AS "birthDate",
        gender,
        phone,
        email,
        address,
        allergies,
        chronic_conditions AS "chronicConditions",
        status,
        created_at AS "createdAt"
      FROM patients
      ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement des patients" });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        birth_date AS "birthDate",
        gender,
        phone,
        email,
        address,
        allergies,
        chronic_conditions AS "chronicConditions",
        status,
        created_at AS "createdAt"
      FROM patients
      WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement du patient" });
  }
};

export const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      gender,
      phone,
      email,
      address,
      allergies,
      chronicConditions,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients (
        first_name,
        last_name,
        birth_date,
        gender,
        phone,
        email,
        address,
        allergies,
        chronic_conditions
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING 
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        birth_date AS "birthDate",
        gender,
        phone,
        email,
        address,
        allergies,
        chronic_conditions AS "chronicConditions",
        status,
        created_at AS "createdAt"`,
      [
        firstName,
        lastName,
        birthDate || null,
        gender || null,
        phone || null,
        email || null,
        address || null,
        allergies || null,
        chronicConditions || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du patient" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      gender,
      phone,
      email,
      address,
      allergies,
      chronicConditions,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE patients
       SET 
        first_name = $1,
        last_name = $2,
        birth_date = $3,
        gender = $4,
        phone = $5,
        email = $6,
        address = $7,
        allergies = $8,
        chronic_conditions = $9,
        status = $10
       WHERE id = $11
       RETURNING 
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        birth_date AS "birthDate",
        gender,
        phone,
        email,
        address,
        allergies,
        chronic_conditions AS "chronicConditions",
        status,
        created_at AS "createdAt"`,
      [
        firstName,
        lastName,
        birthDate || null,
        gender || null,
        phone || null,
        email || null,
        address || null,
        allergies || null,
        chronicConditions || null,
        status || "ACTIVE",
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du patient" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM patients WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    res.json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du patient" });
  }
};