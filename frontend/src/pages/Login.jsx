function Login({ onLogin }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
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

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Courriel</label>
          <input type="email" defaultValue="doctor@medsync.local" />

          <label>Mot de passe</label>
          <input type="password" defaultValue="password123" />

          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

export default Login;