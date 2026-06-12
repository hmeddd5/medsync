import Sidebar from "../components/Sidebar";

function Prescriptions() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Traitements</span>
            <h1>Prescriptions</h1>
            <p>Gestion des médicaments et traitements actifs.</p>
          </div>

          <button className="primary-btn">+ Nouvelle prescription</button>
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Prescriptions actives</h2>
            <span>Suivi des traitements</span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Fréquence</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <strong>Marc Dubois</strong>
                  <small>Patient #1024</small>
                </td>
                <td>Lisinopril</td>
                <td>10 mg</td>
                <td>1 fois / jour</td>
                <td><span className="badge success">Actif</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Nadia Karim</strong>
                  <small>Patient #1025</small>
                </td>
                <td>Salbutamol</td>
                <td>100 mcg</td>
                <td>Au besoin</td>
                <td><span className="badge warning">À surveiller</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Prescriptions;