-- ===================================================
-- SYSTEME D'ARCHIVAGE DES PATIENTS (Étape 4.5)
-- ===================================================
-- Cette migration ajoute un statut de dossier (ACTIVE ou ARCHIVED)
-- pour gérer les sorties de patients sans suppression définitive des données.

ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- Par précaution, on s'assure que tous les patients existants sont bien actifs
UPDATE patients SET status = 'ACTIVE' WHERE status IS NULL;
