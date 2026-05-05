import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── STYLES GLOBAUX ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fa; }

  .sidebar { width: 240px; background: linear-gradient(180deg, #0f6e56 0%, #1a9e75 100%); min-height: 100vh; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; z-index: 10; }
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

// ─── DONNÉES ──────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: "🏠", label: "Mon espace", key: "dashboard" },
  { icon: "📅", label: "Mes rendez-vous", key: "rdv" },
  { icon: "📋", label: "Mon dossier médical", key: "dossier" },
  { icon: "💊", label: "Mes ordonnances", key: "ordonnances" },
  { icon: "🔬", label: "Résultats d'examens", key: "resultats" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];

const tousRdvs = [
  { day: "30", month: "Avr", heure: "10h00", medecin: "Dr. Diallo B.", type: "Consultation de suivi", lieu: "Cabinet 3 · Bâtiment A", statut: "confirme" },
  { day: "05", month: "Mai", heure: "14h30", medecin: "Dr. Fall A.", type: "Analyse sanguine", lieu: "Labo · Rez-de-chaussée", statut: "attente" },
  { day: "12", month: "Mai", heure: "09h00", medecin: "Dr. Sow M.", type: "Contrôle glycémie", lieu: "Cabinet 7 · Bâtiment B", statut: "confirme" },
  { day: "20", month: "Mai", heure: "11h00", medecin: "Dr. Diallo B.", type: "Renouvellement ordonnance", lieu: "Cabinet 3 · Bâtiment A", statut: "attente" },
];

const ordonnances = [
  { med: "Metformine 500mg", freq: "2× par jour, après les repas", exp: "30 mai 2026", color: "#0f6e56", statut: "actif", prescrit: "Dr. Diallo B.", date: "01 avr. 2026" },
  { med: "Vitamine D 1000UI", freq: "1× par jour, le matin", exp: "15 juin 2026", color: "#0a5c8a", statut: "actif", prescrit: "Dr. Diallo B.", date: "01 avr. 2026" },
  { med: "Amlodipine 5mg", freq: "1× le soir", exp: "10 mai 2026", color: "#ef9f27", statut: "actif", prescrit: "Dr. Fall A.", date: "15 mars 2026" },
  { med: "Ibuprofène 400mg", freq: "Si douleur, max 3×/jour", exp: "Expiré", color: "#c0392b", statut: "expire", prescrit: "Dr. Diallo B.", date: "01 janv. 2026" },
];

const resultats = [
  { nom: "Glycémie à jeun", date: "20 avr. 2026", valeur: "5.6 mmol/L", ref: "< 6.1", statut: "vert", label: "Normal" },
  { nom: "Bilan lipidique", date: "18 avr. 2026", valeur: "LDL 3.4 mmol/L", ref: "< 3.0", statut: "orange", label: "À surveiller" },
  { nom: "NFS complète", date: "15 avr. 2026", valeur: "Hb 12.8 g/dL", ref: "12–16", statut: "vert", label: "Normal" },
  { nom: "Créatinine", date: "10 avr. 2026", valeur: "En cours", ref: "< 90", statut: "bleu", label: "En cours" },
  { nom: "HbA1c", date: "01 avr. 2026", valeur: "7.2%", ref: "< 7.0", statut: "orange", label: "À surveiller" },
];

const convMessages = [
  { initials: "DB", bg: "#e6f7f2", tc: "#0f6e56", name: "Dr. Diallo B.", role: "Médecin traitant", statut: "vert", preview: "Vos résultats sont disponibles...", time: "Il y a 1h", unread: true,
    conv: [
      { dir: "in", text: "Bonjour Madame Ndiaye, vos résultats d'examens sont disponibles. Votre glycémie est dans la norme mais le bilan lipidique mérite un suivi.", time: "Il y a 1h" },
      { dir: "out", text: "Merci Docteur. Est-ce que je dois modifier mon traitement ?", time: "Il y a 45 min" },
      { dir: "in", text: "Pas pour l'instant. Continuez votre traitement habituel et on en reparlera lors de votre rendez-vous du 30 avril.", time: "Il y a 30 min" },
    ]
  },
  { initials: "FA", bg: "#eef6fb", tc: "#0a5c8a", name: "Dr. Fall A.", role: "Cardiologue", statut: "bleu", preview: "RDV confirmé pour le 5 mai", time: "Hier", unread: false,
    conv: [
      { dir: "in", text: "Bonjour, votre rendez-vous pour l'analyse sanguine est confirmé pour le 5 mai à 14h30. Merci de venir à jeun.", time: "Hier" },
      { dir: "out", text: "Très bien, merci pour la confirmation. Je serai présente.", time: "Hier" },
    ]
  },
  { initials: "KH", bg: "#f3efff", tc: "#7c3aed", name: "KDG Health", role: "Notifications système", statut: "orange", preview: "Rappel : rendez-vous demain à 10h", time: "Hier", unread: false,
    conv: [
      { dir: "in", text: "Rappel automatique : vous avez un rendez-vous demain 30 avril à 10h00 avec Dr. Diallo B. Cabinet 3, Bâtiment A.", time: "Hier" },
    ]
  },
];

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────
function Badge({ statut, label }) {
  const map = { vert: "badge-vert", bleu: "badge-bleu", orange: "badge-orange", rouge: "badge-rouge", confirme: "badge-vert", attente: "badge-orange", actif: "badge-vert", expire: "badge-rouge" };
  const lblMap = { confirme: "Confirmé", attente: "En attente", actif: "Actif", expire: "Expiré" };
  return <span className={`badge ${map[statut] || "badge-bleu"}`}>{label || lblMap[statut] || statut}</span>;
}

// ─── SECTION : MON ESPACE ────────────────────────────────────────────────────
function SectionDashboard({ setActiveMenu }) {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Bonjour, Fatou 👋</div>
          <div className="page-sub">Lundi 4 mai 2026 · Voici votre espace santé</div>
        </div>
        <div className="user-pill">
          <div className="user-avatar">FN</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Fatou Ndiaye</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: "📅", bg: "#e6f7f2", value: "2", label: "Prochains rendez-vous" },
          { icon: "💊", bg: "#eef6fb", value: "3", label: "Ordonnances actives" },
          { icon: "🔬", bg: "#f3efff", value: "5", label: "Résultats disponibles" },
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
          {tousRdvs.slice(0, 2).map((r, i) => (
            <div key={i} className="rdv-card">
              <div className="rdv-date-block">
                <div className="rdv-day">{r.day}</div>
                <div className="rdv-month">{r.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>{r.medecin}</div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.type} · {r.heure}</div>
              </div>
              <Badge statut={r.statut} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Mon dossier médical <span className="card-link" onClick={() => setActiveMenu("dossier")}>Détail →</span></div>
          {[
            ["Groupe sanguin", "A+"], ["Allergies", "Pénicilline"], ["Antécédents", "Diabète type 2"],
            ["Médecin traitant", "Dr. Diallo B."], ["Dernière visite", "15 avril 2026"], ["Poids / Taille", "68 kg · 1m65"],
          ].map(([lbl, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid #f0f4f8" : "none" }}>
              <span style={{ fontSize: 12, color: "#7a90a0" }}>{lbl}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{val}</span>
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
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.nom}</div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.date}</div>
              </div>
              <Badge statut={r.statut} label={r.label} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Mes ordonnances <span className="card-link" onClick={() => setActiveMenu("ordonnances")}>Voir →</span></div>
          {ordonnances.slice(0, 3).map((o, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>{o.med}</div>
              <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{o.freq}</div>
              <div style={{ fontSize: 10, color: "#0f6e56", marginTop: 4, fontWeight: 600 }}>Expire le {o.exp}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Messagerie <span style={{ background: "#0f6e56", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>1 nouveau</span></div>
          {convMessages.map((m, i) => (
            <div key={i} className="msg-item">
              <div className="msg-avatar" style={{ background: m.bg, color: m.tc }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{m.name}</span>
                  {m.unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f6e56" }} />}
                </div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{m.preview}</div>
              </div>
              <div style={{ fontSize: 10, color: "#a0b0bc", whiteSpace: "nowrap" }}>{m.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── SECTION : MES RENDEZ-VOUS ────────────────────────────────────────────────
function SectionRdv() {
  return (
    <>
      <div className="pg-header">Mes rendez-vous</div>
      <div className="pg-sub-text">Consultations et examens programmés</div>

      <div className="alert-card alert-vert" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f6e56" }}>Prochain rendez-vous dans 2 jours</div>
        <div style={{ fontSize: 12, color: "#1a9e75", marginTop: 3 }}>Dr. Diallo B. · 30 avril 2026 à 10h00 · Cabinet 3, Bâtiment A</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Rendez-vous à venir</div>
        {tousRdvs.map((r, i) => (
          <div key={i} className="rdv-card" style={{ marginBottom: i < tousRdvs.length - 1 ? 10 : 0 }}>
            <div className="rdv-date-block">
              <div className="rdv-day">{r.day}</div>
              <div className="rdv-month">{r.month}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f2d" }}>{r.medecin}</div>
              <div style={{ fontSize: 12, color: "#4a6070", marginTop: 3 }}>{r.type}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#7a90a0" }}>🕐 {r.heure}</span>
                <span style={{ fontSize: 11, color: "#7a90a0" }}>📍 {r.lieu}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <Badge statut={r.statut} />
              <span className="card-link" style={{ fontSize: 11 }}>Annuler</span>
            </div>
          </div>
        ))}
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
                <td style={{ color: "#4a6070" }}>{type}</td>
                <td><span className="card-link">{doc} →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SECTION : MON DOSSIER MÉDICAL ───────────────────────────────────────────
function SectionDossier() {
  const [activeTab, setActiveTab] = useState("infos");
  const tabs = [
    { key: "infos", label: "Informations" },
    { key: "antecedents", label: "Antécédents" },
    { key: "constantes", label: "Constantes vitales" },
    { key: "vaccins", label: "Vaccinations" },
  ];

  return (
    <>
      <div className="pg-header">Mon dossier médical</div>
      <div className="pg-sub-text">Toutes vos informations de santé en un seul endroit</div>

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 180, background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f7f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#0f6e56" }}>FN</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f2d" }}>Fatou Ndiaye</div>
            <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>N° SGH-2024-0041</div>
          </div>
          <div style={{ background: "#e6f7f2", borderRadius: 8, padding: "8px 16px", textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f6e56", fontFamily: "'Playfair Display', serif" }}>A+</div>
            <div style={{ fontSize: 10, color: "#0f6e56", fontWeight: 600 }}>Groupe sanguin</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="card">
            <div>
              {tabs.map(t => (
                <button key={t.key} className={`tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
              ))}
            </div>

            {activeTab === "infos" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Nom complet", "Fatou Ndiaye"], ["Date de naissance", "12/03/1978 (48 ans)"],
                  ["Adresse", "Dakar, Sénégal"], ["Téléphone", "+221 77 123 45 67"],
                  ["Médecin traitant", "Dr. Diallo B."], ["Mutuelle", "IPRES Santé"],
                  ["Poids", "68 kg"], ["Taille", "1m65"],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="info-item">
                    <div className="info-label">{lbl}</div>
                    <div className="info-value">{val}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "antecedents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="info-item"><div className="info-label">Maladies chroniques</div><div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>Diabète de type 2 (depuis 2018) · Hypertension légère (depuis 2021)</div></div>
                <div className="info-item"><div className="info-label">Allergies médicamenteuses</div><div style={{ marginTop: 6 }}><span className="badge badge-rouge">Pénicilline</span><span className="badge badge-orange" style={{ marginLeft: 6 }}>AINS</span></div></div>
                <div className="info-item"><div className="info-label">Chirurgies</div><div style={{ fontSize: 13, marginTop: 4 }}>Appendicectomie (2012)</div></div>
                <div className="info-item"><div className="info-label">Antécédents familiaux</div><div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>Diabète (mère, sœur) · Cardiopathie ischémique (père)</div></div>
              </div>
            )}

            {activeTab === "constantes" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  ["Tension artérielle", "138/88 mmHg", "orange", "Surveillé"],
                  ["Glycémie à jeun", "5.6 mmol/L", "vert", "Normal"],
                  ["IMC", "25.0 kg/m²", "vert", "Normal"],
                  ["Fréquence cardiaque", "72 bpm", "vert", "Normal"],
                  ["Température", "36.8 °C", "vert", "Normal"],
                  ["Saturation O²", "98%", "vert", "Normal"],
                ].map(([lbl, val, statut, lb], i) => (
                  <div key={i} className="info-item" style={{ textAlign: "center" }}>
                    <div className="info-label">{lbl}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0d1f2d", margin: "6px 0", fontFamily: "'Playfair Display', serif" }}>{val}</div>
                    <Badge statut={statut} label={lb} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "vaccins" && (
              <table>
                <thead><tr><th>Vaccin</th><th>Date</th><th>Prochain rappel</th><th>Statut</th></tr></thead>
                <tbody>
                  {[
                    ["Covid-19", "Sept. 2023", "Sept. 2025", "vert", "À jour"],
                    ["Grippe saisonnière", "Oct. 2025", "Oct. 2026", "vert", "À jour"],
                    ["Tétanos", "Mars 2018", "Mars 2028", "vert", "À jour"],
                    ["Hépatite B", "Janv. 2010", "—", "vert", "Complet"],
                  ].map(([vac, date, rappel, statut, lb], i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{vac}</td>
                      <td style={{ color: "#7a90a0" }}>{date}</td>
                      <td style={{ color: "#4a6070" }}>{rappel}</td>
                      <td><Badge statut={statut} label={lb} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SECTION : MES ORDONNANCES ────────────────────────────────────────────────
function SectionOrdonnances() {
  return (
    <>
      <div className="pg-header">Mes ordonnances</div>
      <div className="pg-sub-text">3 ordonnances actives · 1 expirée</div>

      <div className="grid-2">
        <div>
          {ordonnances.map((o, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: 18, marginBottom: 14, borderLeft: `4px solid ${o.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f2d" }}>{o.med}</div>
                <Badge statut={o.statut} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div className="info-item" style={{ padding: "7px 10px" }}>
                  <div className="info-label">Fréquence</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0d1f2d" }}>{o.freq}</div>
                </div>
                <div className="info-item" style={{ padding: "7px 10px" }}>
                  <div className="info-label">Expiration</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: o.statut === "expire" ? "#c0392b" : "#0d1f2d" }}>{o.exp}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#7a90a0" }}>Prescrit par {o.prescrit} · {o.date}</div>
                <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>Télécharger</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Instructions importantes</div>
            <div className="alert-card alert-rouge">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c0392b" }}>Allergie connue</div>
              <div style={{ fontSize: 11, color: "#c0392b", marginTop: 3 }}>Ne jamais prendre de Pénicilline ou AINS sans avis médical.</div>
            </div>
            <div className="alert-card alert-orange">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#854f0b" }}>Renouvellement bientôt</div>
              <div style={{ fontSize: 11, color: "#854f0b", marginTop: 3 }}>Amlodipine expire le 10 mai. Contactez Dr. Diallo B.</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Pharmacies partenaires</div>
            {[
              { nom: "Pharmacie Centrale Dakar", addr: "Avenue Léopold Sédar Senghor", tel: "+221 33 821 00 00" },
              { nom: "Pharmacie Liberté 6", addr: "Rue 10 × Av. Bourguiba", tel: "+221 33 825 12 34" },
              { nom: "Pharmacie Fann", addr: "Route de Fann", tel: "+221 33 825 03 22" },
            ].map((p, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{p.nom}</div>
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

// ─── SECTION : RÉSULTATS D'EXAMENS ───────────────────────────────────────────
function SectionResultats() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="pg-header">Résultats d'examens</div>
      <div className="pg-sub-text">5 résultats disponibles · 1 en cours</div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Tous mes résultats</div>
          {resultats.map((r, i) => (
            <div key={i}>
              <div className="result-item" onClick={() => setSelected(selected === i ? null : i)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.nom}</div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.date}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Badge statut={r.statut} label={r.label} />
                  <span style={{ fontSize: 10, color: "#0f6e56", fontWeight: 600 }}>{selected === i ? "Fermer ▲" : "Voir ▼"}</span>
                </div>
              </div>
              {selected === i && (
                <div style={{ margin: "0 0 8px", background: "#f9fbfc", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div><div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase" }}>Résultat</div><div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d", marginTop: 2 }}>{r.valeur}</div></div>
                    <div><div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase" }}>Référence</div><div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d", marginTop: 2 }}>{r.ref}</div></div>
                    <div><div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase" }}>Statut</div><div style={{ marginTop: 4 }}><Badge statut={r.statut} label={r.label} /></div></div>
                  </div>
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
                  <span style={{ fontSize: 12, color: "#4a6070", fontWeight: 600 }}>{s.label}</span>
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
            <div className="alert-card alert-orange">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#854f0b" }}>Bilan lipidique</div>
              <div style={{ fontSize: 11, color: "#854f0b", marginTop: 3 }}>LDL légèrement élevé. Réduisez les graisses saturées et pratiquez 30 min d'activité physique par jour.</div>
            </div>
            <div className="alert-card alert-vert">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f6e56" }}>Glycémie</div>
              <div style={{ fontSize: 11, color: "#0f6e56", marginTop: 3 }}>Excellent contrôle glycémique. Continuez votre traitement actuel.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SECTION : MESSAGERIE ─────────────────────────────────────────────────────
function SectionMessagerie() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const selected = convMessages[selectedIdx];

  return (
    <>
      <div className="pg-header">Messagerie</div>
      <div className="pg-sub-text">Échangez en toute sécurité avec votre équipe médicale</div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f4f8" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>Mes conversations</span>
          </div>
          {convMessages.map((m, i) => (
            <div key={i} className={`thread-item${selectedIdx === i ? " selected" : ""}`} onClick={() => setSelectedIdx(i)}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: m.tc, flexShrink: 0 }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0d1f2d" }}>{m.name}</span>
                    <span style={{ fontSize: 10, color: "#a0b0bc" }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#7a90a0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
                </div>
                {m.unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f6e56", marginTop: 6, flexShrink: 0 }} />}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid #f0f4f8", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: selected.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: selected.tc }}>{selected.initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f2d" }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "#7a90a0" }}>{selected.role}</div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {selected.conv.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.dir === "out" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                <div className={msg.dir === "out" ? "msg-bubble-out" : "msg-bubble-in"}>{msg.text}</div>
                <div style={{ fontSize: 10, color: "#a0b0bc", marginTop: 3, textAlign: msg.dir === "out" ? "right" : "left" }}>{msg.time}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, borderTop: "1px solid #f0f4f8", paddingTop: 14 }}>
            <input type="text" placeholder="Écrire un message..." value={draft} onChange={e => setDraft(e.target.value)}
              style={{ flex: 1, padding: "9px 16px", border: "1px solid #e8edf2", borderRadius: 22, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none" }} />
            <button className="btn-primary" style={{ borderRadius: 22, padding: "9px 20px" }}>Envoyer</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardPatient() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard":   return <SectionDashboard setActiveMenu={setActiveMenu} />;
      case "rdv":         return <SectionRdv />;
      case "dossier":     return <SectionDossier />;
      case "ordonnances": return <SectionOrdonnances />;
      case "resultats":   return <SectionResultats />;
      case "messagerie":  return <SectionMessagerie />;
      default:            return null;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z" /></svg>
            </div>
            <span>KDG Health</span>
          </div>
          <div className="sidebar-menu">
            <div className="menu-label">Menu patient</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.key === "messagerie" && (
                  <span style={{ background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8, marginLeft: "auto" }}>1</span>
                )}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
              <div className="user-avatar">FN</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Fatou Ndiaye</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Patient</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => navigate("/connexion")}>
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