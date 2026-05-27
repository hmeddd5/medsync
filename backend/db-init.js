async function initDb(pool) {
  console.log("[DB-INIT] Démarrage de l'initialisation de la base de données...");

  // 1. Création des tables si elles n'existent pas
  const schemaQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('DOCTOR', 'NURSE', 'RECEPTIONIST')),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      appointment_date TIMESTAMPTZ NOT NULL,
      reason VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clinical_notes (
      id SERIAL PRIMARY KEY,
      patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      author_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      note_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id SERIAL PRIMARY KEY,
      patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      medication_name VARCHAR(100) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      instructions VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(100);
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS address VARCHAR(255);
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
  `;

  await pool.query(schemaQuery);
  console.log("[DB-INIT] Tables et colonnes validées avec succès.");

  // 2. Injection des données de test si la table staff est vide
  const staffCount = await pool.query("SELECT COUNT(*) FROM staff");
  if (parseInt(staffCount.rows[0].count, 10) === 0) {
    console.log("[DB-INIT] Table staff vide. Injection des comptes par défaut...");
    await pool.query(`
      INSERT INTO staff (email, password_hash, role, first_name, last_name) VALUES
        ('doctor@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'DOCTOR', 'Gregory', 'House'),
        ('nurse@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'NURSE', 'Jackie', 'Peyton'),
        ('reception@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'RECEPTIONIST', 'Pam', 'Beesly')
      ON CONFLICT (email) DO NOTHING;
    `);
  }

  // 3. Injection des patients de test si la table patients est vide
  const patientsCount = await pool.query("SELECT COUNT(*) FROM patients");
  if (parseInt(patientsCount.rows[0].count, 10) === 0) {
    console.log("[DB-INIT] Table patients vide. Injection des données de démonstration...");
    await pool.query(`
      INSERT INTO patients (first_name, last_name, phone, email, address, status) VALUES
        ('Aminata', 'Diallo', '+221 77 123 45 67', 'aminata.diallo@email.com', 'Dakar, Plateau', 'ACTIVE'),
        ('Mamadou', 'Fall', '+221 78 987 65 43', 'mamadou.fall@email.com', 'Dakar, Médina', 'ACTIVE');
    `);

    // Injection des rendez-vous
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
      VALUES (
        (SELECT id FROM patients LIMIT 1),
        (SELECT id FROM staff WHERE role = 'DOCTOR' LIMIT 1),
        NOW() + INTERVAL '1 day',
        'Consultation initiale',
        'SCHEDULED'
      );
    `);

    // Injection des notes et ordonnances
    await pool.query(`
      INSERT INTO clinical_notes (patient_id, author_id, note_text)
      VALUES (
        (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
        (SELECT id FROM staff WHERE email = 'doctor@clinic.com' LIMIT 1),
        'Le patient se plaint de violents maux de tête récurrents. Pas de fièvre signalée. Suspicion de migraine ophtalmique. Repos recommandé.'
      );
    `);

    await pool.query(`
      INSERT INTO clinical_notes (patient_id, author_id, note_text)
      VALUES (
        (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
        (SELECT id FROM staff WHERE email = 'nurse@clinic.com' LIMIT 1),
        'Prise de tension : 12/8 (normale). Rythme cardiaque régulier. Patient calme mais fatigué.'
      );
    `);

    await pool.query(`
      INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, instructions)
      VALUES (
        (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
        (SELECT id FROM staff WHERE email = 'doctor@clinic.com' LIMIT 1),
        'Paracétamol 1000mg',
        '1 comprimé',
        'Toutes les 6 heures en cas de douleur (Maximum 3g par jour) pendant 3 jours.'
      );
    `);
  }

  console.log("[DB-INIT] Initialisation de la base de données terminée avec succès.");
}

module.exports = { initDb };
