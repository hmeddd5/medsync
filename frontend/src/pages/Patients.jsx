import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const canManagePatients =
    user.role === "ADMIN" || user.role === "RECEPTIONIST";

  const canDeletePatients = user.role === "ADMIN";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    allergies: "",
    chronicConditions: "",
    status: "ACTIVE",
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Erreur chargement patients :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
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
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      allergies: "",
      chronicConditions: "",
      status: "ACTIVE",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManagePatients) {
      alert("Accès refusé");
      return;
    }

    try {
      if (editingId) {
        await updatePatient(editingId, form);
      } else {
        await createPatient(form);
      }

      resetForm();
      loadPatients();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement du patient");
    }
  };

  const handleEdit = (patient) => {
    if (!canManagePatients) return;

    setEditingId(patient.id);

    setForm({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      birthDate: patient.birthDate ? patient.birthDate.substring(0, 10) : "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      allergies: patient.allergies || "",
      chronicConditions: patient.chronicConditions || "",
      status: patient.status || "ACTIVE",
    });
  };

  const handleDelete = async (id) => {
    if (!canDeletePatients) {
      alert("Accès refusé");
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce patient ?"
    );

    if (!confirmed) return;

    try {
      await deletePatient(id);
      loadPatients();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du patient");
    }
  };

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

          {canManagePatients && (
            <button className="primary-btn" onClick={resetForm}>
              + Ajouter patient
            </button>
          )}
        </div>

        <div className="patients-layout">
          <section className="card">
            <div className="card-header">
              <h2>Liste des patients</h2>
              <span>{patients.length} patients</span>
            </div>

            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Naissance</th>
                    <th>Contact</th>
                    <th>Conditions</th>
                    <th>Statut</th>
                    {(canManagePatients || canDeletePatients) && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <strong>
                          {patient.firstName} {patient.lastName}
                        </strong>
                        <small>Patient #{patient.id}</small>
                      </td>

                      <td>
                        {patient.birthDate
                          ? new Date(patient.birthDate).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>{patient.phone || "-"}</td>

                      <td>{patient.chronicConditions || "-"}</td>

                      <td>
                        <span
                          className={
                            patient.status === "ARCHIVED"
                              ? "badge warning"
                              : "badge success"
                          }
                        >
                          {patient.status === "ARCHIVED" ? "Archivé" : "Actif"}
                        </span>
                      </td>

                      {(canManagePatients || canDeletePatients) && (
                        <td>
                          {canManagePatients && (
                            <button
                              type="button"
                              className="small-btn"
                              onClick={() => handleEdit(patient)}
                            >
                              Modifier
                            </button>
                          )}

                          {canDeletePatients && (
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => handleDelete(patient.id)}
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

          {canManagePatients && (
            <section className="card form-card">
              <div className="card-header">
                <h2>{editingId ? "Modifier patient" : "Nouveau patient"}</h2>
              </div>

              <form className="pro-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Nom"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />

                  <input
                    type="text"
                    name="firstName"
                    placeholder="Prénom"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                  />

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Sexe</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>

                <input
                  type="text"
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Courriel"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="address"
                  placeholder="Adresse"
                  value={form.address}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="allergies"
                  placeholder="Allergies"
                  value={form.allergies}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="chronicConditions"
                  placeholder="Conditions chroniques"
                  value={form.chronicConditions}
                  onChange={handleChange}
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="ARCHIVED">Archivé</option>
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
                    Annuler modification
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

export default Patients;