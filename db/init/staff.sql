CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('DOCTOR', 'NURSE', 'RECEPTIONIST')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mot de passe: password123
INSERT INTO staff (email, password_hash, role, first_name, last_name)
VALUES
(
  'doctor@medsync.local',
  '$123',
  'DOCTOR',
  'Sarah',
  'Benali'
)
ON CONFLICT (email) DO NOTHING;