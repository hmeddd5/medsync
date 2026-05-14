import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Login from "./pages/Login";
import Appointments from "./pages/Appointments";
import { useAuth } from "./context/AuthContext";
import "./App.css"; // We'll need to create this for the sidebar

export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
};

function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:5001";
}

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

function PatientsView() {
  const { token, user, logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const apiBase = apiBaseUrl();

  const loadPatients = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    const url = patientsUrl(apiBase);
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
  }, [apiBase, token, logout]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(patientsUrl(apiBase), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error("Erreur serveur");
      setFirstName(""); setLastName("");
      await loadPatients();
    } catch (err: unknown) {
      setFormError("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: CSSProperties = {
    padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text-h)", width: "100%", boxSizing: "border-box",
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Dossiers Patients</h1>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {loading && <p>Chargement des patients…</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>

      {user?.role === 'RECEPTIONIST' && (
        <section style={{ maxWidth: 420, margin: "0 0 2rem", padding: "1.25rem", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)" }}>
          <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Nouveau patient</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>Prénom</label>
              <input value={firstName} onChange={(ev) => setFirstName(ev.target.value)} style={inputStyle} required disabled={submitting} />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>Nom</label>
              <input value={lastName} onChange={(ev) => setLastName(ev.target.value)} style={inputStyle} required disabled={submitting} />
            </div>
            {formError && <p style={{ color: "crimson" }}>{formError}</p>}
            <button type="submit" disabled={submitting} style={{ padding: "0.5rem 1rem", borderRadius: 6, border: "none", background: "#0ea5e9", color: "white", fontWeight: 600, cursor: "pointer", width: "100%" }}>
              {submitting ? "Enregistrement…" : "Ajouter au dossier"}
            </button>
          </form>
        </section>
      )}

      {!loading && !error && patients.length === 0 && <p>Aucun patient enregistré.</p>}

      {!loading && patients.length > 0 && (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{patient.lastName.toUpperCase()} {patient.firstName}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text)" }}>ID Patient : #{patient.id}</p>
              </div>
              <button className="btn-outline">Dossier complet</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState("appointments");

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
        {currentRoute === 'patients' && <PatientsView />}
      </main>
    </div>
  );
}

export default App;
