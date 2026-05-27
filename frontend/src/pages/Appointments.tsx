import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiBaseUrl } from "../config";
import "./Appointments.css";

type Appointment = {
  id: number;
  appointmentDate: string;
  reason: string;
  status: string;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
};

export default function Appointments() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for the creation modal
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  // En situation réelle, on récupérerait la liste des médecins depuis l'API
  // Pour la démo, on simule l'ID du Dr. House.
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl()}/api/appointments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur de récupération de l'agenda");
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Chargement des patients pour le formulaire modal (Seulement pour réceptionniste)
  useEffect(() => {
    if (user?.role === "RECEPTIONIST" && showModal && patients.length === 0) {
      fetch(`${apiBaseUrl()}/api/patients`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setPatients(data))
        .catch(err => console.error(err));
    }
  }, [showModal, user?.role, token, patients.length]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !appointmentDate || !appointmentTime || !reason) return;

    // Combine date and time to ISO string
    const dateObj = new Date(`${appointmentDate}T${appointmentTime}:00`);

    try {
      const res = await fetch(`${apiBaseUrl()}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: Number(selectedPatientId),
          doctorId: 1, // On assigne de force au Dr. House (ID 1) pour l'exemple
          appointmentDate: dateObj.toISOString(),
          reason
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de création");
      }

      setShowModal(false);
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      setSelectedPatientId("");
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${apiBaseUrl()}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <span className="badge badge-scheduled">Planifié</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Terminé</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">Annulé</span>;
      case 'NO_SHOW': return <span className="badge badge-noshow">Absent</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>Agenda de la Clinique</h1>
        {user?.role === 'RECEPTIONIST' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nouveau Rendez-vous
          </button>
        )}
      </div>

      {loading ? (
        <p>Chargement du planning...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="appointments-list">
          {appointments.length === 0 ? (
            <div className="empty-state">
              <p>Aucun rendez-vous prévu.</p>
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-time">
                  <div className="time">{new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="date">{new Date(apt.appointmentDate).toLocaleDateString()}</div>
                </div>
                <div className="appointment-details">
                  <h3>{apt.patientLastName.toUpperCase()} {apt.patientFirstName}</h3>
                  <p className="reason">{apt.reason}</p>
                  <p className="doctor">Médecin : Dr. {apt.doctorLastName}</p>
                </div>
                <div className="appointment-actions">
                  {getStatusBadge(apt.status)}
                  
                  {apt.status === 'SCHEDULED' && (
                    <div className="action-buttons">
                      {(user?.role === 'DOCTOR' || user?.role === 'RECEPTIONIST') && (
                        <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="btn-icon btn-check" title="Terminé">✓</button>
                      )}
                      {user?.role === 'RECEPTIONIST' && (
                        <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="btn-icon btn-cross" title="Annuler">✗</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL CRÉATION DE RDV */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Planifier un Rendez-vous</h2>
            <form onSubmit={handleCreateAppointment}>
              <div className="form-group">
                <label>Patient</label>
                <select 
                  value={selectedPatientId} 
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Heure</label>
                  <input type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Motif de la consultation</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Suivi annuel, Douleurs abdominales..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
