import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Login from "./pages/Login";
import Appointments from "./pages/Appointments";
import { useAuth } from "./context/AuthContext";
// Étape 4 : Importation de la nouvelle page de détail du patient
import PatientDetail from "./pages/PatientDetail";
import { apiBaseUrl } from "./config";
import "./App.css"; // We'll need to create this for the sidebar

export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
};

function patientsUrl(apiBase: string): string {
  const path = "/patients";
  if (!apiBase) return path;
  return `${apiBase}${path}`.replace(/([^:])\/\//g, "$1/");
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

// Étape 4 : Modification du composant PatientsView pour accepter la fonction onOpenDetail
// comme propriété (prop), afin de notifier le composant parent (App) lors du clic sur un dossier.
function PatientsView({ onOpenDetail }: { onOpenDetail: (patientId: number) => void }) {
  const { token, user, logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatientId, setEditPatientId] = useState<number | null>(null);

  function closeForm() {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditPatientId(null);
    setShowAddModal(false);
  }

  function startEdit(patient: Patient) {
    setFirstName(patient.firstName);
    setLastName(patient.lastName);
    setPhone(patient.phone || "");
    setEmail(patient.email || "");
    setAddress(patient.address || "");
    setEditPatientId(patient.id);
    setShowAddModal(true);
  }

  const apiBase = apiBaseUrl();

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const reverseFullName = `${p.lastName} ${p.firstName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      reverseFullName.includes(query) ||
      p.id.toString().includes(query) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query))
    );
  });

  const loadPatients = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    const url = `${patientsUrl(apiBase)}?status=${showArchived ? 'ARCHIVED' : 'ACTIVE'}`;
    try {
      const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      const payload = await parseJsonResponse(res);

      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      setPatients(payload as Patient[]);
    } catch (err: unknown) {
      setError("Impossible de joindre l’API.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, logout, showArchived]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const url = editPatientId 
        ? `${patientsUrl(apiBase)}/${editPatientId}` 
        : patientsUrl(apiBase);
      const method = editPatientId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim()
        }),
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error("Erreur serveur");
      closeForm();
      await loadPatients();
    } catch (err: unknown) {
      setFormError("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePatientStatus(id: number, currentStatus: string) {
    if (!token) return;
    const nextStatus = currentStatus === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    const confirmMessage = nextStatus === "ARCHIVED"
      ? "Êtes-vous sûr de vouloir archiver ce dossier patient (sortie du système) ?"
      : "Voulez-vous réactiver ce dossier patient ?";
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`${patientsUrl(apiBase)}/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de changement de statut");
      }
      await loadPatients();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="view-container">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "30px" }}>
        <h1 style={{ margin: 0 }}>Dossiers Patients</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {!showArchived && user?.role === 'RECEPTIONIST' && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ margin: 0 }}>
              + Nouveau patient
            </button>
          )}
          {(user?.role === 'RECEPTIONIST' || user?.role === 'DOCTOR') && (
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", background: "var(--bg-card)", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", margin: 0 }}>
              <input 
                type="checkbox" 
                checked={showArchived} 
                onChange={(e) => setShowArchived(e.target.checked)} 
                style={{ width: "auto", margin: 0, padding: 0, pointerEvents: "auto" }} 
              />
              Afficher les dossiers archivés
            </label>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {loading && <p>Chargement des patients…</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>

      {!loading && !error && patients.length > 0 && (
        <div className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un patient (Nom, Prénom, Téléphone, ID...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <p>{showArchived ? "Aucun dossier archivé." : "Aucun patient actif enregistré."}</p>
      )}

      {!loading && !error && patients.length > 0 && filteredPatients.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "20px" }}>
          Aucun patient ne correspond à votre recherche.
        </p>
      )}

      {!loading && !error && filteredPatients.length > 0 && (
        <div className="table-responsive">
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom complet</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Adresse</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className={patient.status === 'ARCHIVED' ? 'row-archived' : ''}>
                  <td><code>#{patient.id}</code></td>
                  <td>
                    <strong>{patient.lastName.toUpperCase()}</strong> {patient.firstName}
                  </td>
                  <td>{patient.phone || <span className="text-muted">-</span>}</td>
                  <td>{patient.email || <span className="text-muted">-</span>}</td>
                  <td>{patient.address || <span className="text-muted">-</span>}</td>
                  <td>
                    <span className={`status-badge ${patient.status === 'ARCHIVED' ? 'badge-archived' : 'badge-active'}`}>
                      {patient.status === 'ARCHIVED' ? 'Archivé' : 'Actif'}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {patient.status !== 'ARCHIVED' ? (
                        <>
                          <button className="btn-outline" onClick={() => onOpenDetail(patient.id)}>
                            Dossier complet
                          </button>
                          {(user?.role === 'RECEPTIONIST' || user?.role === 'DOCTOR') && (
                            <button className="btn-outline" onClick={() => startEdit(patient)} style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                              ✏️ Modifier
                            </button>
                          )}
                          {(user?.role === 'RECEPTIONIST' || user?.role === 'DOCTOR') && (
                            <button 
                              className="btn-archive"
                              onClick={() => togglePatientStatus(patient.id, 'ACTIVE')} 
                            >
                              Archiver
                            </button>
                          )}
                        </>
                      ) : (
                        (user?.role === 'RECEPTIONIST' || user?.role === 'DOCTOR') && (
                          <button 
                            className="btn-reactivate"
                            onClick={() => togglePatientStatus(patient.id, 'ARCHIVED')} 
                          >
                            Réactiver
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editPatientId ? "Modifier le dossier patient" : "Enregistrer un nouveau patient"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prénom</label>
                <input value={firstName} onChange={(ev) => setFirstName(ev.target.value)} required disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input value={lastName} onChange={(ev) => setLastName(ev.target.value)} required disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input value={phone} onChange={(ev) => setPhone(ev.target.value)} placeholder="ex: +221 77 123 45 67" disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Adresse Email</label>
                <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="ex: patient@email.com" disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Adresse Domicile</label>
                <input value={address} onChange={(ev) => setAddress(ev.target.value)} placeholder="ex: Dakar, Medina" disabled={submitting} />
              </div>
              {formError && <p style={{ color: "crimson", fontSize: "13px", fontWeight: "600" }}>{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={submitting}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ margin: 0 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  
  // Étape 4 : Déclaration de nos états de routage. 
  // currentRoute contient le nom de la vue active ('appointments', 'patients', 'patient-detail')
  // selectedPatientId contient l'identifiant du patient dont on consulte le dossier médical
  const [currentRoute, setCurrentRoute] = useState("appointments");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  if (isLoading) {
    return <div style={{ marginTop: 50, textAlign: "center" }}>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>EpicClinical</h2>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">{user?.firstName.charAt(0)}{user?.lastName.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentRoute === 'appointments' ? 'active' : ''}`}
            onClick={() => setCurrentRoute('appointments')}
          >
            <span className="icon">📅</span> Planning & Agenda
          </button>
          <button 
            className={`nav-item ${currentRoute === 'patients' ? 'active' : ''}`}
            onClick={() => setCurrentRoute('patients')}
          >
            <span className="icon">📁</span> Dossiers Patients
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={logout}>
            <span className="icon">🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {currentRoute === 'appointments' && <Appointments />}
        
        {/* Étape 4 : Si la route est 'patients', on passe le callback qui change la route vers le détail */}
        {currentRoute === 'patients' && (
          <PatientsView 
            onOpenDetail={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentRoute("patient-detail");
            }} 
          />
        )}
        
        {/* Étape 4 : Si la route est 'patient-detail', on rend le composant PatientDetail */}
        {currentRoute === 'patient-detail' && selectedPatientId && (
          <PatientDetail 
            patientId={selectedPatientId} 
            onBack={() => {
              setSelectedPatientId(null);
              setCurrentRoute("patients");
            }} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
