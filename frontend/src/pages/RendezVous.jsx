import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatients,
} from "../services/api";

function RendezVous() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const canManageAppointments =
    user.role === "ADMIN" || user.role === "RECEPTIONIST";

  const canDeleteAppointments = user.role === "ADMIN";

  const [form, setForm] = useState({
    patientId: "",
    staffId: 1,
    appointmentDate: "",
    reason: "",
    status: "PENDING",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const appointmentsData = await getAppointments();
      const patientsData = await getPatients();

      setAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (error) {
      console.error("Erreur chargement rendez-vous :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      patientId: "",
      staffId: 1,
      appointmentDate: "",
      reason: "",
      status: "PENDING",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManageAppointments) {
      alert("Accès refusé");
      return;
    }

    try {
      const data = {
        ...form,
        patientId: Number(form.patientId),
        staffId: Number(form.staffId) || 1,
      };

      if (editingId) {
        await updateAppointment(editingId, data);
      } else {
        await createAppointment(data);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement du rendez-vous.");
    }
  };

  const handleEdit = (appointment) => {
    if (!canManageAppointments) return;

    setEditingId(appointment.id);

    setForm({
      patientId: appointment.patientId || "",
      staffId: appointment.staffId || 1,
      appointmentDate: appointment.appointmentDate
        ? appointment.appointmentDate.substring(0, 16)
        : "",
      reason: appointment.reason || "",
      status: appointment.status || "PENDING",
    });
  };

  const handleDelete = async (id) => {
    if (!canDeleteAppointments) {
      alert("Accès refusé");
      return;
    }

    if (!window.confirm("Voulez-vous vraiment supprimer ce rendez-vous ?")) {
      return;
    }

    try {
      await deleteAppointment(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du rendez-vous.");
    }
  };

  const getBadgeClass = (appointmentStatus) => {
    if (appointmentStatus === "CONFIRMED") return "badge success";
    if (appointmentStatus === "COMPLETED") return "badge success";
    if (appointmentStatus === "PENDING") return "badge warning";
    if (appointmentStatus === "CANCELLED") return "badge danger";
    return "badge";
  };

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

          {canManageAppointments && (
            <button className="primary-btn" onClick={resetForm}>
              + Nouveau rendez-vous
            </button>
          )}
        </div>

        <div className="patients-layout">
          <section className="card">
            <div className="card-header">
              <h2>Rendez-vous</h2>
              <span>{appointments.length} rendez-vous</span>
            </div>

            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Praticien</th>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    {(canManageAppointments || canDeleteAppointments) && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <strong>
                          {appointment.patientFirstName}{" "}
                          {appointment.patientLastName}
                        </strong>
                        <small>Patient #{appointment.patientId}</small>
                      </td>

                      <td>
                        Dr {appointment.doctorFirstName}{" "}
                        {appointment.doctorLastName}
                      </td>

                      <td>
                        {new Date(appointment.appointmentDate).toLocaleString()}
                      </td>

                      <td>{appointment.reason}</td>

                      <td>
                        <span className={getBadgeClass(appointment.status)}>
                          {appointment.status}
                        </span>
                      </td>

                      {(canManageAppointments || canDeleteAppointments) && (
                        <td>
                          {canManageAppointments && (
                            <button
                              type="button"
                              className="small-btn"
                              onClick={() => handleEdit(appointment)}
                            >
                              Modifier
                            </button>
                          )}

                          {canDeleteAppointments && (
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {canManageAppointments && (
            <section className="card form-card">
              <div className="card-header">
                <h2>
                  {editingId ? "Modifier rendez-vous" : "Nouveau rendez-vous"}
                </h2>
              </div>

              <form className="pro-form" onSubmit={handleSubmit}>
                <select
                  name="patientId"
                  value={form.patientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="reason"
                  placeholder="Motif du rendez-vous"
                  value={form.reason}
                  onChange={handleChange}
                  required
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmé</option>
                  <option value="COMPLETED">Terminé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>

                <button type="submit" className="primary-btn full">
                  {editingId ? "Mettre à jour" : "Enregistrer"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetForm}
                  >
                    Annuler
                  </button>
                )}
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default RendezVous;