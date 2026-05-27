import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { apiBaseUrl } from "../config";
import "./PatientDetail.css";

// Déclaration de l'interface décrivant l'objet Patient
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

// Déclaration de l'interface décrivant une Note Clinique
interface ClinicalNote {
  id: number;
  noteText: string;
  createdAt: string;
  authorFirstName: string;
  authorLastName: string;
  authorRole: string;
}

// Déclaration de l'interface décrivant une Prescription (Ordonnance)
interface Prescription {
  id: number;
  medicationName: string;
  dosage: string;
  instructions: string;
  createdAt: string;
  doctorFirstName: string;
  doctorLastName: string;
}

// Composant principal du Détail du Patient
export default function PatientDetail({
  patientId,
  onBack,
}: {
  patientId: number;
  onBack: () => void;
}) {
  // Récupération de l'utilisateur connecté, de son jeton (token) et de la fonction logout
  const { user, token, logout } = useAuth();

  // États pour stocker les données chargées de l'API
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // États pour la gestion de l'affichage (chargement, erreur)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État de l'onglet actif : "notes" ou "prescriptions"
  const [activeTab, setActiveTab] = useState<"notes" | "prescriptions">("notes");

  // États pour le formulaire de saisie d'une nouvelle note clinique
  const [newNote, setNewNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // États pour le formulaire de saisie d'une nouvelle prescription
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  const base = apiBaseUrl();

  // Fonction permettant de charger les données du patient, de ses notes et ordonnances
  const loadPatientData = useCallback(async () => {
    if (!token || !user) return;
    
    // Règle HIPAA / Sécurité : les réceptionnistes n'ont pas le droit de charger ces données.
    if (user.role === "RECEPTIONIST") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Récupération des informations démographiques du patient
      const patientRes = await fetch(`${base}/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (patientRes.status === 401 || patientRes.status === 403) {
        logout();
        return;
      }
      if (!patientRes.ok) throw new Error("Impossible de charger les infos du patient.");
      const patientData = await patientRes.json();
      setPatient(patientData);

      // 2. Récupération des notes cliniques
      const notesRes = await fetch(`${base}/api/records/patients/${patientId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }

      // 3. Récupération des prescriptions
      const presRes = await fetch(`${base}/api/records/patients/${patientId}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (presRes.ok) {
        const presData = await presRes.json();
        setPrescriptions(presData);
      }

    } catch (err: unknown) {
      console.error(err);
      setError("Une erreur est survenue lors de la récupération des données cliniques.");
    } finally {
      setLoading(false);
    }
  }, [patientId, token, user, base, logout]);

  // useEffect se déclenche automatiquement au chargement du composant
  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Gestion de la soumission du formulaire d'ajout de note clinique
  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !token) return;

    setNoteSubmitting(true);
    setNoteError(null);

    try {
      const res = await fetch(`${base}/api/records/patients/${patientId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ noteText: newNote }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setNewNote(""); // Réinitialiser le champ texte
      await loadPatientData(); // Recharger le dossier pour afficher la nouvelle note

    } catch (err: any) {
      setNoteError(err.message || "Erreur serveur");
    } finally {
      setNoteSubmitting(false);
    }
  }

  // Gestion de la soumission du formulaire de prescription (Médecin uniquement)
  async function handleAddPrescription(e: FormEvent) {
    e.preventDefault();
    if (!medicationName.trim() || !dosage.trim() || !instructions.trim() || !token) return;

    setPrescriptionSubmitting(true);
    setPrescriptionError(null);

    try {
      const res = await fetch(`${base}/api/records/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicationName, dosage, instructions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la prescription.");
      }

      // Vider les champs du formulaire en cas de succès
      setMedicationName("");
      setDosage("");
      setInstructions("");
      await loadPatientData(); // Rafraîchir les ordonnances à l'écran

    } catch (err: any) {
      setPrescriptionError(err.message || "Erreur serveur");
    } finally {
      setPrescriptionSubmitting(false);
    }
  }

  // RÈGLE DE CONFIDENTIALITÉ HIPAA SIMULÉE
  // Si le membre du personnel est un réceptionniste, l'accès clinique complet lui est interdit.
  if (user?.role === "RECEPTIONIST") {
    return (
      <div className="patient-detail-container">
        <button onClick={onBack} className="btn-back">
          ← Retour à la liste
        </button>
        <div className="hipaa-access-denied">
          <div className="lock-icon">🔒</div>
          <h2>Accès Refusé - Secret Médical (Conformité HIPAA)</h2>
          <p>
            En tant que personnel de <strong>Réception</strong>, vous n'êtes pas autorisé à accéder
            au dossier de santé (notes cliniques, diagnostics et ordonnances) de ce patient.
          </p>
          <p className="hipaa-note">
            Réglementation HIPAA : Les informations de santé protégées (PHI) sont limitées au
            personnel soignant direct afin de garantir la confidentialité du patient.
          </p>
        </div>
      </div>
    );
  }

  // Écran d'attente pendant le chargement des données
  if (loading) {
    return <div className="patient-detail-loading">Chargement du dossier clinique...</div>;
  }

  // Affichage d'une erreur générale
  if (error) {
    return (
      <div className="patient-detail-container">
        <button onClick={onBack} className="btn-back">
          ← Retour
        </button>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      {/* En-tête de la page */}
      <div className="patient-detail-header">
        <button onClick={onBack} className="btn-back">
          ← Retour à la liste
        </button>
        
        {patient && (
          <div className="patient-summary-card">
            <div className="patient-avatar">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </div>
            <div className="patient-demographics">
              <h1>
                {patient.lastName.toUpperCase()} {patient.firstName}
              </h1>
              <p className="patient-meta">
                ID Patient : <code>#{patient.id}</code> | Date d'entrée :{" "}
                {new Date(patient.createdAt).toLocaleDateString()}
              </p>
              <div style={{ marginTop: "8px", fontSize: "13px", display: "flex", flexWrap: "wrap", gap: "15px", color: "var(--text)" }}>
                {patient.phone && <span>📞 <strong>Tél :</strong> {patient.phone}</span>}
                {patient.email && <span>✉️ <strong>Email :</strong> {patient.email}</span>}
                {patient.address && <span>🏠 <strong>Adresse :</strong> {patient.address}</span>}
              </div>
            </div>
            <div className="security-badge">
              <span className="shield">🛡️</span> HIPAA Sécurisé
            </div>
          </div>
        )}
      </div>

      {/* Onglets de Navigation Clinique */}
      <div className="clinical-tabs">
        <button
          className={`tab-item ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          📝 Compte-rendus & Notes Cliniques ({notes.length})
        </button>
        <button
          className={`tab-item ${activeTab === "prescriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("prescriptions")}
        >
          💊 Ordonnances & Prescriptions ({prescriptions.length})
        </button>
      </div>

      {/* ZONE CONTENU DE L'ONGLET 1 : NOTES CLINIQUES */}
      {activeTab === "notes" && (
        <div className="tab-content">
          {/* Formulaire de rédaction d'une note (Ouvert aux médecins et infirmiers) */}
          <section className="form-section">
            <h3>Rédiger une note d'observation</h3>
            <form onSubmit={handleAddNote}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Décrivez les symptômes, examens ou recommandations pour ce patient..."
                required
                disabled={noteSubmitting}
                rows={4}
              />
              {noteError && <p className="form-error">{noteError}</p>}
              <button type="submit" className="btn-primary" disabled={noteSubmitting}>
                {noteSubmitting ? "Enregistrement..." : "Enregistrer la note clinique"}
              </button>
            </form>
          </section>

          {/* Liste chronologique (Timeline) des notes */}
          <section className="records-list-section">
            <h3>Historique clinique</h3>
            {notes.length === 0 ? (
              <p className="no-records">Aucune note clinique enregistrée pour ce patient.</p>
            ) : (
              <div className="timeline">
                {notes.map((note) => (
                  <div key={note.id} className="timeline-item">
                    <div className="timeline-meta">
                      <span className="author-badge">
                        👤 {note.authorLastName} {note.authorFirstName} ({note.authorRole})
                      </span>
                      <span className="date-badge">
                        🕒 {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="timeline-body">
                      <p>{note.noteText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ZONE CONTENU DE L'ONGLET 2 : ORDONNANCES */}
      {activeTab === "prescriptions" && (
        <div className="tab-content">
          {/* Formulaire de prescription : SEUL le médecin a le droit de l'utiliser */}
          <section className="form-section">
            <h3>Nouvelle Prescription Médicamenteuse</h3>
            {user?.role === "DOCTOR" ? (
              <form onSubmit={handleAddPrescription}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom du Médicament</label>
                    <input
                      type="text"
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      placeholder="ex: Paracétamol, Amoxicilline..."
                      required
                      disabled={prescriptionSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="ex: 500mg, 1 comprimé..."
                      required
                      disabled={prescriptionSubmitting}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label>Posologie et Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="ex: 3 fois par jour après les repas pendant 5 jours..."
                    required
                    disabled={prescriptionSubmitting}
                  />
                </div>
                {prescriptionError && <p className="form-error">{prescriptionError}</p>}
                <button type="submit" className="btn-primary" disabled={prescriptionSubmitting}>
                  {prescriptionSubmitting ? "Création..." : "Émettre la prescription"}
                </button>
              </form>
            ) : (
              // Si c'est un infirmier (NURSE), le formulaire est remplacé par un avertissement
              <div className="medical-rights-warning">
                <span className="warning-icon">⚠️</span>
                <div>
                  <h4>Droits de prescription restreints</h4>
                  <p>
                    En tant qu'<strong>Infirmier</strong>, vous pouvez consulter les ordonnances
                    actives mais vous n'êtes pas habilité à prescrire de traitements. Veuillez
                    contacter le médecin titulaire si une modification est nécessaire.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Liste des ordonnances */}
          <section className="records-list-section">
            <h3>Traitements et Prescriptions en cours</h3>
            {prescriptions.length === 0 ? (
              <p className="no-records">Aucune ordonnance émise pour le moment.</p>
            ) : (
              <div className="prescription-grid">
                {prescriptions.map((pres) => (
                  <div key={pres.id} className="prescription-card">
                    <div className="prescription-card-header">
                      <h4>💊 {pres.medicationName}</h4>
                      <span className="prescription-dosage">{pres.dosage}</span>
                    </div>
                    <div className="prescription-card-body">
                      <p className="instructions">
                        <strong>Posologie :</strong> {pres.instructions}
                      </p>
                      <div className="prescription-meta">
                        <span>Signé par : Dr. {pres.doctorLastName}</span>
                        <span>Date : {new Date(pres.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
