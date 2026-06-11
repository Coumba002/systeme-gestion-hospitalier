import React, { useState, useEffect } from "react";
import { getRendezVous, createRendezVous, updateRendezVous, deleteRendezVous, getPatients, getMedecins } from "../api";
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

export default function AdminRendezVous() {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("liste"); // "liste" | "calendrier"
  const [msg, setMsg] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreMedecin, setFiltreMedecin] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ patient_id: "", medecin_id: "", date_heure: "", motif: "", statut: "en_attente", notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [r, p, m] = await Promise.all([getRendezVous(), getPatients(), getMedecins()]);
      setList(Array.isArray(r) ? r : r.data || []);
      setPatients(Array.isArray(p) ? p : p.data || []);
      setMedecins(Array.isArray(m) ? m : m.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ patient_id: "", medecin_id: "", date_heure: "", motif: "", statut: "en_attente", notes: "" });
    setShowForm(true);
  };
  const openEdit = (r) => {
    setEditItem(r);
    setForm({
      patient_id: r.patient_id,
      medecin_id: r.medecin_id,
      date_heure: r.date_heure ? r.date_heure.slice(0, 16) : "",
      motif: r.motif || "",
      statut: r.statut || "en_attente",
      notes: r.notes || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.patient_id || !form.medecin_id || !form.date_heure) {
      setMsg({ type: "err", text: "Patient, médecin et date sont obligatoires" });
      return;
    }
    try {
      if (editItem) await updateRendezVous(editItem.id, form);
      else await createRendezVous(form);
      setShowForm(false);
      setMsg({ type: "ok", text: editItem ? "Rendez-vous modifié" : "Rendez-vous créé" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try { await deleteRendezVous(id); setMsg({ type: "ok", text: "Supprimé" }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const changerStatut = async (rdv, statut) => {
    try { await updateRendezVous(rdv.id, { statut }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };
  const btn = (bg, col) => ({ background: bg, color: col, border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" });

  const filtered = list.filter(r => {
    if (filtreStatut !== "tous" && r.statut !== filtreStatut) return false;
    if (filtreMedecin && String(r.medecin_id) !== String(filtreMedecin)) return false;
    if (search) {
      const p = r.patient ? `${r.patient.nom} ${r.patient.prenom}`.toLowerCase() : "";
      if (!p.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const stats = {
    total: list.length,
    confirme: list.filter(r => r.statut === "confirme").length,
    en_attente: list.filter(r => r.statut === "en_attente").length,
    annule: list.filter(r => r.statut === "annule").length,
  };

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Rendez-vous
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>{list.length} rendez-vous au total</div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {[
          ["Total", stats.total, "#0a5c8a"],
          ["Confirmés", stats.confirme, "#0f6e56"],
          ["En attente", stats.en_attente, "#854f0b"],
          ["Annulés", stats.annule, "#c0392b"],
        ].map(([lbl, val, col]) => (
          <div key={lbl} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: col, fontFamily: "'Playfair Display',serif", marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "#fff", border: "1px solid #e8edf2", borderRadius: 8, padding: 3 }}>
          {[["liste","📋 Liste"], ["calendrier","🗓 Calendrier"]].map(([v,lbl]) => (
            <button key={v} onClick={()=>setView(v)} style={{
              background: view===v ? "#1a2332" : "transparent",
              color: view===v ? "#fff" : "#4a6070",
              border:"none", padding:"7px 14px", borderRadius:6,
              fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
            }}>{lbl}</button>
          ))}
        </div>
        {view === "liste" && (
          <>
            <input type="text" placeholder="Rechercher un patient..." style={{ ...inp, flex: 1, minWidth: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ ...inp, width: "auto" }} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
              <option value="tous">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirme">Confirmés</option>
              <option value="annule">Annulés</option>
              <option value="realise">Réalisés</option>
            </select>
            <select style={{ ...inp, width: "auto" }} value={filtreMedecin} onChange={e => setFiltreMedecin(e.target.value)}>
              <option value="">Tous médecins</option>
              {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>)}
            </select>
          </>
        )}
        <div style={{ flex: view === "calendrier" ? 1 : 0 }}></div>
        <button style={btn("#1a2332", "#fff")} onClick={openCreate}>+ Nouveau rendez-vous</button>
      </div>

      {view === "calendrier" && (
        <div style={{ marginBottom: 16 }}>
          <RdvCalendar rdvs={list} onRdvClick={openEdit} />
        </div>
      )}

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 16 }}>
            {editItem ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Patient *</label>
              <select style={inp} value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Médecin *</label>
              <select style={inp} value={form.medecin_id} onChange={e => setForm({ ...form, medecin_id: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom} — {m.specialite}</option>)}
              </select></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date & heure *</label>
              <input type="datetime-local" style={inp} value={form.date_heure} onChange={e => setForm({ ...form, date_heure: e.target.value })} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Statut</label>
              <select style={inp} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmé</option>
                <option value="annule">Annulé</option>
                <option value="realise">Réalisé</option>
              </select></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Motif</label>
              <input type="text" style={inp} placeholder="Consultation, suivi, urgence..." value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Notes</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes complémentaires..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btn("#1a2332", "#fff")} onClick={save}>Enregistrer</button>
            <button style={btn("#f0f4f8", "#1a2332")} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      {view === "liste" && (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date & heure", "Patient", "Médecin", "Motif", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#7a90a0", textTransform: "uppercase", borderBottom: "1px solid #f0f4f8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#7a90a0" }}>Aucun rendez-vous</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                  <td style={{ padding: "10px 14px", color: "var(--text-primary, #0d1f2d)", fontWeight: 600 }}>
                    {r.date_heure ? new Date(r.date_heure).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                    {r.patient ? `${r.patient.nom} ${r.patient.prenom}` : `Patient #${r.patient_id}`}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>
                    {r.medecin ? `Dr. ${r.medecin.nom} ${r.medecin.prenom}` : `Médecin #${r.medecin_id}`}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>{r.motif || "—"}</td>
                  <td style={{ padding: "10px 14px" }}><Badge s={r.statut} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.statut === "en_attente" && (
                        <button onClick={() => changerStatut(r, "confirme")} style={{ background: "#e6f7f2", color: "#0f6e56", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Confirmer</button>
                      )}
                      <button onClick={() => openEdit(r)} style={{ background: "#eef6fb", color: "#0a5c8a", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Modifier</button>
                      <button onClick={() => remove(r.id)} style={{ background: "#fdeaea", color: "#c0392b", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  );
}
