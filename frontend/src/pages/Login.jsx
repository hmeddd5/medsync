import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("doctor@medsync.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur de connexion");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
    } catch (error) {
      setError("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-logo">✦</div>
        <h1>MedSync</h1>
        <p>
          Plateforme clinique intelligente pour gérer les patients,
          les rendez-vous, les consultations et l’analyse médicale.
        </p>

        <div className="login-points">
          <span>✓ Dossiers patients centralisés</span>
          <span>✓ Suivi clinique rapide</span>
          <span>✓ Aide à la décision avec IA</span>
        </div>
      </div>

      <div className="login-card">
        <h2>Connexion</h2>
        <p>Accès sécurisé au portail médical</p>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Courriel</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

export default Login;