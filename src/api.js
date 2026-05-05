// URL de base de l'API Laravel
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helpers
const headers = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// Gestion du token (localStorage)
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

/**
 * Connexion : POST /api/login
 * Renvoie { token, user } ou lève une Error avec le message du serveur.
 */
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

/**
 * Inscription : POST /api/register
 * Renvoie { token, user } ou lève une Error.
 */
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
  return data;
}

// ─── Infirmiers ───────────────────────────────────────────────────────────────

export async function getInfirmiers() {
  const res = await fetch(`${API_BASE}/infirmiers`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur chargement infirmiers");
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

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Erreur suppression utilisateur");
}