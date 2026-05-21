-- ===================================================
-- AJOUT DE CHAMPS DE CONTACT AUX PATIENTS (Étape 4.5)
-- ===================================================
-- Cette migration ajoute le numéro de téléphone, l'e-mail
-- et l'adresse physique pour enrichir le dossier administratif du patient.

ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- Mise à jour des patients existants avec des données fictives réalistes
UPDATE patients 
SET phone = '+221 77 123 45 67', 
    email = 'aminata.diallo@email.com', 
    address = 'Dakar, Plateau' 
WHERE last_name = 'Diallo';

UPDATE patients 
SET phone = '+221 78 987 65 43', 
    email = 'mamadou.fall@email.com', 
    address = 'Dakar, Médina' 
WHERE last_name = 'Fall';

UPDATE patients 
SET phone = '+33 6 12 34 56 78', 
    email = 'john.doe@email.com', 
    address = 'Paris, France' 
WHERE last_name = 'Doe';

UPDATE patients 
SET phone = '+221 70 555 44 33', 
    email = 'lelya.diarra@email.com', 
    address = 'Dakar, Mermoz' 
WHERE last_name = 'Diarra';
