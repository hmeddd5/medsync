  const express = require("express");
  const jwt = require("jsonwebtoken");
  const { authenticateToken, JWT_SECRET } = require("../middleware/auth");

  module.exports = (pool) => {
  const router = express.Router();

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email requis." });
      }

      const { rows } = await pool.query(
        "SELECT * FROM staff WHERE email = $1",
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Utilisateur introuvable." });
      }

      const user = rows[0];

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
          fullName: user.full_name,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          role: user.role,
          fullName: user.full_name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
  });

  // GET /api/auth/me
  router.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
};