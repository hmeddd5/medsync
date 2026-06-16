-- ==========================================
-- ÉTAPE 4 : CRÉATION DU SCHÉMA DOSSIER MÉDICAL
-- ==========================================
-- Ce fichier définit les tables requises pour gérer les notes cliniques et les ordonnances.
-- Il utilise des clés étrangères pour relier ces données aux patients et aux employés (staff).

-- 1. TABLE DES NOTES CLINIQUES (Compte-rendus médicaux)
-- Cette table stocke les comptes-rendus écrits par les médecins ou infirmiers lors des examens.
CREATE TABLE IF NOT EXISTS clinical_notes (
  id SERIAL PRIMARY KEY, -- Identifiant unique de la note
  
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- patient_id lie la note à un patient.
  -- ON DELETE CASCADE signifie : si on supprime le patient, toutes ses notes sont supprimées automatiquement.
  
  author_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  -- author_id lie la note au membre du personnel qui l'a rédigée (Médecin ou Infirmier).
  
  note_text TEXT NOT NULL,
  -- note_text contient le compte-rendu médical sans limite de taille (type TEXT).
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- created_at enregistre la date et l'heure exactes de création de la note (fuseau horaire compris).
);

-- 2. TABLE DES PRESCRIPTIONS (Ordonnances)
-- Cette table contient les traitements médicamenteux prescrits par les médecins uniquement.
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY, -- Identifiant unique de l'ordonnance
  
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- patient_id lie l'ordonnance à un patient.
  
  doctor_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  -- doctor_id lie l'ordonnance au médecin qui l'a signée.
  
  medication_name VARCHAR(100) NOT NULL,
  -- medication_name stocke le nom du médicament (ex: "Amoxicilline"). Limitée à 100 caractères.
  
  dosage VARCHAR(100) NOT NULL,
  -- dosage stocke la dose (ex: "500mg" ou "1 comprimé").
  
  instructions VARCHAR(255) NOT NULL,
  -- instructions stocke la posologie (ex: "Matin et soir pendant 7 jours").
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- created_at enregistre la date et l'heure d'émission de l'ordonnance.
);

-- 3. AJOUT DE DONNÉES DE TEST
-- Ces données nous permettent de vérifier immédiatement que la page fonctionne bien.

-- Note clinique de test par le Dr. House pour le patient Aminata Diallo
INSERT INTO clinical_notes (patient_id, author_id, note_text)
VALUES (
  (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
  (SELECT id FROM staff WHERE email = 'mourad@mediai.local' LIMIT 1),
  'Le patient se plaint de violents maux de tête récurrents. Pas de fièvre signalée. Suspicion de migraine ophtalmique. Repos recommandé.'
);

-- Note clinique de test par l'infirmière Jackie pour le patient Aminata Diallo
INSERT INTO clinical_notes (patient_id, author_id, note_text)
VALUES (
  (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
  (SELECT id FROM staff WHERE email = 'nurse@clinic.com' LIMIT 1),
  'Prise de tension : 12/8 (normale). Rythme cardiaque régulier. Patient calme mais fatigué.'
);

-- Ordonnance de test par le Dr. House pour le patient Aminata Diallo
INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, instructions)
VALUES (
  (SELECT id FROM patients WHERE last_name = 'Diallo' LIMIT 1),
  (SELECT id FROM staff WHERE email = 'mourad@mediai.local' LIMIT 1),
  'Paracétamol 1000mg',
  '1 comprimé',
  'Toutes les 6 heures en cas de douleur (Maximum 3g par jour) pendant 3 jours.'
);
