import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
};

/** En dev sans VITE_API_URL : appels relatifs → proxy Vite → backend. */
function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:5001";
}

/** Liste + création patients (chemin court ; le backend accepte aussi /api/patients). */
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

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const apiBase = apiBaseUrl();

  const loadPatients = useCallback(async () => {
    setError(null);
    setLoading(true);
    const url = patientsUrl(apiBase);
    try {
      const res = await fetch(url);
      const payload = await parseJsonResponse(res);

      if (!res.ok) {
        const msg =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String((payload as { error?: string }).error)
            : typeof payload === "string"
              ? payload
              : res.statusText;
        throw new Error(`Erreur ${res.status} : ${msg}`);
      }

      if (!Array.isArray(payload)) {
        throw new Error("Réponse inattendue du serveur (pas une liste).");
      }
      setPatients(payload as Patient[]);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de contacter le serveur (réseau ou CORS).";
      setPatients([]);
      setError(
        message.includes("Failed to fetch") || message.includes("NetworkError")
          ? "Impossible de joindre l’API. Lance npm run dev à la racine du projet (ou npm start dans backend + npm run dev dans frontend)."
          : message
      );
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const url = patientsUrl(apiBase);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      const payload = await parseJsonResponse(res);

      if (!res.ok) {
        const msg =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String((payload as { error?: string }).error)
            : typeof payload === "string"
              ? payload
              : res.statusText;
        setFormError(msg);
        return;
      }

      setFirstName("");
      setLastName("");
      await loadPatients();
    } catch (err: unknown) {
      console.error(err);
      setFormError(
        err instanceof Error && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))
          ? "Impossible de joindre l’API."
          : err instanceof Error
            ? err.message
            : "Erreur réseau."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: CSSProperties = {
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    font: "inherit",
    width: "min(100%, 220px)",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        marginTop: "50px",
        color: "var(--text-h)",
        padding: "0 1rem 2rem",
      }}
    >
      <h1>Patients</h1>

      <div style={{ marginBottom: "1rem", minHeight: "1.5rem" }}>
        {loading && <p style={{ margin: 0 }}>Chargement des patients…</p>}
        {error && (
          <div style={{ marginTop: loading ? 8 : 0 }}>
            <p style={{ color: "crimson", margin: "0 0 8px" }}>{error}</p>
            <button
              type="button"
              onClick={() => void loadPatients()}
              style={{
                padding: "0.4rem 0.9rem",
                font: "inherit",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--code-bg)",
                color: "var(--text-h)",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      <section
        style={{
          maxWidth: 420,
          margin: "0 auto 2rem",
          padding: "1.25rem",
          border: "1px solid var(--border)",
          borderRadius: 8,
          textAlign: "left",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Nouveau patient</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="firstName" style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              style={inputStyle}
              maxLength={100}
              disabled={submitting}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="lastName" style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              style={inputStyle}
              maxLength={100}
              disabled={submitting}
            />
          </div>
          {formError && (
            <p style={{ color: "crimson", margin: "0 0 0.75rem", fontSize: "0.95rem" }} role="alert">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "0.5rem 1rem",
              font: "inherit",
              borderRadius: 6,
              border: "1px solid var(--accent-border)",
              background: "var(--accent-bg)",
              color: "var(--text-h)",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Enregistrement…" : "Ajouter"}
          </button>
        </form>
      </section>

      {!loading && !error && patients.length === 0 && <p>Aucun patient enregistré.</p>}

      {!loading && patients.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          {patients.map((patient, index) => (
            <div
              key={patient.id ?? `patient-${index}`}
              style={{
                border: "1px solid var(--border)",
                margin: "10px auto",
                padding: "10px",
                maxWidth: 400,
                borderRadius: 6,
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Prénom :</strong> {String(patient?.firstName ?? "")}
                <br />
                <strong>Nom :</strong> {String(patient?.lastName ?? "")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
