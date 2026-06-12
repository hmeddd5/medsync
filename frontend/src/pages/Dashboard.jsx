import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";

import {
  HiUserGroup,
  HiCalendarDays,
  HiClipboardDocumentList,
  HiCpuChip
} from "react-icons/hi2";

function Dashboard() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Vue d’ensemble</span>
            <h1>Tableau clinique</h1>
            <p>Suivi des activités importantes de la journée.</p>
          </div>

          <button className="primary-btn">
            + Nouveau dossier
          </button>
        </div>

        <div className="stats-grid">
          <StatsCard
            title="Patients"
            value="128"
            detail="+12 ce mois"
            icon={<HiUserGroup />}
          />

          <StatsCard
            title="Rendez-vous"
            value="24"
            detail="8 aujourd'hui"
            icon={<HiCalendarDays />}
          />

          <StatsCard
            title="Prescriptions"
            value="36"
            detail="Actives"
            icon={<HiClipboardDocumentList />}
          />

          <StatsCard
            title="Alertes IA"
            value="3"
            detail="À vérifier"
            icon={<HiCpuChip />}
          />
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Priorités du jour</h2>
            <span>Dernière mise à jour : aujourd’hui</span>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <strong>Marc Dubois</strong>
              <p>
                Rendez-vous confirmé à 09:00 pour suivi hypertension.
              </p>
            </div>

            <div className="activity-item">
              <strong>Analyse IA</strong>
              <p>
                Un patient nécessite une révision clinique.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;