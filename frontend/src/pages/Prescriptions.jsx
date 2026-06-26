import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getConsultations,
} from "../services/api";

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const canManagePrescriptions =
    user.role === "ADMIN" || user.role === "DOCTOR";

  const canDeletePrescriptions = user.role === "ADMIN";

  const [form, setForm] = useState({
    consultationId: "",
    medication: "",
    dosage: "",
    instructions: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const prescriptionsData = await getPrescriptions();
      const consultationsData = await getConsultations();

      setPrescriptions(prescriptionsData);
      setConsultations(consultationsData);
    } catch (error) {
      console.error("Erreur chargement prescriptions :", error);
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
      consultationId: "",
      medication: "",
      dosage: "",
      instructions: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManagePrescriptions) {
      alert("Accès refusé");
      return;
    }

    try {
      if (editingId) {
        await updatePrescription(editingId, form);
      } else {
        await createPrescription(form);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement de la prescription.");
    }
  };

  const handleEdit = (prescription) => {
    if (!canManagePrescriptions) return;

    setEditingId(prescription.id);

    setForm({
      consultationId: prescription.consultationId || "",
      medication: prescription.medication || "",
      dosage: prescription.dosage || "",
      instructions: prescription.instructions || "",
    });
  };

  const handleDelete = async (id) => {
    if (!canDeletePrescriptions) {
      alert("Accès refusé");
      return;
    }

    if (!window.confirm("Supprimer cette prescription ?")) return;

    try {
      await deletePrescription(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

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

          {canManagePrescriptions && (
            <button className="primary-btn" onClick={resetForm}>
              + Nouvelle prescription
            </button>
          )}
        </div>

        <div className="patients-layout">
          <section className="card">
            <div className="card-header">
              <h2>Prescriptions actives</h2>
              <span>{prescriptions.length} prescription(s)</span>
            </div>

            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Médecin</th>
                    <th>Diagnostic</th>
                    <th>Médicament</th>
                    <th>Dosage</th>
                    <th>Instructions</th>
                    {(canManagePrescriptions || canDeletePrescriptions) && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <strong>
                          {prescription.patientFirstName}{" "}
                          {prescription.patientLastName}
                        </strong>
                        <small>Consultation #{prescription.consultationId}</small>
                      </td>

                      <td>
                        Dr {prescription.doctorFirstName}{" "}
                        {prescription.doctorLastName}
                      </td>

                      <td>{prescription.diagnosis || "-"}</td>

                      <td>{prescription.medication}</td>

                      <td>{prescription.dosage || "-"}</td>

                      <td>{prescription.instructions || "-"}</td>

                      {(canManagePrescriptions || canDeletePrescriptions) && (
                        <td>
                          {canManagePrescriptions && (
                            <button
                              type="button"
                              className="small-btn"
                              onClick={() => handleEdit(prescription)}
                            >
                              Modifier
                            </button>
                          )}

                          {canDeletePrescriptions && (
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => handleDelete(prescription.id)}
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

          {canManagePrescriptions && (
            <section className="card form-card">
              <div className="card-header">
                <h2>
                  {editingId
                    ? "Modifier prescription"
                    : "Nouvelle prescription"}
                </h2>
              </div>

              <form className="pro-form" onSubmit={handleSubmit}>
                <select
                  name="consultationId"
                  value={form.consultationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une consultation</option>

                  {consultations.map((consultation) => (
                    <option key={consultation.id} value={consultation.id}>
                      #{consultation.id} - {consultation.patientFirstName}{" "}
                      {consultation.patientLastName} -{" "}
                      {consultation.diagnosis || "Sans diagnostic"}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="medication"
                  placeholder="Médicament"
                  value={form.medication}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="dosage"
                  placeholder="Dosage"
                  value={form.dosage}
                  onChange={handleChange}
                />

                <textarea
                  name="instructions"
                  rows="5"
                  placeholder="Instructions de prise..."
                  value={form.instructions}
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

export default Prescriptions;