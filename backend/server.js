const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

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

// Journal minimal : si tu ne vois rien ici en appelant /health, ce n’est pas ce serveur qui répond.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
    <li><a href="/health">GET /health</a> (santé + base)</li>
    <li><a href="/api/health">GET /api/health</a> (identique)</li>
    <li><a href="/patients">GET /patients</a></li>
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

app.get("/patients", async (req, res) => {
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
});

// Remplace le message Express « Cannot GET … » par une réponse claire (si c’est bien ce serveur).
app.use((req, res) => {
  res.status(404).json({
    error: "Route inconnue sur l’API clinical-platform",
    method: req.method,
    path: req.path,
    boot: BOOT,
    try: ["/", "/health", "/api/health", "/patients"],
  });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======== clinical-platform API ========");
  console.log(`Fichier : ${SERVER_FILE}`);
  console.log(`Démarrage : ${BOOT}`);
  console.log(`Écoute  : http://127.0.0.1:${PORT}  (et toutes les interfaces)`);
  console.log(`Ouvre   : http://127.0.0.1:${PORT}/  puis clique sur /health`);
  console.log("========================================");
});
