CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  gender VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(255),
  address TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO patients (
  first_name,
  last_name,
  birth_date,
  gender,
  phone,
  email,
  address,
  allergies,
  chronic_conditions,
  status
)
VALUES
(
  'Marc',
  'Dubois',
  '1962-03-13',
  'Homme',
  '+1 514 555 0190',
  'marc.dubois@email.com',
  'Montréal, Québec',
  'Aucune',
  'Hypertension, diabète',
  'ACTIVE'
),
(
  'Nadia',
  'Karim',
  '1988-07-21',
  'Femme',
  '+1 514 555 0123',
  'nadia.karim@email.com',
  'Laval, Québec',
  'Pénicilline',
  'Asthme',
  'ACTIVE'
)
ON CONFLICT DO NOTHING;