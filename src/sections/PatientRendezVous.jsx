import React, { useState, useEffect } from "react";
import { getRendezVous, createRendezVous, updateRendezVous, getMedecins } from "../api";

const STATUTS = {
  en_attente: ["#fef3e2", "#854f0b", "En attente de confirmation"],
  confirme:   ["#e6f7f2", "#0f6e56", "Confirmé"],
  annule:     ["#fdeaea", "#c0392b", "Annulé"],
  realise:    ["#eef6fb", "#0a5c8a", "Réalisé"],
};

function Badge({ s }) {
  const [bg, col, lbl] = STATUTS[s] || ["#f0f4f8", "#7a90a0", s || "—"];
  return <span style={{ background: bg, color: col, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{lbl}</span>;
}

export default function PatientRendezVous({ patientId }) {
  const [list, setList] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ medecin_id: "", date_heure: "", motif: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([getRendezVous(), getMedecins()]);
      setList(Array.isArray(r) ? r : r.data || []);
      setMedecins(Array.isArray(m) ? m : m.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const now = new Date();
  const aVenir = list.filter(r => r.date_heure && new Date(r.date_heure) >= now);
  const passes = list.filter(r => r.date_heure && new Date(r.date_heure) < now);

  const save = async () => {
    if (!form.medecin_id || !form.date_heure) { setMsg({ type: "err", text: "Médecin et date obligatoires" }); return; }
    if (!patientId) { setMsg({ type: "err", text: "Profil patient introuvable" }); return; }
    try {
      await createRendezVous({ ...form, patient_id: patientId, statut: "en_attente" });
      setShowForm(false);
      setForm({ medecin_id: "", date_heure: "", motif: "" });
      setMsg({ type: "ok", text: "Demande de rendez-vous envoyée. En attente de confirmation." });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const annuler = async (rdv) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    try { await updateRendezVous(rdv.id, { statut: "annule" }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>Mes rendez-vous</div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>Consultez vos rendez-vous et prenez-en de nouveaux</div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg.text}</div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#0f6e56", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Prendre un rendez-vous
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 14 }}>Nouvelle demande de rendez-vous</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Médecin *</label>
              <select style={inp} value={form.medecin_id} onChange={e => setForm({ ...form, medecin_id: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom} — {m.specialite}</option>)}
              </select></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date et heure souhaitées *</label>
              <input type="datetime-local" style={inp} min={new Date().toISOString().slice(0, 16)} value={form.date_heure} onChange={e => setForm({ ...form, date_heure: e.target.value })} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Motif de la consultation</label>
              <input type="text" style={inp} placeholder="Suivi diabète, douleurs..." value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} /></div>
          </div>
          <div style={{ background: "#eef6fb", padding: 10, borderRadius: 6, fontSize: 12, color: "#0a5c8a", marginBottom: 14 }}>
            ℹ️ Votre demande sera transmise au secrétariat pour confirmation.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "#0f6e56", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={save}>Envoyer la demande</button>
            <button style={{ background: "#f0f4f8", color: "var(--text-primary, #0d1f2d)", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 14 }}>Rendez-vous à venir ({aVenir.length})</div>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : aVenir.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#7a90a0" }}>Aucun rendez-vous à venir</div>
        ) : aVenir.map(r => {
          const date = new Date(r.date_heure);
          return (
            <div key={r.id} style={{ border: "1px solid #e8edf2", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ background: "#e6f7f2", borderRadius: 10, padding: "8px 14px", minWidth: 60, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f6e56", fontFamily: "'Playfair Display',serif" }}>{date.getDate()}</div>
                <div style={{ fontSize: 10, color: "#0f6e56", fontWeight: 600, textTransform: "uppercase" }}>{date.toLocaleString("fr-FR", { month: "short" })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                  {r.medecin ? `Dr. ${r.medecin.nom} ${r.medecin.prenom}` : `Médecin #${r.medecin_id}`}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", marginTop: 3 }}>{r.motif || "Consultation"} · 🕐 {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <Badge s={r.statut} />
                {r.statut !== "annule" && r.statut !== "realise" && (
                  <button onClick={() => annuler(r)} style={{ background: "transparent", color: "#c0392b", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Annuler</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 14 }}>Historique ({passes.length})</div>
        {passes.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#7a90a0", fontSize: 13 }}>Aucun rendez-vous passé</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["Date", "Médecin", "Motif", "Statut"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 600, color: "#7a90a0", borderBottom: "1px solid #f0f4f8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {passes.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                  <td style={{ padding: "10px", color: "#7a90a0" }}>{new Date(r.date_heure).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td style={{ padding: "10px", fontWeight: 600 }}>{r.medecin ? `Dr. ${r.medecin.nom}` : "—"}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary, #4a6070)" }}>{r.motif || "—"}</td>
                  <td style={{ padding: "10px" }}><Badge s={r.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
