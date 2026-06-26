import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import {
  HiUserGroup,
  HiCalendarDays,
  HiClipboardDocumentList,
  HiCpuChip,
} from "react-icons/hi2";

function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalConsultations: 0,
    totalPrescriptions: 0,
    upcomingAppointments: [],
  });

  useEffect(() => {
fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/dashboard/stats`)      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Erreur dashboard :", err));
  }, []);

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

<button
  className="primary-btn"
  onClick={() => (window.location.href = "/patients")}
>
  + Nouveau dossier
</button>        </div>

        <div className="stats-grid">
          <StatsCard
            title="Patients"
            value={stats.totalPatients}
            detail="Total enregistrés"
            icon={<HiUserGroup />}
          />

          <StatsCard
            title="Rendez-vous"
            value={stats.totalAppointments}
            detail="Total planifiés"
            icon={<HiCalendarDays />}
          />

          <StatsCard
            title="Consultations"
            value={stats.totalConsultations}
            detail="Consultations créées"
            icon={<HiCpuChip />}
          />

          <StatsCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            detail="Prescriptions actives"
            icon={<HiClipboardDocumentList />}
          />
        </div>

        <section className="card">
          <div className="card-header">
            <h2>Prochains rendez-vous</h2>
            <span>Dernière mise à jour : aujourd’hui</span>
          </div>

          <div className="activity-list">
            {stats.upcomingAppointments.length === 0 ? (
              <div className="activity-item">
                <strong>Aucun rendez-vous</strong>
                <p>Aucun rendez-vous à afficher pour le moment.</p>
              </div>
            ) : (
              stats.upcomingAppointments.map((appointment) => (
                <div className="activity-item" key={appointment.id}>
                  <strong>{appointment.patient}</strong>
                  <p>
                    Rendez-vous avec Dr {appointment.doctor} —{" "}
                    {new Date(appointment.appointment_date).toLocaleString()}.
                    Motif : {appointment.reason}. Statut : {appointment.status}.
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;