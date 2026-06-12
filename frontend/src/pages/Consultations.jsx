import Sidebar from "../components/Sidebar";

function Consultations() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Historique clinique</span>
            <h1>Consultations</h1>
            <p>Notes médicales, diagnostics et résumés générés.</p>
          </div>

          <button className="primary-btn">+ Nouvelle consultation</button>
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Consultations récentes</h2>
            <span>Historique patient</span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Praticien</th>
                <th>Diagnostic</th>
                <th>Résumé IA</th>
                <th>Risque</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <strong>Marc Dubois</strong>
                  <small>03 juin 2026</small>
                </td>
                <td>Dr Sarah Benali</td>
                <td>Hypertension</td>
                <td>Suivi recommandé avec contrôle régulier.</td>
                <td><span className="badge success">Faible</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Nadia Karim</strong>
                  <small>02 juin 2026</small>
                </td>
                <td>Dr Sarah Benali</td>
                <td>Asthme</td>
                <td>Surveillance des symptômes respiratoires.</td>
                <td><span className="badge warning">Modéré</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Consultations;