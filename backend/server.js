const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { authenticateToken } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");

const app = express();

const BOOT = new Date().toISOString();
const SERVER_FILE = __filename;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// En dev : tout port localhost / 127.0.0.1 (Vite peut être 5173, 5174, …)
const isDevBrowserOrigin = (origin) =>
  !origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isDevBrowserOrigin(origin));
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

async function listPatients(_req, res) {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant : copie backend/.env.example vers backend/.env");
    return res.status(500).json({ error: "Configuration serveur incomplète (DATABASE_URL)." });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName"
       FROM patients
       ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

const MAX_NAME_LEN = 100;

function parsePatientBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Envoie un objet JSON { firstName, lastName }." };
  }
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  if (!firstName) return { error: "Le prénom (firstName) est requis." };
  if (!lastName) return { error: "Le nom (lastName) est requis." };
  if (firstName.length > MAX_NAME_LEN) {
    return { error: `Le prénom ne doit pas dépasser ${MAX_NAME_LEN} caractères.` };
  }
  if (lastName.length > MAX_NAME_LEN) {
    return { error: `Le nom ne doit pas dépasser ${MAX_NAME_LEN} caractères.` };
  }
  return { firstName, lastName };
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
      `INSERT INTO patients (first_name, last_name)
       VALUES ($1, $2)
       RETURNING id, first_name AS "firstName", last_name AS "lastName"`,
      [parsed.firstName, parsed.lastName]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur base de données", detail: err.message });
  }
}

// Route Auth
app.use("/api/auth", authRoutes(pool));

// Route Appointments
app.use("/api/appointments", appointmentRoutes(pool));

// Les deux chemins : ancien front / proxy, ou préfixe /api.
// On sécurise l'accès avec authenticateToken
app.get("/patients", authenticateToken, listPatients);
app.post("/patients", authenticateToken, createPatient);
app.get("/api/patients", authenticateToken, listPatients);
app.post("/api/patients", authenticateToken, createPatient);

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
