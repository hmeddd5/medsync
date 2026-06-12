import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";

import {
  HiCpuChip,
  HiCheckCircle,
  HiExclamationTriangle,
  HiShieldExclamation
} from "react-icons/hi2";

function AnalyseIA() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">
              Intelligence artificielle
            </span>

            <h1>Analyse IA</h1>

            <p>
              Priorisation clinique et aide à la décision médicale.
            </p>
          </div>

          <button className="primary-btn">
            Lancer analyse
          </button>
        </div>

        <div className="stats-grid">
          <StatsCard
            title="Analyses"
            value="42"
            detail="Cette semaine"
            icon={<HiCpuChip />}
          />

          <StatsCard
            title="Risque faible"
            value="31"
            detail="Stable"
            icon={<HiCheckCircle />}
          />

          <StatsCard
            title="Risque modéré"
            value="8"
            detail="À surveiller"
            icon={<HiExclamationTriangle />}
          />

          <StatsCard
            title="Risque élevé"
            value="3"
            detail="Prioritaire"
            icon={<HiShieldExclamation />}
          />
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Résumé IA</h2>
            <span>Analyse automatique</span>
          </div>

          <div className="ai-box">
            <h3>Recommandation clinique</h3>

            <p>
              L’IA recommande de prioriser les patients
              présentant des antécédents cardiovasculaires
              et des symptômes récents.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AnalyseIA;