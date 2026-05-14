CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: doctor_id devrait en théorie correspondre à un membre du staff dont le rôle est DOCTOR.
-- Cette validation complexe peut être gérée au niveau de l'API (Backend).

-- Injection d'un rendez-vous de test dans le futur pour que le Dr. House le voie
INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
VALUES (
  (SELECT id FROM patients LIMIT 1),
  (SELECT id FROM staff WHERE role = 'DOCTOR' LIMIT 1),
  NOW() + INTERVAL '1 day',
  'Consultation initiale',
  'SCHEDULED'
);
