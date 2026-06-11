import React, { useState, useEffect } from "react";
import { getRendezVous, createRendezVous, updateRendezVous, getPatients } from "../api";
import RdvCalendar from "../components/RdvCalendar";

const STATUTS = {
  en_attente: ["#fef3e2", "#854f0b", "En attente"],
  confirme:   ["#e6f7f2", "#0f6e56", "Confirmé"],
  annule:     ["#fdeaea", "#c0392b", "Annulé"],
  realise:    ["#eef6fb", "#0a5c8a", "Réalisé"],
};

function Badge({ s }) {
  const [bg, col, lbl] = STATUTS[s] || ["#f0f4f8", "#7a90a0", s || "—"];
  return <span style={{ background: bg, color: col, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{lbl}</span>;
}

export default function MedecinRendezVous({ medecinId }) {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("aujourdhui");
  const [view, setView] = useState("liste"); // "liste" | "calendrier"
  const [form, setForm] = useState({ patient_id: "", date_heure: "", motif: "", statut: "en_attente", notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([getRendezVous(), getPatients()]);
      setList(Array.isArray(r) ? r : r.data || []);
      setPatients(Array.isArray(p) ? p : p.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const partition = {
    aujourdhui: list.filter(r => {
      const d = r.date_heure ? new Date(r.date_heure) : null;
      return d && d >= today && d < tomorrow;
    }),
    avenir: list.filter(r => r.date_heure && new Date(r.date_heure) >= tomorrow),
    passe: list.filter(r => r.date_heure && new Date(r.date_heure) < today),
  };

  const save = async () => {
    if (!form.patient_id || !form.date_heure) { setMsg({ type: "err", text: "Patient et date obligatoires" }); return; }
    try {
      await createRendezVous({ ...form, medecin_id: medecinId });
      setShowForm(false);
      setForm({ patient_id: "", date_heure: "", motif: "", statut: "en_attente", notes: "" });
      setMsg({ type: "ok", text: "Rendez-vous créé" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const setStatut = async (rdv, statut) => {
    try { await updateRendezVous(rdv.id, { statut }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };

  const current = partition[tab] || [];

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>Rendez-vous</div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>Votre agenda de consultations</div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg.text}</div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "#fff", border: "1px solid #e8edf2", borderRadius: 8, padding: 3 }}>
          {[["liste","📋 Liste"], ["calendrier","🗓 Calendrier"]].map(([v,lbl]) => (
            <button key={v} onClick={()=>setView(v)} style={{
              background: view===v ? "#0a5c8a" : "transparent",
              color: view===v ? "#fff" : "#4a6070",
              border:"none", padding:"7px 14px", borderRadius:6,
              fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
            }}>{lbl}</button>
          ))}
        </div>
        {view === "liste" && [["aujourdhui", `Aujourd'hui (${partition.aujourdhui.length})`], ["avenir", `À venir (${partition.avenir.length})`], ["passe", `Passés (${partition.passe.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid #e8edf2",
            background: tab === k ? "#0a5c8a" : "#fff",
            color: tab === k ? "#fff" : "#4a6070",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#0a5c8a", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Nouveau rendez-vous
        </button>
      </div>

      {view === "calendrier" && (
        <div style={{ marginBottom: 16 }}>
          <RdvCalendar rdvs={list} />
        </div>
      )}

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 14 }}>Nouveau rendez-vous</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Patient *</label>
              <select style={inp} value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date & heure *</label>
              <input type="datetime-local" style={inp} value={form.date_heure} onChange={e => setForm({ ...form, date_heure: e.target.value })} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Motif</label>
              <input type="text" style={inp} placeholder="Consultation, suivi..." value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "#0a5c8a", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={save}>Enregistrer</button>
            <button style={{ background: "#f0f4f8", color: "#1a2332", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      {view === "liste" && (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 8 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : current.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Aucun rendez-vous dans cette catégorie</div>
        ) : current.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid #f0f4f8" }}>
            <div style={{ background: "#eef6fb", borderRadius: 10, padding: "10px 14px", minWidth: 70, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0a5c8a", fontFamily: "'Playfair Display',serif" }}>
                {r.date_heure ? new Date(r.date_heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
              <div style={{ fontSize: 10, color: "#0a5c8a", fontWeight: 600 }}>
                {r.date_heure ? new Date(r.date_heure).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                {r.patient ? `${r.patient.nom} ${r.patient.prenom}` : `Patient #${r.patient_id}`}
              </div>
              <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>{r.motif || "Consultation"}</div>
            </div>
            <Badge s={r.statut} />
            <div style={{ display: "flex", gap: 6 }}>
              {r.statut === "en_attente" && (
                <button onClick={() => setStatut(r, "confirme")} style={{ background: "#e6f7f2", color: "#0f6e56", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Confirmer</button>
              )}
              {(r.statut === "confirme" || r.statut === "en_attente") && (
                <button onClick={() => setStatut(r, "realise")} style={{ background: "#eef6fb", color: "#0a5c8a", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Marquer réalisé</button>
              )}
              {r.statut !== "annule" && r.statut !== "realise" && (
                <button onClick={() => setStatut(r, "annule")} style={{ background: "#fdeaea", color: "#c0392b", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
