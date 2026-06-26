const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ====================== PATIENTS ======================

export async function getPatients() {
  const res = await fetch(`${API_URL}/patients`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createPatient(patient) {
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(patient),
  });

  return res.json();
}

export async function updatePatient(id, patient) {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(patient),
  });

  return res.json();
}

export async function deletePatient(id) {
  await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ====================== APPOINTMENTS ======================

export async function getAppointments() {
  const res = await fetch(`${API_URL}/appointments`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateAppointment(id, data) {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteAppointment(id) {
  await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ====================== CONSULTATIONS ======================

export async function getConsultations() {
  const res = await fetch(`${API_URL}/consultations`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createConsultation(data) {
  const res = await fetch(`${API_URL}/consultations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateConsultation(id, data) {
  const res = await fetch(`${API_URL}/consultations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteConsultation(id) {
  await fetch(`${API_URL}/consultations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ====================== PRESCRIPTIONS ======================

export async function getPrescriptions() {
  const res = await fetch(`${API_URL}/prescriptions`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createPrescription(data) {
  const res = await fetch(`${API_URL}/prescriptions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updatePrescription(id, data) {
  const res = await fetch(`${API_URL}/prescriptions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deletePrescription(id) {
  await fetch(`${API_URL}/prescriptions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}