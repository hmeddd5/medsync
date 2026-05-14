import { useEffect, useState } from "react";

function App() {
  const [patients, setPatients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Utilisation de l'IP directe pour éviter les problèmes de résolution localhost
    fetch("http://127.0.0.1:5000/patients")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Données reçues :", data);
        setPatients(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de contacter le serveur.");
      });
  }, []);

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