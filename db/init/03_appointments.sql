CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
    CHECK (status IN ('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO appointments (
  patient_id,
  staff_id,
  appointment_date,
  reason,
  status
)
VALUES
(
  1,
  1,
  '2026-06-03 09:00:00-04',
  'Suivi hypertension',
  'CONFIRMED'
),
(
  2,
  1,
  '2026-06-03 10:30:00-04',
  'Contrôle respiratoire',
  'PENDING'
)
ON CONFLICT DO NOTHING;