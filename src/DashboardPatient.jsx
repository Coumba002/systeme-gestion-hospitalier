import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "./api";
import { getStatsPatient, getRendezVous, getPrescriptions, getResultats, getMessages, getPatients, getMedecins } from "./api";
import { printOrdonnance } from "./utils/printPdf";
import PatientRendezVous from "./sections/PatientRendezVous";
import Messagerie from "./sections/Messagerie";
import Logo from "./components/Logo";
import { useUnreadMessages } from "./hooks/useUnreadMessages";
import { ThemeToggle } from "./hooks/useTheme";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fa; }

  .sidebar { width: 240px; background: linear-gradient(180deg, #0f6e56 0%, #1a9e75 100%); height: 100vh; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; z-index: 10; overflow-y: auto; overflow-x: hidden; }
  .sidebar::-webkit-scrollbar { width: 6px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 3px; }
  .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
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

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .card { background: #fff; border-radius: 12px; border: 1px solid #e8edf2; padding: 20px; }
  .card-title { font-size: 14px; font-weight: 700; color: #0d1f2d; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
  .card-link { font-size: 12px; color: #0f6e56; font-weight: 600; cursor: pointer; }

  .badge { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; }
  .badge-vert { background: #e6f7f2; color: #0f6e56; }
  .badge-bleu { background: #eef6fb; color: #0a5c8a; }
  .badge-orange { background: #fef3e2; color: #854f0b; }
  .badge-rouge { background: #fdeaea; color: #c0392b; }

  .rdv-card { border: 1px solid #e8edf2; border-radius: 10px; padding: 14px; margin-bottom: 10px; display: flex; gap: 14px; align-items: center; transition: box-shadow 0.15s; }
  .rdv-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .rdv-date-block { background: #e6f7f2; border-radius: 8px; padding: 8px 12px; text-align: center; min-width: 52px; flex-shrink: 0; }
  .rdv-day { font-size: 20px; font-weight: 700; color: #0f6e56; font-family: 'Playfair Display', serif; }
  .rdv-month { font-size: 10px; color: #0f6e56; font-weight: 600; text-transform: uppercase; }

  .result-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f4f8; cursor: pointer; }
  .result-item:last-child { border-bottom: none; }

  .msg-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f4f8; cursor: pointer; }
  .msg-item:last-child { border-bottom: none; }
  .msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e6f7f2; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0f6e56; flex-shrink: 0; }
  .msg-bubble-in { background: #f0f4f8; color: #0d1f2d; border-radius: 10px; border-bottom-left-radius: 3px; padding: 10px 14px; font-size: 13px; line-height: 1.55; max-width: 70%; align-self: flex-start; }
  .msg-bubble-out { background: #0f6e56; color: #fff; border-radius: 10px; border-bottom-right-radius: 3px; padding: 10px 14px; font-size: 13px; line-height: 1.55; max-width: 70%; align-self: flex-end; }

  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #0f6e56; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.6); font-size: 13px; background: transparent; border: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,0,0,0.15); color: #ff8080; }

  .btn-primary { background: #0f6e56; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-primary:hover { background: #1a9e75; }
  .btn-secondary { background: #fff; color: #0f6e56; border: 1px solid #0f6e56; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }

  .info-item { background: #f9fbfc; border-radius: 8px; padding: 10px 14px; }
  .info-label { font-size: 10px; color: #7a90a0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .info-value { font-size: 13px; color: #0d1f2d; font-weight: 600; }

  .tab-btn { padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e8edf2; background: #f4f7fa; color: #4a6070; font-family: 'Plus Jakarta Sans', sans-serif; margin-right: 6px; margin-bottom: 14px; }
  .tab-btn.active { background: #0f6e56; color: #fff; border-color: #0f6e56; }

  .thread-item { padding: 12px 16px; border-bottom: 1px solid #f0f4f8; cursor: pointer; transition: background 0.1s; }
  .thread-item:hover { background: #f9fbfc; }
  .thread-item.selected { background: #e6f7f2; }

  .alert-card { border-left: 3px solid; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
  .alert-vert { border-left-color: #0f6e56; background: #f0fbf7; }
  .alert-orange { border-left-color: #ef9f27; background: #fffbf0; }
  .alert-rouge { border-left-color: #c0392b; background: #fff5f5; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; font-weight: 600; color: #7a90a0; padding: 0 10px 10px; border-bottom: 1px solid #f0f4f8; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 10px; border-bottom: 1px solid #f0f4f8; color: #1a2332; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbfc; }
`;

const menuItems = [
  { icon: "🏠", label: "Mon espace", key: "dashboard" },
  { icon: "📅", label: "Mes rendez-vous", key: "rdv" },
  { icon: "📋", label: "Mon dossier médical", key: "dossier" },
  { icon: "💊", label: "Mes ordonnances", key: "ordonnances" },
  { icon: "🔬", label: "Résultats d'examens", key: "resultats" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];

function Badge({ statut, label }) {
  const map = { vert: "badge-vert", bleu: "badge-bleu", orange: "badge-orange", rouge: "badge-rouge", confirme: "badge-vert", attente: "badge-orange", actif: "badge-vert", expire: "badge-rouge" };
  const lblMap = { confirme: "Confirmé", attente: "En attente", actif: "Actif", expire: "Expiré" };
  return <span className={`badge ${map[statut] || "badge-bleu"}`}>{label || lblMap[statut] || statut}</span>;
}

function SectionDashboard({ setActiveMenu, prenom, nom, initiales, dateAujourdhui, patientId }) {
  const [stats, setStats] = React.useState(null);
  const [rdvs, setRdvs] = React.useState([]);
  const [ordonnances, setOrdonnances] = React.useState([]);
  const [resultats, setResultats] = React.useState([]);
  const [patient, setPatient] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [s, r, o, rs, pl] = await Promise.all([
          getStatsPatient(), getRendezVous(), getPrescriptions(), getResultats(), getPatients(),
        ]);
        setStats(s);
        setRdvs(Array.isArray(r) ? r : r.data || []);
        setOrdonnances(Array.isArray(o) ? o : o.data || []);
        setResultats(Array.isArray(rs) ? rs : rs.data || []);
        const arr = Array.isArray(pl) ? pl : pl.data || [];
        setPatient(arr.find(p => p.id === patientId) || arr[0]);
      } catch (e) { console.error(e); }
    }
    load();
  }, [patientId]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Bonjour, {prenom} 👋</div>
          <div className="page-sub">{dateAujourdhui} · Voici votre espace santé</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <div className="user-pill">
            <div className="user-avatar">{initiales}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{prenom} {nom}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: "📅", bg: "#e6f7f2", value: stats?.rdv_a_venir || 0, label: "Prochains rendez-vous" },
          { icon: "💊", bg: "#eef6fb", value: stats?.ordonnances_actives || 0, label: "Ordonnances actives" },
          { icon: "🔬", bg: "#f3efff", value: stats?.resultats_recents || 0, label: "Résultats disponibles" },
          { icon: "👨‍⚕️", bg: "#fef3e2", value: "1", label: "Médecin traitant" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Mes prochains rendez-vous <span className="card-link" onClick={() => setActiveMenu("rdv")}>Voir tout →</span></div>
          {rdvs.slice(0, 2).map((r, i) => {
            const date = new Date(r.date_heure);
            return (
              <div key={i} className="rdv-card">
                <div className="rdv-date-block">
                  <div className="rdv-day">{date.getDate()}</div>
                  <div className="rdv-month">{date.toLocaleString('fr-FR', {month: 'short'})}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-primary" style={{ fontSize: 13, fontWeight: 700 }}>Dr. #{r.medecin_id}</div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{r.motif} · {date.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <Badge statut={r.statut} />
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">Mon dossier médical <span className="card-link" onClick={() => setActiveMenu("dossier")}>Détail →</span></div>
          {[
            ["Groupe sanguin", patient?.groupe_sanguin || "—"],
            ["Allergies", patient?.allergies || "Aucune"],
            ["Antécédents", patient?.antecedents || "Aucun"],
            ["Mutuelle", patient?.mutuelle || "—"],
            ["Téléphone", patient?.telephone || "—"],
            ["Contact urgence", patient?.contact_urgence || "—"],
          ].map(([lbl, val], i) => (
            <div key={i} className="kv-row" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid #f0f4f8" : "none", gap: 8 }}>
              <span className="text-muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{lbl}</span>
              <span className="text-primary" style={{ fontSize: 13, fontWeight: 600, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Résultats d'examens <span className="card-link" onClick={() => setActiveMenu("resultats")}>Voir →</span></div>
          {resultats.slice(0, 4).map((r, i) => (
            <div key={i} className="result-item">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{r.type_examen}</div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{new Date(r.date_examen).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Mes ordonnances <span className="card-link" onClick={() => setActiveMenu("ordonnances")}>Voir →</span></div>
          {ordonnances.slice(0, 3).map((o, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>{o.medicaments}</div>
              <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>Dr. #{o.medecin_id}</div>
              <div style={{ fontSize: 10, color: "#0f6e56", marginTop: 4, fontWeight: 600 }}>Le {new Date(o.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Messagerie <span className="card-link" onClick={() => setActiveMenu("messagerie")}>Voir →</span></div>
        </div>
      </div>
    </>
  );
}

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
      <div className="pg-header">Mes rendez-vous</div>
      <div className="pg-sub-text">Consultations et examens programmés</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Rendez-vous à venir</div>
        {rdvs.map((r, i) => {
          const date = new Date(r.date_heure);
          return (
            <div key={i} className="rdv-card">
              <div className="rdv-date-block">
                <div className="rdv-day">{date.getDate()}</div>
                <div className="rdv-month">{date.toLocaleString('fr-FR', {month: 'short'})}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>Dr. #{r.medecin_id}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", marginTop: 3 }}>{r.motif}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#7a90a0" }}>🕐 {date.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <Badge statut={r.statut} />
                <span className="card-link" style={{ fontSize: 11 }}>Annuler</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card">
        <div className="card-title">Historique des consultations</div>
        <table>
          <thead><tr><th>Date</th><th>Médecin</th><th>Type</th><th>Documents</th></tr></thead>
          <tbody>
            {[
              ["15 avr. 2026", "Dr. Diallo B.", "Consultation de suivi", "Compte-rendu disponible"],
              ["01 avr. 2026", "Dr. Diallo B.", "Renouvellement ordonnance", "Ordonnance disponible"],
              ["15 mars 2026", "Dr. Fall A.", "Bilan cardiaque", "Résultats disponibles"],
              ["01 févr. 2026", "Dr. Sow M.", "Visite annuelle", "Compte-rendu disponible"],
            ].map(([date, med, type, doc], i) => (
              <tr key={i}>
                <td style={{ color: "#7a90a0" }}>{date}</td>
                <td style={{ fontWeight: 600 }}>{med}</td>
                <td style={{ color: "var(--text-secondary, #4a6070)" }}>{type}</td>
                <td><span className="card-link">{doc} →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SectionDossier({ prenom, nom, initiales, patientId }) {
  const [activeTab, setActiveTab] = useState("infos");
  const [patient, setPatient] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [consultations, setConsultations] = useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const [list, rs] = await Promise.all([getPatients(), getResultats()]);
        const arr = Array.isArray(list) ? list : list.data || [];
        const me = arr.find(p => p.id === patientId) || arr[0];
        setPatient(me);
        setResultats(Array.isArray(rs) ? rs : rs.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, [patientId]);

  const tabs = [
    { key: "infos", label: "Informations" },
    { key: "antecedents", label: "Antécédents & allergies" },
    { key: "examens", label: `Résultats d'examens (${resultats.length})` },
  ];

  const calcAge = (dn) => {
    if (!dn) return null;
    const d = new Date(dn);
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };
  const age = calcAge(patient?.date_naissance);

  const allergiesList = (patient?.allergies || "").split(/[,·;\n]/).map(s => s.trim()).filter(Boolean);
  const antecedentsList = (patient?.antecedents || "").split(/[·;\n]/).map(s => s.trim()).filter(Boolean);

  return (
    <>
      <div className="pg-header">Mon dossier médical</div>
      <div className="pg-sub-text">Toutes vos informations de santé en un seul endroit</div>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 200, background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0, alignSelf: "flex-start" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e6f7f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#0f6e56" }}>{initiales}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>{prenom} {nom}</div>
            <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>ID Patient #{patient?.id || "—"}</div>
            {age != null && <div style={{ fontSize: 12, color: "#0f6e56", marginTop: 4, fontWeight: 600 }}>{age} ans</div>}
          </div>
          <div style={{ background: "#e6f7f2", borderRadius: 8, padding: "8px 16px", textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f6e56", fontFamily: "'Playfair Display', serif" }}>
              {patient?.groupe_sanguin || "—"}
            </div>
            <div style={{ fontSize: 10, color: "#0f6e56", fontWeight: 600 }}>Groupe sanguin</div>
          </div>
          {patient?.mutuelle && (
            <div style={{ background: "#eef6fb", borderRadius: 8, padding: "8px 12px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0a5c8a" }}>{patient.mutuelle}</div>
              <div style={{ fontSize: 10, color: "#0a5c8a" }}>Mutuelle</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="card">
            <div>{tabs.map(t => <button key={t.key} className={`tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}</div>

            {activeTab === "infos" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Nom complet", `${patient?.nom || nom} ${patient?.prenom || prenom}`],
                  ["Date de naissance", patient?.date_naissance ? new Date(patient.date_naissance).toLocaleDateString("fr-FR") : "—"],
                  ["Sexe", patient?.sexe || "—"],
                  ["Téléphone", patient?.telephone || "—"],
                  ["Email", patient?.email || "—"],
                  ["Adresse", patient?.adresse || "—"],
                  ["N° Sécurité sociale", patient?.numero_securite_sociale || "—"],
                  ["Contact d'urgence", patient?.contact_urgence || "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="info-item">
                    <div className="info-label">{lbl}</div>
                    <div className="info-value">{val}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "antecedents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="info-item">
                  <div className="info-label">Allergies médicamenteuses</div>
                  {allergiesList.length ? (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {allergiesList.map((a, i) => (
                        <span key={i} className="badge badge-rouge">⚠ {a}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, marginTop: 6, color: "#7a90a0", fontStyle: "italic" }}>Aucune allergie enregistrée</div>
                  )}
                </div>
                <div className="info-item">
                  <div className="info-label">Antécédents médicaux</div>
                  {antecedentsList.length ? (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {antecedentsList.map((a, i) => (
                        <div key={i} style={{ fontSize: 13, color: "var(--text-primary, #0d1f2d)", paddingLeft: 12, borderLeft: "2px solid #0f6e56" }}>{a}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, marginTop: 6, color: "#7a90a0", fontStyle: "italic" }}>Aucun antécédent enregistré</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "examens" && (
              resultats.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Aucun résultat d'examen disponible pour le moment.</div>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th>Examen</th><th>Valeur</th><th>Interprétation</th></tr></thead>
                  <tbody>
                    {resultats.map(r => {
                      const interMap = { normal: ["vert", "Normal"], a_surveiller: ["orange", "À surveiller"], anormal: ["rouge", "Anormal"] };
                      const [statut, lb] = interMap[r.interpretation] || ["bleu", r.interpretation || "—"];
                      return (
                        <tr key={r.id}>
                          <td style={{ color: "#7a90a0" }}>{r.date_examen ? new Date(r.date_examen).toLocaleDateString("fr-FR") : "—"}</td>
                          <td style={{ fontWeight: 600 }}>{r.nom_examen || r.type_examen}</td>
                          <td>{r.valeur} {r.unite}</td>
                          <td><Badge statut={statut} label={lb} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionOrdonnances({ patientId }) {
  const [ordonnances, setOrdonnances] = React.useState([]);
  const [medecins, setMedecinsList] = React.useState([]);
  const [patient, setPatient] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [o, md, pl] = await Promise.all([getPrescriptions(), getMedecins(), getPatients()]);
        setOrdonnances(Array.isArray(o) ? o : o.data || []);
        setMedecinsList(Array.isArray(md) ? md : md.data || []);
        const arr = Array.isArray(pl) ? pl : pl.data || [];
        setPatient(arr.find(p => p.id === patientId) || arr[0]);
      } catch (e) { console.error(e); }
    }
    load();
  }, [patientId]);

  return (
    <>
      <div className="pg-header">Mes ordonnances</div>
      <div className="pg-sub-text">Toutes mes ordonnances — téléchargez en PDF pour la pharmacie</div>
      <div className="grid-2">
        <div>
          {ordonnances.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#7a90a0", background: "#fff", border: "1px solid #e8edf2", borderRadius: 12 }}>
              Aucune ordonnance pour le moment
            </div>
          )}
          {ordonnances.map((o, i) => {
            const med = medecins.find(m => m.id === o.medecin_id);
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: 18, marginBottom: 14, borderLeft: `4px solid #0f6e56` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>{o.medicaments}</div>
                </div>
                {(o.dosage || o.frequence || o.duree) && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", marginBottom: 8 }}>
                    {[o.dosage, o.frequence, o.duree].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#7a90a0" }}>
                    Prescrit par Dr. {med ? `${med.nom} ${med.prenom}` : `#${o.medecin_id}`} · Le {new Date(o.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  <button
                    onClick={() => printOrdonnance({ prescription: o, patient, medecin: med })}
                    className="btn-primary"
                    style={{ fontSize: 11, padding: "5px 12px" }}
                  >
                    🖨 PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Instructions importantes</div>
            <div className="alert-card alert-rouge"><div style={{ fontSize: 12, fontWeight: 700, color: "#c0392b" }}>Allergie connue</div><div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>Ne jamais prendre de Pénicilline ou AINS sans avis médical.</div></div>
            <div className="alert-card alert-orange"><div style={{ fontSize: 12, fontWeight: 700, color: "#854f0b" }}>Renouvellement bientôt</div><div style={{ fontSize: 11, color: "#854f0b", marginTop: 3 }}>Amlodipine expire le 10 mai. Contactez Dr. Diallo B.</div></div>
          </div>
          <div className="card">
            <div className="card-title">Pharmacies partenaires</div>
            {[
              { nom: "Pharmacie Centrale Dakar", addr: "Avenue Léopold Sédar Senghor", tel: "+221 33 821 00 00" },
              { nom: "Pharmacie Liberté 6", addr: "Rue 10 × Av. Bourguiba", tel: "+221 33 825 12 34" },
              { nom: "Pharmacie Fann", addr: "Route de Fann", tel: "+221 33 825 03 22" },
            ].map((p, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{p.nom}</div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{p.addr}</div>
                <div style={{ fontSize: 11, color: "#0f6e56", marginTop: 2, fontWeight: 600 }}>{p.tel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionResultats() {
  const [selected, setSelected] = useState(null);
  const [resultats, setResultats] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const rs = await getResultats();
        setResultats(Array.isArray(rs) ? rs : rs.data || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Résultats d'examens</div>
      <div className="pg-sub-text">Mes résultats d'examens</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Tous mes résultats</div>
          {resultats.map((r, i) => (
            <div key={i}>
              <div className="result-item" onClick={() => setSelected(selected === i ? null : i)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{r.type_examen}</div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{new Date(r.date_examen).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "#0f6e56", fontWeight: 600 }}>{selected === i ? "Fermer ▲" : "Voir ▼"}</span>
                </div>
              </div>
              {selected === i && (
                <div style={{ margin: "0 0 8px", background: "#f9fbfc", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--text-primary, #0d1f2d)" }}>{r.interpretation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Résumé de santé</div>
            {[
              { label: "Glycémie", pct: 72, color: "#0f6e56", note: "Dans la norme" },
              { label: "Bilan lipidique", pct: 58, color: "#ef9f27", note: "À surveiller" },
              { label: "NFS", pct: 85, color: "#0f6e56", note: "Bon niveau" },
              { label: "HbA1c", pct: 63, color: "#ef9f27", note: "Limite haute" },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.note}</span>
                </div>
                <div style={{ height: 6, background: "#f0f4f8", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Recommandations</div>
            <div className="alert-card alert-orange"><div style={{ fontSize: 12, fontWeight: 700, color: "#854f0b" }}>Bilan lipidique</div><div style={{ fontSize: 11, color: "#854f0b", marginTop: 3 }}>LDL légèrement élevé. Réduisez les graisses saturées et pratiquez 30 min d'activité physique par jour.</div></div>
            <div className="alert-card alert-vert"><div style={{ fontSize: 12, fontWeight: 700, color: "#0f6e56" }}>Glycémie</div><div style={{ fontSize: 11, color: "#0f6e56", marginTop: 3 }}>Excellent contrôle glycémique. Continuez votre traitement actuel.</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

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
      <div className="pg-sub-text">Échangez avec votre médecin</div>
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 460 }}>
        {messages.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#7a90a0" }}>Aucun message</div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {messages.map((msg, i) => {
              const user = getUser();
              const isOut = msg.sender_id === user?.id;
              return (
                <div key={i} style={{ alignSelf: isOut ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div className={isOut ? "msg-bubble-out" : "msg-bubble-in"}>{msg.content}</div>
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

export default function DashboardPatient() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState(null);
  const unreadCount = useUnreadMessages(user?.id);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/connexion"); return; }
    setUser(u);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => { logout(); navigate("/connexion"); };

  const prenom = user?.prenom || user?.name?.split(" ")[0] || "Patient";
  const nom = user?.nom || user?.name?.split(" ")[1] || "";
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();
  const dateAujourdhui = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " - " + now.toLocaleTimeString("fr-FR");

  const [patientId, setPatientId] = useState(null);
  useEffect(() => {
    async function findPatient() {
      try {
        const list = await getPatients();
        const arr = Array.isArray(list) ? list : list.data || [];
        const u = getUser();
        const mine = arr.find(p => p.user_id === u?.id);
        if (mine) setPatientId(mine.id);
      } catch (e) {}
    }
    findPatient();
  }, []);

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard":   return <SectionDashboard setActiveMenu={setActiveMenu} prenom={prenom} nom={nom} initiales={initiales} dateAujourdhui={dateAujourdhui} patientId={patientId} />;
      case "rdv":         return <PatientRendezVous patientId={patientId} />;
      case "dossier":     return <SectionDossier prenom={prenom} nom={nom} initiales={initiales} patientId={patientId} />;
      case "ordonnances": return <SectionOrdonnances patientId={patientId} />;
      case "resultats":   return <SectionResultats />;
      case "messagerie":  return <Messagerie accentColor="#0f6e56" />;
      default:            return null;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Logo size={36} withText textColor="#fff" subtitleColor="rgba(255,255,255,0.7)" gap={10} />
          </div>
          <div className="sidebar-menu">
            <div className="menu-label">Menu patient</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                {item.key === "messagerie" && unreadCount > 0 && (
                  <span style={{
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: "center",
                    boxShadow: "0 0 0 2px rgba(239,68,68,0.2)",
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
              <div className="user-avatar">{initiales}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{prenom} {nom}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Patient</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Déconnexion
            </button>
          </div>
        </aside>
        <main className="main-content">
          {renderSection()}
        </main>
      </div>
    </>
  );
}