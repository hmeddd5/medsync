const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { authenticateToken } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
// Étape 4 : Importation des routes du dossier médical (notes et prescriptions)
const recordRoutes = require("./routes/records");

const app = express();

const BOOT = new Date().toISOString();
const SERVER_FILE = __filename;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Pour éviter tout blocage CORS en production avec Render, on autorise dynamiquement toutes les origines.
      // La sécurité de l'API est assurée par la validation des tokens JWT.
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="fr"><meta charset="utf-8"><title>API clinical-platform</title>
<body style="font-family:system-ui;padding:1.5rem">
  <h1>API clinical-platform</h1>
  <p>Si tu vois cette page, tu es bien sur le <strong>backend</strong> (Node / Express).</p>
  <p><small>Démarrage : <code>${BOOT}</code><br>Fichier : <code>${SERVER_FILE}</code></small></p>
  <ul>
    <li><a href="/health">GET /health</a></li>
    <li><a href="/api/health">GET /api/health</a></li>
    <li><a href="/patients">GET /patients</a></li>
    <li><a href="/api/patients">GET /api/patients</a> (identique)</li>
  </ul>
</body></html>`);
});

async function healthHandler(_req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ ok: false, reason: "DATABASE_URL manquant (fichier backend/.env)" });
  }
  try {
    await pool.query("SELECT 1");
    return res.json({ ok: true, database: "connected", boot: BOOT });
  } catch (err) {
    console.error(err);
    return res.status(503).json({
      ok: false,
      reason: "Connexion Postgres impossible",
      detail: err.message,
      boot: BOOT,
    });
  }
}

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

async function listPatients(req, res) {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant : copie backend/.env.example vers backend/.env");
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }
  
  // Par défaut, on ne retourne que les patients actifs ('ACTIVE')
  const status = req.query.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";

  try {
    const { rows } = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", phone, email, address, status
       FROM patients
       WHERE status = $1
       ORDER BY id`,
      [status]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

// Étape 4 : Récupérer les informations d'un seul patient par son ID
// Cette route est accessible par tout le personnel connecté (Docteurs, Infirmiers, Réceptionnistes)
// car tout le monde a besoin d'identifier le patient.
async function getPatientById(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }
  const { id } = req.params; // On extrait l'id passé dans l'URL (ex: /api/patients/3)
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", phone, email, address, created_at AS "createdAt"
       FROM patients
       WHERE id = $1`,
      [id] // Requête paramétrée sécurisée
    );

    // Si aucun patient ne possède cet ID
    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient introuvable dans la base de données." });
    }

    res.json(rows[0]); // Renvoie le patient trouvé sous forme d'objet JSON
  } catch (err) {
    console.error("Erreur lors de la récupération du patient par ID:", err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

const MAX_NAME_LEN = 100;

function parsePatientBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Envoie un objet JSON { firstName, lastName, phone, email, address }." };
  }
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (!firstName) return { error: "Le prénom (firstName) est requis." };
  if (!lastName) return { error: "Le nom (lastName) est requis." };
  if (firstName.length > MAX_NAME_LEN) {
    return { error: `Le prénom ne doit pas dépasser ${MAX_NAME_LEN} caractères.` };
  }
  if (lastName.length > MAX_NAME_LEN) {
    return { error: `Le nom ne doit pas dépasser ${MAX_NAME_LEN} caractères.` };
  }
  return { firstName, lastName, phone, email, address };
}

async function createPatient(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }

  // Seuls les réceptionnistes ont le droit de créer des dossiers patients
  if (req.user && req.user.role !== 'RECEPTIONIST') {
    return res.status(403).json({ error: "Seul le personnel de réception peut créer un dossier patient." });
  }

  const parsed = parsePatientBody(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO patients (first_name, last_name, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, email, address`,
      [parsed.firstName, parsed.lastName, parsed.phone, parsed.email, parsed.address]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

// Étape 4.5 : Changer le statut (Archiver/Restaurer) d'un dossier patient
// Seule la réception et les médecins ont cette habilitation.
async function updatePatientStatus(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }

  // Règle d'autorisation (RBAC) : Seuls DOCTOR ou RECEPTIONIST peuvent archiver/réactiver
  if (req.user && req.user.role !== 'RECEPTIONIST' && req.user.role !== 'DOCTOR') {
    return res.status(403).json({ error: "Seul le personnel de réception ou les médecins peuvent archiver/restaurer un dossier patient." });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'ACTIVE' && status !== 'ARCHIVED') {
    return res.status(400).json({ error: "Statut invalide. Utilisez 'ACTIVE' ou 'ARCHIVED'." });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE patients 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, email, address, status`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient introuvable." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut du patient:", err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

async function updatePatient(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }

  // Règle d'autorisation (RBAC) : Seuls RECEPTIONIST ou DOCTOR peuvent éditer un dossier patient
  if (req.user && req.user.role !== 'RECEPTIONIST' && req.user.role !== 'DOCTOR') {
    return res.status(403).json({ error: "Seul le personnel de réception ou les médecins peuvent modifier un dossier patient." });
  }

  const { id } = req.params;
  const parsed = parsePatientBody(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE patients 
       SET first_name = $1, last_name = $2, phone = $3, email = $4, address = $5
       WHERE id = $6 
       RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, email, address, status`,
      [parsed.firstName, parsed.lastName, parsed.phone, parsed.email, parsed.address, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient introuvable." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur lors de la modification du patient:", err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

// Route Auth
app.use("/api/auth", authRoutes(pool));

// Route Appointments
app.use("/api/appointments", appointmentRoutes(pool));

// Étape 4 : Brancher le routeur des dossiers médicaux sous le préfixe /api/records
app.use("/api/records", recordRoutes(pool));

// Les deux chemins : ancien front / proxy, ou préfixe /api.
// On sécurise l'accès avec authenticateToken
app.get("/patients", authenticateToken, listPatients);
app.post("/patients", authenticateToken, createPatient);
app.get("/api/patients", authenticateToken, listPatients);
app.post("/api/patients", authenticateToken, createPatient);

// Étape 4 : Déclaration des routes pour obtenir un patient par son ID
app.get("/patients/:id", authenticateToken, getPatientById);
app.get("/api/patients/:id", authenticateToken, getPatientById);

// Étape 4.5 : Routes d'archivage/restauration du patient
app.patch("/patients/:id/status", authenticateToken, updatePatientStatus);
app.patch("/api/patients/:id/status", authenticateToken, updatePatientStatus);

// Routes pour modifier les détails du patient
app.put("/patients/:id", authenticateToken, updatePatient);
app.put("/api/patients/:id", authenticateToken, updatePatient);

app.use((req, res) => {
  res.status(404).json({
    error: "Route inconnue sur l’API clinical-platform",
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    boot: BOOT,
    try: ["GET /patients", "POST /patients", "GET /api/patients", "POST /api/patients"],
  });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======== clinical-platform API ========");
  console.log(`Fichier : ${SERVER_FILE}`);
  console.log(`Démarrage : ${BOOT}`);
  console.log(`Écoute  : http://127.0.0.1:${PORT}`);
  console.log("Routes patients : GET|POST /patients et GET|POST /api/patients");
  console.log("========================================");
});
