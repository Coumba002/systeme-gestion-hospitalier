// URL de base de l'API Laravel
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Token & Session ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};
export const setUser = (user) =>
  localStorage.setItem("user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("user");

export const logout = () => {
  removeToken();
  removeUser();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Identifiants incorrects");
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
  setToken(data.token);
  setUser(data.user);
  return data;
}

// ─── Stats dashboard ──────────────────────────────────────────────────────────
export async function getStatsDashboard() {
  const res = await fetch(`${API_BASE}/stats/dashboard`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement statistiques");
  return data;
}

// ─── Patients ────────────────────────────────────────────────────────────────
export async function getPatients() {
  const res = await fetch(`${API_BASE}/patients`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement patients");
  return data;
}

export async function createPatient(payload) {
  const res = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création patient");
  return data;
}

export async function updatePatient(id, payload) {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour patient");
  return data;
}

export async function deletePatient(id) {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression patient");
}

// ─── Médecins ─────────────────────────────────────────────────────────────────
export async function getMedecins() {
  const res = await fetch(`${API_BASE}/medecins`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement médecins");
  return data;
}

export async function createMedecin(payload) {
  const res = await fetch(`${API_BASE}/medecins`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création médecin");
  return data; // inclut compte_genere si un compte a été créé
}

export async function updateMedecin(id, payload) {
  const res = await fetch(`${API_BASE}/medecins/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour médecin");
  return data;
}

export async function deleteMedecin(id) {
  const res = await fetch(`${API_BASE}/medecins/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression médecin");
}

// ─── Infirmiers ───────────────────────────────────────────────────────────────
export async function getInfirmiers() {
  const res = await fetch(`${API_BASE}/infirmiers`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement infirmiers");
  return data;
}

export async function createInfirmier(payload) {
  const res = await fetch(`${API_BASE}/infirmiers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création infirmier");
  return data; // inclut compte_genere si un compte a été créé
}

export async function updateInfirmier(id, payload) {
  const res = await fetch(`${API_BASE}/infirmiers/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour infirmier");
  return data;
}

export async function deleteInfirmier(id) {
  const res = await fetch(`${API_BASE}/infirmiers/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression infirmier");
}

// ─── Consultations ────────────────────────────────────────────────────────────
export async function getConsultations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/consultations${qs ? "?" + qs : ""}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement consultations");
  return data;
}

export async function createConsultation(payload) {
  const res = await fetch(`${API_BASE}/consultations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création consultation");
  return data;
}

export async function updateConsultation(id, payload) {
  const res = await fetch(`${API_BASE}/consultations/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour consultation");
  return data;
}

export async function deleteConsultation(id) {
  const res = await fetch(`${API_BASE}/consultations/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression consultation");
}

// ─── Hospitalisations ─────────────────────────────────────────────────────────
export async function getHospitalisations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/hospitalisations${qs ? "?" + qs : ""}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement hospitalisations");
  return data;
}

export async function createHospitalisation(payload) {
  const res = await fetch(`${API_BASE}/hospitalisations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création hospitalisation");
  return data;
}

export async function updateHospitalisation(id, payload) {
  const res = await fetch(`${API_BASE}/hospitalisations/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour hospitalisation");
  return data;
}

export async function enregistrerSortie(id, payload) {
  const res = await fetch(`${API_BASE}/hospitalisations/${id}/sortie`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur enregistrement sortie");
  return data;
}

// ─── Factures ─────────────────────────────────────────────────────────────────
export async function getFactures(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/factures${qs ? "?" + qs : ""}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement factures");
  return data;
}

export async function createFacture(payload) {
  const res = await fetch(`${API_BASE}/factures`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création facture");
  return data;
}

export async function updateFacture(id, payload) {
  const res = await fetch(`${API_BASE}/factures/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour facture");
  return data;
}

export async function enregistrerPaiement(factureId, payload) {
  const res = await fetch(`${API_BASE}/factures/${factureId}/paiements`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur enregistrement paiement");
  return data;
}

// ─── Rendez-vous ──────────────────────────────────────────────────────────────
export async function getRendezVous() {
  const res = await fetch(`${API_BASE}/rendezvous`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement rendez-vous");
  return data;
}

export async function createRendezVous(payload) {
  const res = await fetch(`${API_BASE}/rendezvous`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création rendez-vous");
  return data;
}

export async function updateRendezVous(id, payload) {
  const res = await fetch(`${API_BASE}/rendezvous/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Erreur mise à jour rendez-vous");
  return data;
}

export async function deleteRendezVous(id) {
  const res = await fetch(`${API_BASE}/rendezvous/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression rendez-vous");
}

// ─── Prescriptions ────────────────────────────────────────────────────────────
export async function getPrescriptions() {
  const res = await fetch(`${API_BASE}/prescriptions`, { headers: headers() });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Erreur chargement prescriptions");
  return data;
}

export async function createPrescription(payload) {
  const res = await fetch(`${API_BASE}/prescriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création prescription");
  return data;
}

// ─── Utilisateurs (admin) ─────────────────────────────────────────────────────
export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement utilisateurs");
  return data;
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur mise à jour utilisateur");
  return data;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression utilisateur");
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export async function getMessages() {
  const res = await fetch(`${API_BASE}/messages`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement messages");
  return data;
}

export async function sendMessage(payload) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur envoi message");
  return data;
}

export async function markMessageRead(id) {
  const res = await fetch(`${API_BASE}/messages/${id}/lu`, {
    method: "POST",
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur marquage message lu");
  return data;
}

// ─── Résultats Examens ────────────────────────────────────────────────────────
export async function getResultats(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/resultats${qs ? "?" + qs : ""}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement résultats");
  return data;
}

export async function createResultat(payload) {
  const res = await fetch(`${API_BASE}/resultats`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création résultat");
  return data;
}

// ─── Stats Spécifiques ────────────────────────────────────────────────────────
export async function getStatsMedecin() {
  const res = await fetch(`${API_BASE}/stats/medecin`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement stats médecin");
  return data;
}

export async function getStatsPatient() {
  const res = await fetch(`${API_BASE}/stats/patient`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement stats patient");
  return data;
}