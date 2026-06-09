import Sidebar from "../components/Sidebar";

function RendezVous() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Agenda clinique</span>
            <h1>Rendez-vous</h1>
            <p>Planification et suivi des rendez-vous patients.</p>
          </div>

          <button className="primary-btn">+ Nouveau rendez-vous</button>
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Rendez-vous à venir</h2>
            <span>3 rendez-vous</span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Praticien</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <strong>Marc Dubois</strong>
                  <small>Patient #1024</small>
                </td>
                <td>Dr Sarah Benali</td>
                <td>03 juin 2026 - 09:00</td>
                <td>Suivi hypertension</td>
                <td><span className="badge success">Confirmé</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Nadia Karim</strong>
                  <small>Patient #1025</small>
                </td>
                <td>Dr Sarah Benali</td>
                <td>03 juin 2026 - 10:30</td>
                <td>Contrôle respiratoire</td>
                <td><span className="badge warning">En attente</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default RendezVous;