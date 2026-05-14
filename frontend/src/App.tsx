import { useEffect, useState } from "react";

/** En dev sans VITE_API_URL : appels relatifs → proxy Vite → backend. */
function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:5000";
}

function App() {
  const [patients, setPatients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBase = apiBaseUrl();

  useEffect(() => {
    const url = `${apiBase}/patients`.replace(/([^:])\/\//g, "$1/");

    fetch(url)
      .then(async (response) => {
        const bodyText = await response.text();
        let payload: unknown = bodyText;
        try {
          payload = bodyText ? JSON.parse(bodyText) : null;
        } catch {
          // pas du JSON
        }

        if (!response.ok) {
          const msg =
            typeof payload === "object" && payload !== null && "error" in payload
              ? String((payload as { error?: string }).error)
              : bodyText || response.statusText;
          throw new Error(`Erreur ${response.status} : ${msg}`);
        }

        return payload as typeof patients;
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Réponse inattendue du serveur (pas une liste).");
        }
        console.log("Données reçues :", data);
        setPatients(data);
      })
      .catch((err: unknown) => {
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de contacter le serveur (réseau ou CORS).";
        setError(
          message.includes("Failed to fetch") || message.includes("NetworkError")
            ? "Impossible de joindre l’API. Ouvre un terminal à la racine du projet et lance : npm install puis npm run dev (cela démarre le backend et Vite). Ou dans deux terminaux : dossier backend → npm start, dossier frontend → npm run dev."
            : message
        );
      });
  }, [apiBase]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", color: "var(--text-h)" }}>
      <h1>Liste des patients</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {patients.length > 0 ? (
        <div style={{ marginTop: '20px' }}>
          {patients.map((patient) => (
            <div key={patient.id} style={{ border: '1px solid #444', margin: '10px', padding: '10px' }}>
              <p>
                <strong>Prénom :</strong> {patient.firstName} <br />
                <strong>Nom :</strong> {patient.lastName}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !error && <p>Chargement des patients...</p>
      )}
    </div>
  );
}

export default App;