import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";

function AnalyseIA() {
  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Intelligence artificielle</span>
            <h1>Analyse IA</h1>
            <p>Priorisation clinique et aide à la décision médicale.</p>
          </div>

          <button className="primary-btn">Lancer analyse</button>
        </div>

        <div className="stats-grid">
          <StatsCard title="Analyses" value="42" icon="🤖" detail="Cette semaine" />
          <StatsCard title="Risque faible" value="31" icon="🟢" detail="Stable" />
          <StatsCard title="Risque modéré" value="8" icon="🟡" detail="À surveiller" />
          <StatsCard title="Risque élevé" value="3" icon="🔴" detail="Prioritaire" />
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Résumé IA</h2>
            <span>Analyse automatique</span>
          </div>

          <div className="ai-box">
            <h3>Recommandation clinique</h3>
            <p>
              L’IA recommande de prioriser les patients avec antécédents
              cardiovasculaires et symptômes récents. Aucun état critique
              immédiat n’est détecté dans les dossiers affichés.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AnalyseIA;