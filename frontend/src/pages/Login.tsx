import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiBaseUrl } from "../config";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Les comptes de test (pour faciliter la démonstration)
  const setTestAccount = (role: 'doctor' | 'nurse' | 'receptionist') => {
    if (role === 'doctor') setEmail('mourad@mediai.local');
    else if (role === 'nurse') setEmail('elisa@mediai.local');
    else setEmail('ines@mediai.local');

    setPassword('password123');
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>MedyIA</h2>
          <p>Plateforme de gestion clinique intelligente</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: mourad@mediai.local"
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="login-test-accounts">
          <p>Comptes de test :</p>
          <div className="test-buttons">
            <button type="button" onClick={() => setTestAccount('doctor')}>Médecin</button>
            <button type="button" onClick={() => setTestAccount('nurse')}>Infirmière</button>
            <button type="button" onClick={() => setTestAccount('receptionist')}>Réception</button>
          </div>
        </div>
      </div>
    </div>
  );
}
