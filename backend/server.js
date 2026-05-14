const express = require("express");
const cors = require("cors");

const app = express();

// Configuration précise du CORS pour autoriser votre frontend Vite
// Dans backend/server.js
// Front Vite (port par défaut 5173). Si ton terminal affiche un autre port, ajoute-le ici.
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.send("API fonctionne 🚀");
});

// Route pour récupérer les patients
app.get("/patients", (req, res) => {
  const patients = [
    { id: 1, firstName: "Aminata", lastName: "Diallo" },
    { id: 2, firstName: "Mamadou", lastName: "Fall" }
  ];

  res.json(patients);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://127.0.0.1:${PORT}`);
});