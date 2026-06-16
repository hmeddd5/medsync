CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL,
  email VARCHAR(150) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Le mot de passe pour ces comptes est : password123
INSERT INTO staff (full_name, role, email) VALUES
('Mourad Sehboub', 'doctor', 'mourad@mediai.local'),
('John Tremblay', 'doctor', 'john@mediai.local'),
('Jane Doe', 'nurse', 'elisa@mediai.local'),
('Ines Rbah', 'admin', 'ines@mediai.local');
