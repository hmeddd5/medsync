CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('DOCTOR', 'NURSE', 'RECEPTIONIST')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Le mot de passe pour ces comptes est : password123
INSERT INTO staff (email, password_hash, role, first_name, last_name) VALUES
  ('doctor@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'DOCTOR', 'Gregory', 'House'),
  ('nurse@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'NURSE', 'Jackie', 'Peyton'),
  ('reception@clinic.com', '$2b$10$69TPR0QyRTX.r1knlneLgOuEVTwNT1LlQ8mye6YzOnEG5ku5EmP6q', 'RECEPTIONIST', 'Pam', 'Beesly')
ON CONFLICT (email) DO NOTHING;
