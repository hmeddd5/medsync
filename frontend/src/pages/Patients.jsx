import Sidebar from "../components/Sidebar";

function Patients() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Dossiers médicaux</span>
            <h1>Patients</h1>
            <p>Dossier administratif, allergies, antécédents et contacts.</p>
          </div>

          <button className="primary-btn">+ Ajouter patient</button>
        </div>

        <div className="patients-layout">
          <section className="card">
            <div className="card-header">
              <h2>Liste des patients</h2>
              <span>128 patients</span>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Naissance</th>
                  <th>Contact</th>
                  <th>Conditions</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <strong>Marc Dubois</strong>
                    <small>Patient #1024</small>
                  </td>
                  <td>13 mars 1962</td>
                  <td>+1 514 555 0190</td>
                  <td>Hypertension, diabète</td>
                  <td>
                    <span className="badge success">Actif</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="card form-card">
            <div className="card-header">
              <h2>Nouveau patient</h2>
            </div>

            <form className="pro-form">
              <div className="form-row">
                <input type="text" placeholder="Nom" />
                <input type="text" placeholder="Prénom" />
              </div>

              <div className="form-row">
                <input type="date" />
                <select>
                  <option>Sexe</option>
                  <option>Homme</option>
                  <option>Femme</option>
                </select>
              </div>

              <input type="text" placeholder="Téléphone" />
              <input type="email" placeholder="Courriel" />
              <input type="text" placeholder="Allergies" />
              <input type="text" placeholder="Conditions chroniques" />

              <button type="button" className="primary-btn full">
                Enregistrer
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Patients;