CREATE TABLE IF NOT EXISTS prescriptions (

    id SERIAL PRIMARY KEY,

    consultation_id INTEGER
        REFERENCES consultations(id)
        ON DELETE CASCADE,

    medication VARCHAR(255),

    dosage VARCHAR(255),

    instructions TEXT
);