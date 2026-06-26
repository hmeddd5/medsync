import pool from "../config/database.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await pool.query(
      "SELECT COUNT(*) FROM patients"
    );

    const totalAppointments = await pool.query(
      "SELECT COUNT(*) FROM appointments"
    );

    const totalConsultations = await pool.query(
      "SELECT COUNT(*) FROM consultations"
    );

    const totalPrescriptions = await pool.query(
      "SELECT COUNT(*) FROM prescriptions"
    );

    const upcomingAppointments = await pool.query(`
      SELECT
        a.id,
        p.first_name || ' ' || p.last_name AS patient,
        s.first_name || ' ' || s.last_name AS doctor,
        a.appointment_date,
        a.reason,
        a.status
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN staff s ON s.id = a.staff_id
      ORDER BY a.appointment_date ASC
      LIMIT 5
    `);

    res.json({
      totalPatients: Number(totalPatients.rows[0].count),
      totalAppointments: Number(totalAppointments.rows[0].count),
      totalConsultations: Number(totalConsultations.rows[0].count),
      totalPrescriptions: Number(totalPrescriptions.rows[0].count),
      upcomingAppointments: upcomingAppointments.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement du dashboard",
      error: error.message,
    });
  }
};