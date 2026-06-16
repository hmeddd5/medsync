  async function initDb(pool) {
  console.log("[DB-INIT] Initialisation de la base de données MedyIA...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      role VARCHAR(50) NOT NULL,
      email VARCHAR(150) UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      staff_id INTEGER REFERENCES staff(id),
      appointment_date TIMESTAMPTZ NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clinical_notes (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES staff(id),
      diagnosis TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES staff(id),
      medication VARCHAR(150),
      dosage VARCHAR(100),
      frequency VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS patient_details (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER UNIQUE REFERENCES patients(id),
      phone VARCHAR(30),
      email VARCHAR(150),
      allergies TEXT,
      chronic_conditions TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS patient_archive (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      archive_reason TEXT,
      archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const patientsCount = await pool.query("SELECT COUNT(*) FROM patients");

  if (parseInt(patientsCount.rows[0].count, 10) === 0) {
    console.log("[DB-INIT] Insertion des données MedyIA...");

    await pool.query(`
      INSERT INTO patients (first_name, last_name) VALUES
      ('Akram', 'Boughlala'),
      ('Ahmad', 'Errakab');

      INSERT INTO staff (full_name, role, email) VALUES
      ('Mourad Sehboub', 'doctor', 'mourad@mediai.local'),
      ('John Tremblay', 'doctor', 'john@mediai.local'),
      ('Jane Doe', 'nurse', 'jane@mediai.local'),
      ('Ines Rbah', 'admin', 'ines@mediai.local');

      INSERT INTO appointments (patient_id, staff_id, appointment_date, status) VALUES
      (1,1,'2026-06-15 09:00:00','confirmed'),
      (2,1,'2026-06-15 10:00:00','scheduled'),
      (1,2,'2026-06-15 11:00:00','confirmed');

      INSERT INTO clinical_notes (patient_id, doctor_id, diagnosis, notes) VALUES
      (1,1,'Hypertension','Patient présente une tension artérielle élevée'),
      (2,2,'Asthme','Contrôle respiratoire recommandé');

      INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency) VALUES
      (1,1,'Amlodipine','5mg','1 fois par jour'),
      (2,2,'Salbutamol','100mcg','Au besoin');

      INSERT INTO patient_details (patient_id, phone, email, allergies, chronic_conditions) VALUES
      (1,'5141111111','akram@mediai.local','Aucune','Hypertension'),
      (2,'5142222222','ahmad@mediai.local','Pénicilline','Asthme');

      INSERT INTO patient_archive (patient_id, archive_reason) VALUES
      (2,'Ancien dossier conservé pour démonstration');
    `);
  }

  console.log("[DB-INIT] Base de données MedyIA prête.");
}

  module.exports = { initDb };