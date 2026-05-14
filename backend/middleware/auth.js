const jwt = require("jsonwebtoken");

// Dans un vrai projet, le secret doit toujours être dans le .env
const JWT_SECRET = process.env.JWT_SECRET || "clinical_super_secret_dev_key";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Accès refusé. Token d'authentification manquant." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Accès refusé. Token invalide ou expiré." });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
