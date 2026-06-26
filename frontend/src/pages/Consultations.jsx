import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  getPatients,
} from "../services/api";

function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const canManageConsultations =
    user.role === "ADMIN" || user.role === "DOCTOR";

  const canDeleteConsultations = user.role === "ADMIN";

  const [form, setForm] = useState({
    patientId: "",
    doctorId: 1,
    consultationDate: "",
    diagnosis: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const consultationsData = await getConsultations();
      const patientsData = await getPatients();

      setConsultations(consultationsData);
      setPatients(patientsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      patientId: "",
      doctorId: 1,
      consultationDate: "",
      diagnosis: "",
      notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManageConsultations) {
      alert("Accès refusé");
      return;
    }

    try {
      if (editingId) {
        await updateConsultation(editingId, form);
      } else {
        await createConsultation(form);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleEdit = (consultation) => {
    if (!canManageConsultations) return;

    setEditingId(consultation.id);

    setForm({
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      consultationDate: consultation.consultationDate
        ? consultation.consultationDate.substring(0, 16)
        : "",
      diagnosis: consultation.diagnosis || "",
      notes: consultation.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (!canDeleteConsultations) {
      alert("Accès refusé");
      return;
    }

    if (!window.confirm("Supprimer cette consultation ?")) return;

    await deleteConsultation(id);
    loadData();
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="page-content">
        <div className="page-top">
          <div>
            <span className="eyebrow">Historique clinique</span>
            <h1>Consultations</h1>
            <p>Notes médicales, diagnostics et suivi des patients.</p>
          </div>

          {canManageConsultations && (
            <button className="primary-btn" onClick={resetForm}>
              + Nouvelle consultation
            </button>
          )}
        </div>

        <div className="patients-layout">
          <section className="card">
            <div className="card-header">
              <h2>Consultations</h2>
              <span>{consultations.length} consultation(s)</span>
            </div>

            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Médecin</th>
                    <th>Date</th>
                    <th>Diagnostic</th>
                    <th>Notes</th>
                    {(canManageConsultations || canDeleteConsultations) && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {consultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td>
                        <strong>
                          {consultation.patientFirstName}{" "}
                          {consultation.patientLastName}
                        </strong>
                      </td>

                      <td>
                        Dr {consultation.doctorFirstName}{" "}
                        {consultation.doctorLastName}
                      </td>

                      <td>
                        {new Date(
                          consultation.consultationDate
                        ).toLocaleString()}
                      </td>

                      <td>{consultation.diagnosis}</td>

                      <td>{consultation.notes}</td>

                      {(canManageConsultations || canDeleteConsultations) && (
                        <td>
                          {canManageConsultations && (
                            <button
                              className="small-btn"
                              onClick={() => handleEdit(consultation)}
                            >
                              Modifier
                            </button>
                          )}

                          {canDeleteConsultations && (
                            <button
                              className="danger-btn"
                              onClick={() => handleDelete(consultation.id)}
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

          {canManageConsultations && (
            <section className="card form-card">
              <div className="card-header">
                <h2>
                  {editingId ? "Modifier consultation" : "Nouvelle consultation"}
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
                  name="consultationDate"
                  value={form.consultationDate}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="diagnosis"
                  placeholder="Diagnostic"
                  value={form.diagnosis}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="notes"
                  rows="5"
                  placeholder="Notes médicales..."
                  value={form.notes}
                  onChange={handleChange}
                />

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

export default Consultations;