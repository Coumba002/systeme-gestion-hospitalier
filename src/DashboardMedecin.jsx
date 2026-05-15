import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MedecinConsultations from "./sections/MedecinConsultations";
import { getStatsMedecin, getPatients, getRendezVous, getMessages, getPrescriptions, getUser, logout } from "./api";
 
// ─── STYLES GLOBAUX ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fa; }
 
  .sidebar { width: 240px; background: linear-gradient(180deg, #0a5c8a 0%, #0c6ea3 100%); min-height: 100vh; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; z-index: 10; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; gap: 10px; }
  .sidebar-logo span { font-family: 'Playfair Display', serif; font-size: 18px; color: #fff; font-weight: 700; }
  .sidebar-menu { padding: 16px 12px; flex: 1; }
  .menu-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin: 16px 0 6px; }
  .menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; transition: all 0.15s; margin-bottom: 2px; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
  .menu-item:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .menu-item.active { background: rgba(255,255,255,0.18); color: #fff; font-weight: 600; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.12); }
 
  .main-content { margin-left: 240px; padding: 28px 32px; min-height: 100vh; width: calc(100% - 240px); }
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #0d1f2d; }
  .page-sub { font-size: 13px; color: #7a90a0; margin-top: 2px; }
  .pg-header { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0d1f2d; margin-bottom: 4px; }
  .pg-sub-text { font-size: 13px; color: #7a90a0; margin-bottom: 22px; }
 
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e8edf2; }
  .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .stat-value { font-size: 26px; font-weight: 700; color: #0d1f2d; font-family: 'Playfair Display', serif; }
  .stat-label { font-size: 12px; color: #7a90a0; margin-top: 2px; }
  .stat-delta { font-size: 11px; margin-top: 6px; }
 
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
  .card { background: #fff; border-radius: 12px; border: 1px solid #e8edf2; padding: 20px; }
  .card-title { font-size: 14px; font-weight: 700; color: #0d1f2d; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
  .card-link { font-size: 12px; color: #0a5c8a; font-weight: 600; cursor: pointer; }
 
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; font-weight: 600; color: #7a90a0; padding: 0 10px 10px; border-bottom: 1px solid #f0f4f8; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 10px; border-bottom: 1px solid #f0f4f8; color: #1a2332; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbfc; }
 
  .badge { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; }
  .badge-urgent { background: #fdeaea; color: #c0392b; }
  .badge-stable { background: #e6f7f2; color: #0f6e56; }
  .badge-attente { background: #fef3e2; color: #854f0b; }
  .badge-blue { background: #eef6fb; color: #0a5c8a; }
  .badge-purple { background: #f3efff; color: #7c3aed; }
 
  .rdv-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f0f4f8; }
  .rdv-item:last-child { border-bottom: none; }
  .rdv-time { font-size: 12px; font-weight: 700; color: #0a5c8a; min-width: 48px; margin-top: 2px; }
  .rdv-name { font-size: 13px; font-weight: 600; color: #0d1f2d; }
  .rdv-type { font-size: 11px; color: #7a90a0; margin-top: 2px; }
  .rdv-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
 
  .msg-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f4f8; cursor: pointer; }
  .msg-item:last-child { border-bottom: none; }
  .msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eef6fb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0a5c8a; flex-shrink: 0; }
  .msg-name { font-size: 13px; font-weight: 600; color: #0d1f2d; }
  .msg-preview { font-size: 11px; color: #7a90a0; margin-top: 2px; }
  .msg-time { font-size: 10px; color: #a0b0bc; margin-left: auto; white-space: nowrap; }
  .unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #0a5c8a; margin-top: 4px; }
 
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #0a5c8a; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.6); font-size: 13px; background: transparent; border: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,0,0,0.15); color: #ff8080; }
 
  .search-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }
  .search-bar input { flex: 1; padding: 9px 14px; border: 1px solid #e8edf2; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: #0d1f2d; }
  .search-bar input:focus { border-color: #0a5c8a; }
  .btn-primary { background: #0a5c8a; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-primary:hover { background: #0c6ea3; }
  .btn-secondary { background: #fff; color: #0a5c8a; border: 1px solid #0a5c8a; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
 
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-item { background: #f9fbfc; border-radius: 8px; padding: 10px 14px; }
  .info-label { font-size: 10px; color: #7a90a0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .info-value { font-size: 13px; color: #0d1f2d; font-weight: 600; }
 
  .tab-btn { padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e8edf2; background: #f4f7fa; color: #4a6070; font-family: 'Plus Jakarta Sans', sans-serif; margin-right: 6px; margin-bottom: 14px; }
  .tab-btn.active { background: #0a5c8a; color: #fff; border-color: #0a5c8a; }
 
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-size: 11px; font-weight: 600; color: #4a6070; }
  .form-group input, .form-group select, .form-group textarea { padding: 9px 12px; border: 1px solid #e8edf2; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: #0d1f2d; }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0a5c8a; }
 
  .thread-item { padding: 12px 16px; border-bottom: 1px solid #f0f4f8; cursor: pointer; transition: background 0.1s; }
  .thread-item:hover { background: #f9fbfc; }
  .thread-item.selected { background: #eef6fb; }
  .msg-bubble { padding: 10px 14px; border-radius: 10px; font-size: 13px; line-height: 1.55; max-width: 70%; }
  .msg-bubble-in { background: #f0f4f8; color: #0d1f2d; align-self: flex-start; border-bottom-left-radius: 3px; }
  .msg-bubble-out { background: #0a5c8a; color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
 
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 6px; }
  .cal-day-label { text-align: center; font-size: 10px; font-weight: 600; color: #7a90a0; text-transform: uppercase; padding: 4px 0; }
  .cal-cell { text-align: center; padding: 6px 2px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #1a2332; transition: background 0.1s; }
  .cal-cell:hover { background: #eef6fb; }
  .cal-cell.today { background: #0a5c8a; color: #fff; font-weight: 700; }
  .cal-cell.has-rdv { font-weight: 700; color: #0a5c8a; }
  .cal-cell.today.has-rdv { color: #fff; }
`;

const menuItems = [
  { icon: "🏠", label: "Tableau de bord", key: "dashboard" },
  { icon: "👥", label: "Mes patients", key: "patients" },
  { icon: "📅", label: "Rendez-vous", key: "rdv" },
  { icon: "🔬", label: "Consultations", key: "consultations" },
  { icon: "📋", label: "Dossiers médicaux", key: "dossiers" },
  { icon: "💊", label: "Ordonnances", key: "ordonnances" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];
 
// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────────
function Badge({ statut }) {
  const map = {
    urgent: ["badge-urgent", "Urgent"],
    stable: ["badge-stable", "Stable"],
    attente: ["badge-attente", "En attente"],
    blue: ["badge-blue", "Collègue"],
    purple: ["badge-purple", "Externe"],
  };
  const [cls, label] = map[statut] || ["badge-attente", statut];
  return <span className={`badge ${cls}`}>{label}</span>;
}
 
function Avatar({ initiales, bg, tc, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.31, fontWeight: 700, color: tc, flexShrink: 0 }}>
      {initiales}
    </div>
  );
}
 
// ─── SECTION : TABLEAU DE BORD ────────────────────────────────────────────────
function SectionDashboard({ setActiveMenu, prenom, nom, initiales, dateAujourdhui }) {
  const [stats, setStats] = React.useState(null);
  const [rdvs, setRdvs] = React.useState([]);
  const [patients, setPatients] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const [s, r, p] = await Promise.all([getStatsMedecin(), getRendezVous(), getPatients()]);
        setStats(s);
        setRdvs(Array.isArray(r) ? r : r.data || []);
        setPatients(Array.isArray(p) ? p : p.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Tableau de bord — Médecin</div>
          <div className="page-sub">{dateAujourdhui} · Service de médecine interne</div>
        </div>
        <div className="user-pill">
          <div className="user-avatar">{initiales}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{prenom} {nom}</span>
        </div>
      </div>
 
      <div className="stats-grid">
        {[
          { icon: "👥", bg: "#eef6fb", value: stats?.patients_suivis || 0, label: "Patients suivis", delta: "Actifs", deltaColor: "#0f6e56" },
          { icon: "📅", bg: "#e6f7f2", value: stats?.rdv_a_venir || 0, label: "Rendez-vous à venir", delta: "Planifiés", deltaColor: "#7a90a0" },
          { icon: "🚨", bg: "#fdeaea", value: stats?.cas_urgents || 0, label: "Cas urgents", delta: "Attention requise", deltaColor: "#c0392b" },
          { icon: "💊", bg: "#f3efff", value: stats?.ordonnances_emis || 0, label: "Ordonnances", delta: "Total", deltaColor: "#0f6e56" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta" style={{ color: s.deltaColor }}>{s.delta}</div>
          </div>
        ))}
      </div>
 
      <div className="grid-3">
        <div className="card">
          <div className="card-title">Mes patients <span className="card-link" onClick={() => setActiveMenu("patients")}>Voir tout →</span></div>
          <table>
            <thead><tr><th>Patient</th><th>Téléphone</th><th>Groupe Sanguin</th></tr></thead>
            <tbody>
              {patients.slice(0, 5).map((p, i) => (
                <tr key={i}>
                  <td><div style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</div></td>
                  <td style={{ color: "#4a6070" }}>{p.telephone}</td>
                  <td style={{ color: "#4a6070" }}>{p.groupe_sanguin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">Rendez-vous du jour <span className="card-link" onClick={() => setActiveMenu("rdv")}>Agenda →</span></div>
          {rdvs.slice(0,5).map((r, i) => (
            <div key={i} className="rdv-item">
              <div className="rdv-dot" style={{ background: "#0f6e56" }} />
              <div><div className="rdv-time">{new Date(r.date_heure).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div><div className="rdv-name">Patient #{r.patient_id}</div><div className="rdv-type">{r.motif || 'Suivi'}</div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
 
// ─── SECTION : MES PATIENTS ───────────────────────────────────────────────────
function SectionPatients({ setActiveMenu }) {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const d = await getPatients();
        setPatients(Array.isArray(d) ? d : d.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  const filtres = patients.filter(p => {
    const matchSearch = p.nom?.toLowerCase().includes(search.toLowerCase()) || p.prenom?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });
 
  return (
    <>
      <div className="pg-header">Mes patients</div>
      <div className="pg-sub-text">{patients.length} patients sous suivi actif</div>
      <div className="search-bar">
        <input type="text" placeholder="Rechercher un patient..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary">+ Nouveau patient</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Patient</th><th>Téléphone</th><th>Adresse</th><th>Sexe</th><th>Groupe Sanguin</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtres.map((p, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initiales={(p.nom||"A")[0] + (p.prenom||"A")[0]} bg="#eef6fb" tc="#0a5c8a" size={32} />
                    <div style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</div>
                  </div>
                </td>
                <td>{p.telephone}</td>
                <td>{p.adresse}</td>
                <td>{p.sexe}</td>
                <td>{p.groupe_sanguin}</td>
                <td><span className="card-link" onClick={() => setActiveMenu("dossiers")}>Dossier →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
 
// ─── SECTION : RENDEZ-VOUS ────────────────────────────────────────────────────
function SectionRdv() {
  const [rdvs, setRdvs] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const r = await getRendezVous();
        setRdvs(Array.isArray(r) ? r : r.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Rendez-vous</div>
      <div className="pg-sub-text">Agenda Médecin</div>
      <div className="grid-2">
        {/* RDV du jour */}
        <div className="card">
          <div className="card-title">Aujourd'hui</div>
          {rdvs.map((r, i) => (
            <div key={i} className="rdv-item">
              <div className="rdv-dot" style={{ background: "#0a5c8a" }} />
              <div style={{ flex: 1 }}>
                <div className="rdv-time">{new Date(r.date_heure).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="rdv-name">Patient #{r.patient_id}</div>
                <div className="rdv-type">{r.motif}</div>
              </div>
              <Badge statut={r.statut} />
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" style={{ width: "100%" }}>+ Nouveau rendez-vous</button>
          </div>
        </div>
      </div>
    </>
  );
}
 
// ─── SECTION : DOSSIERS MÉDICAUX ──────────────────────────────────────────────
function SectionDossiers() {
  const [activeTab, setActiveTab] = React.useState("info");
  const [patients, setPatients] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const d = await getPatients();
        setPatients(Array.isArray(d) ? d : d.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  const tabs = [
    { key: "info", label: "Infos générales" },
    { key: "antecedents", label: "Antécédents" },
    { key: "examens", label: "Examens" },
    { key: "traitements", label: "Traitements" },
  ];
 
  return (
    <>
      <div className="pg-header">Dossiers médicaux</div>
      <div className="pg-sub-text">Consultation et gestion des dossiers patients</div>
      <div className="search-bar">
        <input type="text" placeholder="Rechercher par nom, ID ou diagnostic..." />
        <button className="btn-primary">Rechercher</button>
      </div>
 
      {/* Dossier ouvert : Fatou Ndiaye */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initiales="FN" bg="#eef6fb" tc="#0a5c8a" size={48} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0d1f2d" }}>Fatou Ndiaye</div>
              <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>ID: SGH-2024-0041 · Chambre 204-A</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge statut="stable" />
            <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 6 }}>Dernière MAJ: 04/05/2026</div>
          </div>
        </div>
 
        {/* Onglets */}
        <div>{tabs.map(t => (
          <button key={t.key} className={`tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}</div>
 
        {/* Contenu onglets */}
        {activeTab === "info" && (
          <div className="info-grid">
            {[["Nom complet", "Fatou Ndiaye"], ["Date de naissance", "12/03/1978 (48 ans)"], ["Groupe sanguin", "A+"], ["Téléphone", "+221 77 123 45 67"], ["Diagnostic principal", "Diabète de type 2"], ["Médecin référent", "Dr. Diallo B."]].map(([lbl, val]) => (
              <div key={lbl} className="info-item"><div className="info-label">{lbl}</div><div className="info-value">{val}</div></div>
            ))}
          </div>
        )}
        {activeTab === "antecedents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="info-item"><div className="info-label">Antécédents médicaux</div><div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6, color: "#1a2332" }}>Diabète type 2 diagnostiqué en 2018 · Hypertension légère depuis 2021 · Obésité modérée (IMC 29.4)</div></div>
            <div className="info-item"><div className="info-label">Allergies</div><div style={{ marginTop: 4 }}><span className="badge badge-urgent">Pénicilline</span> <span className="badge badge-attente" style={{ marginLeft: 4 }}>AINS</span></div></div>
            <div className="info-item"><div className="info-label">Antécédents familiaux</div><div style={{ fontSize: 13, marginTop: 4, color: "#1a2332" }}>Diabète (mère, sœur) · Cardiopathie ischémique (père)</div></div>
          </div>
        )}
        {activeTab === "examens" && (
          <table>
            <thead><tr><th>Date</th><th>Type d'examen</th><th>Résultat</th><th>Interprétation</th></tr></thead>
            <tbody>
              {[
                ["02/05/2026", "Glycémie à jeun", "7.8 mmol/L", "attente", "Élevé"],
                ["02/05/2026", "HbA1c", "7.2%", "attente", "Limite"],
                ["28/04/2026", "Tension artérielle", "138/88 mmHg", "attente", "Surveillé"],
                ["15/04/2026", "Bilan lipidique", "LDL 3.1 mmol/L", "stable", "Normal"],
              ].map(([date, type, res, statut, lbl], i) => (
                <tr key={i}><td>{date}</td><td>{type}</td><td style={{ fontWeight: 600 }}>{res}</td><td><span className={`badge badge-${statut}`}>{lbl}</span></td></tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === "traitements" && (
          <table>
            <thead><tr><th>Médicament</th><th>Posologie</th><th>Fréquence</th><th>Depuis</th><th>Statut</th></tr></thead>
            <tbody>
              {[
                ["Metformine 500mg", "500mg", "2×/jour", "Jan 2024"],
                ["Amlodipine 5mg", "5mg", "1×/jour", "Mars 2021"],
                ["Aspirine 100mg", "100mg", "1×/jour", "Juin 2022"],
              ].map(([med, dose, freq, depuis], i) => (
                <tr key={i}><td style={{ fontWeight: 600 }}>{med}</td><td>{dose}</td><td>{freq}</td><td>{depuis}</td><td><span className="badge badge-stable">Actif</span></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
 
      {/* Autres dossiers réduits */}
      {patients.slice(0, 4).map((p, i) => (
        <div key={i} className="card" style={{ marginBottom: 10, cursor: "pointer", opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initiales={(p.nom||"A")[0] + (p.prenom||"A")[0]} bg="#eef6fb" tc="#0a5c8a" size={44} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f2d" }}>{p.nom} {p.prenom}</div>
              <div style={{ fontSize: 12, color: "#7a90a0" }}>ID: {p.id}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
 
// ─── SECTION : ORDONNANCES ────────────────────────────────────────────────────
function SectionOrdonnances() {
  const [patients, setPatients] = React.useState([]);
  const [prescriptions, setPrescriptions] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const [p, pr] = await Promise.all([getPatients(), getPrescriptions()]);
        setPatients(Array.isArray(p) ? p : p.data || []);
        setPrescriptions(Array.isArray(pr) ? pr : pr.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Ordonnances</div>
      <div className="pg-sub-text">Gestion et création des prescriptions médicales</div>
      <div className="grid-2">
        {/* Formulaire */}
        <div className="card">
          <div className="card-title">Nouvelle ordonnance</div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient</label>
              <select>
                {patients.map(p => <option key={p.id}>{p.nom} {p.prenom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" defaultValue="2026-05-04" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4a6070", marginBottom: 10 }}>Médicaments prescrits</div>
            <div style={{ background: "#f9fbfc", borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div className="form-row" style={{ marginBottom: 10 }}>
                <div className="form-group"><label>Médicament</label><input type="text" defaultValue="Metformine" /></div>
                <div className="form-group"><label>Dosage</label><input type="text" defaultValue="500mg" /></div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group"><label>Fréquence</label><select><option>2 fois/jour</option><option>1 fois/jour</option><option>3 fois/jour</option></select></div>
                <div className="form-group"><label>Durée</label><input type="text" defaultValue="30 jours" /></div>
              </div>
            </div>
            <button className="btn-secondary" style={{ width: "100%", fontSize: 12 }}>+ Ajouter un médicament</button>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Instructions / Notes</label>
            <textarea rows={3} placeholder="Instructions particulières pour le patient..." />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ flex: 1 }}>Valider l'ordonnance</button>
            <button className="btn-secondary">Imprimer</button>
          </div>
        </div>
 
        {/* Historique */}
        <div className="card">
          <div className="card-title">Historique des ordonnances</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prescriptions.map((o, i) => (
              <div key={i} style={{ background: "#f9fbfc", borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid #0f6e56` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>Patient #{o.patient_id}</div>
                  <span style={{ fontSize: 11, color: "#a0b0bc" }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4a6070", marginTop: 4 }}>{o.medicaments}</div>
              </div>
            ))}
            {prescriptions.length === 0 && <div style={{color:"#7a90a0", fontSize:13}}>Aucune ordonnance</div>}
          </div>
        </div>
      </div>
    </>
  );
}
 
// ─── SECTION : MESSAGERIE ─────────────────────────────────────────────────────
function SectionMessagerie() {
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const m = await getMessages();
        setMessages(Array.isArray(m) ? m : m.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Messagerie</div>
      <div className="pg-sub-text">Communications internes et messages patients</div>
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 460 }}>
        {messages.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#7a90a0" }}>Aucun message</div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {messages.map((msg, i) => {
              const isOut = msg.sender_id === getUser()?.id;
              return (
                <div key={i} style={{ alignSelf: isOut ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div className={`msg-bubble ${isOut ? "msg-bubble-out" : "msg-bubble-in"}`}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: "#a0b0bc", marginTop: 3, textAlign: isOut ? "right" : "left" }}>{new Date(msg.created_at).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
 
// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardMedecin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/connexion"); return; }
    setUser(u);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const prenom = user?.prenom || user?.name?.split(" ")[0] || "Dr.";
  const nom = user?.nom || user?.name?.split(" ")[1] || "Médecin";
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "DR";
  const dateAujourdhui = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " - " + now.toLocaleTimeString("fr-FR");

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard":    return <SectionDashboard setActiveMenu={setActiveMenu} prenom={prenom} nom={nom} initiales={initiales} dateAujourdhui={dateAujourdhui} />;
      case "patients":     return <SectionPatients setActiveMenu={setActiveMenu} />;
      case "rdv":          return <SectionRdv />;
      case "consultations":return <MedecinConsultations />;
      case "dossiers":     return <SectionDossiers />;
      case "ordonnances":  return <SectionOrdonnances />;
      case "messagerie":   return <SectionMessagerie />;
      default:             return null;
    }
  };
 
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
 
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z" />
              </svg>
            </div>
            <span>KDG Health</span>
          </div>
 
          <div className="sidebar-menu">
            <div className="menu-label">Menu principal</div>
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`menu-item${activeMenu === item.key ? " active" : ""}`}
                onClick={() => setActiveMenu(item.key)}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.key === "messagerie" && (
                  <span style={{ background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8, marginLeft: "auto" }}>2</span>
                )}
              </button>
            ))}
          </div>
 
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
              <div className="user-avatar">{initiales}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{prenom} {nom}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Médecin généraliste</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/connexion"); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Déconnexion
            </button>
          </div>
        </aside>
 
        {/* Contenu principal */}
        <main className="main-content">
          {renderSection()}
        </main>
 
      </div>
    </>
  );
}
