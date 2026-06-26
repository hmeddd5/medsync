CREATE TABLE IF NOT EXISTS consultations (

    id SERIAL PRIMARY KEY,

    patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE CASCADE,

    doctor_id INTEGER
        REFERENCES staff(id)
        ON DELETE CASCADE,

    consultation_date TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    diagnosis TEXT,

    notes TEXT
);