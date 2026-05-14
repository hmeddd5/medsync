const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/auth/login - Vérification email/password et renvoi du JWT
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis." });
      }

      // Recherche dans la base de données
      const { rows } = await pool.query("SELECT * FROM staff WHERE email = $1", [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }

      const user = rows[0];

      // Vérification du mot de passe
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }

      // Création du JSON Web Token
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role, 
          email: user.email, 
          firstName: user.first_name, 
          lastName: user.last_name 
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      // Renvoi du token au frontend
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          role: user.role, 
          firstName: user.first_name, 
          lastName: user.last_name, 
          email: user.email 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
  });

  // GET /api/auth/me - Récupérer le profil actuel via le token
  router.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
};
