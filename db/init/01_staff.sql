CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(30) NOT NULL
        CHECK (role IN ('DOCTOR','NURSE','RECEPTIONIST','ADMIN')),

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO staff
(email, password_hash, role, first_name, last_name)
VALUES
(
    'doctor@medsync.local',
    '$2b$10$8z5WzRZ8wYe7N8S7qgQh3eG2P2YwzK5j3gQ2zD6H8w8LkL7H3lX8S',
    'DOCTOR',
    'Sarah',
    'Benali'
),
(
    'reception@medsync.local',
    '$2b$10$8z5WzRZ8wYe7N8S7qgQh3eG2P2YwzK5j3gQ2zD6H8w8LkL7H3lX8S',
    'RECEPTIONIST',
    'Ahmad',
    'Errekab'
),
(
    'nurse@medsync.local',
    '$2b$10$8z5WzRZ8wYe7N8S7qgQh3eG2P2YwzK5j3gQ2zD6H8w8LkL7H3lX8S',
    'NURSE',
    'Ines',
    'Rbah'
),
(
    'admin@medsync.local',
    '$2b$10$8z5WzRZ8wYe7N8S7qgQh3eG2P2YwzK5j3gQ2zD6H8w8LkL7H3lX8S',
    'ADMIN',
    'Mourad',
    'Sehboub'
)

ON CONFLICT(email) DO NOTHING;