import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── STYLES GLOBAUX ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fa; }

  .sidebar { width: 240px; background: linear-gradient(180deg, #1a2332 0%, #2d3a4a 100%); min-height: 100vh; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; z-index: 10; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
  .sidebar-logo span { font-family: 'Playfair Display', serif; font-size: 18px; color: #fff; font-weight: 700; }
  .sidebar-menu { padding: 16px 12px; flex: 1; }
  .menu-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin: 16px 0 6px; }
  .menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500; transition: all 0.15s; margin-bottom: 2px; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
  .menu-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .menu-item.active { background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }

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
  .badge-actif { background: #e6f7f2; color: #0f6e56; }
  .badge-inactif { background: #f0f4f8; color: #7a90a0; }
  .badge-urgent { background: #fdeaea; color: #c0392b; }
  .badge-attente { background: #fef3e2; color: #854f0b; }
  .badge-bleu { background: #eef6fb; color: #0a5c8a; }

  .btn-action { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-edit { background: #eef6fb; color: #0a5c8a; }
  .btn-delete { background: #fdeaea; color: #c0392b; }
  .btn-primary { background: #1a2332; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-primary:hover { background: #2d3a4a; }
  .btn-secondary { background: #fff; color: #1a2332; border: 1px solid #1a2332; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }

  .progress-bar { height: 6px; background: #f0f4f8; border-radius: 3px; overflow: hidden; margin-top: 6px; }
  .progress-fill { height: 100%; border-radius: 3px; }

  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1a2332; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.5); font-size: 13px; background: transparent; border: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,0,0,0.15); color: #ff8080; }

  .search-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }
  .search-bar input { flex: 1; padding: 9px 14px; border: 1px solid #e8edf2; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: #0d1f2d; }
  .search-bar input:focus { border-color: #1a2332; }

  .info-item { background: #f9fbfc; border-radius: 8px; padding: 10px 14px; }
  .info-label { font-size: 10px; color: #7a90a0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .info-value { font-size: 13px; color: #0d1f2d; font-weight: 600; }

  .tab-btn { padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e8edf2; background: #f4f7fa; color: #4a6070; font-family: 'Plus Jakarta Sans', sans-serif; margin-right: 6px; margin-bottom: 14px; }
  .tab-btn.active { background: #1a2332; color: #fff; border-color: #1a2332; }

  .chart-bar { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar-fill { border-radius: 4px 4px 0 0; width: 100%; transition: height 0.3s; }
  .bar-label { font-size: 10px; color: #7a90a0; }
  .bar-val { font-size: 10px; font-weight: 700; color: #0d1f2d; }
`;

// ─── DONNÉES ──────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: "📊", label: "Tableau de bord", key: "dashboard" },
  { icon: "👨‍⚕️", label: "Gestion médecins", key: "medecins" },
  { icon: "👥", label: "Gestion patients", key: "patients" },
  { icon: "📅", label: "Rendez-vous", key: "rdv" },
  { icon: "📈", label: "Statistiques", key: "stats" },
  { icon: "📄", label: "Rapports", key: "rapports" },
];

const medecins = [
  { initiales: "DB", bg: "#eef6fb", tc: "#0a5c8a", nom: "Dr. Diallo B.", specialite: "Médecine générale", patients: 24, rdv: 5, statut: "actif", tel: "+221 77 111 22 33" },
  { initiales: "FA", bg: "#e6f7f2", tc: "#0f6e56", nom: "Dr. Fall A.", specialite: "Cardiologie", patients: 18, rdv: 3, statut: "actif", tel: "+221 77 222 33 44" },
  { initiales: "SM", bg: "#f3efff", tc: "#7c3aed", nom: "Dr. Sow M.", specialite: "Pédiatrie", patients: 31, rdv: 7, statut: "actif", tel: "+221 77 333 44 55" },
  { initiales: "BK", bg: "#f0f4f8", tc: "#7a90a0", nom: "Dr. Ba K.", specialite: "Chirurgie", patients: 12, rdv: 0, statut: "inactif", tel: "+221 77 444 55 66" },
];

const patients = [
  { initiales: "FN", bg: "#eef6fb", tc: "#0a5c8a", nom: "Fatou Ndiaye", age: 48, medecin: "Dr. Diallo B.", chambre: "204-A", statut: "Hospitalisé", date: "28 avr. 2026" },
  { initiales: "IS", bg: "#fdeaea", tc: "#c0392b", nom: "Ibrahima Sarr", age: 62, medecin: "Dr. Fall A.", chambre: "107-B", statut: "Urgent", date: "29 avr. 2026" },
  { initiales: "MT", bg: "#fef3e2", tc: "#854f0b", nom: "Moussa Touré", age: 55, medecin: "Dr. Sow M.", chambre: "312-C", statut: "En attente", date: "27 avr. 2026" },
  { initiales: "AC", bg: "#e6f7f2", tc: "#0f6e56", nom: "Aïssatou Ciss", age: 27, medecin: "Dr. Ba K.", chambre: "—", statut: "Sortie", date: "25 avr. 2026" },
  { initiales: "OD", bg: "#eef6fb", tc: "#0a5c8a", nom: "Omar Diouf", age: 41, medecin: "Dr. Diallo B.", chambre: "118-A", statut: "Hospitalisé", date: "26 avr. 2026" },
  { initiales: "KF", bg: "#f3efff", tc: "#7c3aed", nom: "Khady Fall", age: 36, medecin: "Dr. Sow M.", chambre: "—", statut: "En attente", date: "30 avr. 2026" },
];

const rdvs = [
  { patient: "Fatou Ndiaye", medecin: "Dr. Diallo B.", date: "30 Avr · 10h00", statut: "confirme" },
  { patient: "Ibrahima Sarr", medecin: "Dr. Fall A.", date: "30 Avr · 11h30", statut: "urgent" },
  { patient: "Rokhaya Diop", medecin: "Dr. Diallo B.", date: "01 Mai · 09h00", statut: "attente" },
  { patient: "Aliou Ba", medecin: "Dr. Sow M.", date: "02 Mai · 14h00", statut: "confirme" },
  { patient: "Omar Diouf", medecin: "Dr. Fall A.", date: "03 Mai · 10h30", statut: "confirme" },
  { patient: "Khady Fall", medecin: "Dr. Diallo B.", date: "04 Mai · 14h00", statut: "attente" },
  { patient: "Aminata Sy", medecin: "Dr. Sow M.", date: "05 Mai · 11h00", statut: "confirme" },
];

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────
function Badge({ statut }) {
  const map = {
    actif: ["badge-actif", "Actif"], inactif: ["badge-inactif", "Inactif"],
    urgent: ["badge-urgent", "Urgent"], Urgent: ["badge-urgent", "Urgent"],
    attente: ["badge-attente", "En attente"], confirme: ["badge-actif", "Confirmé"],
    Hospitalisé: ["badge-bleu", "Hospitalisé"], Sortie: ["badge-inactif", "Sortie"],
    "En attente": ["badge-attente", "En attente"],
  };
  const [cls, label] = map[statut] || ["badge-attente", statut];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── SECTION : TABLEAU DE BORD ────────────────────────────────────────────────
function SectionDashboard({ setActiveMenu }) {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Tableau de bord — Administration</div>
          <div className="page-sub">Lundi 4 mai 2026 · Hôpital KDG Health</div>
        </div>
        <div className="user-pill">
          <div className="user-avatar">AD</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Administrateur</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: "👨‍⚕️", bg: "#eef6fb", value: "12", label: "Médecins actifs", delta: "+2 ce mois", color: "#0f6e56" },
          { icon: "👥", bg: "#e6f7f2", value: "348", label: "Patients enregistrés", delta: "+28 ce mois", color: "#0f6e56" },
          { icon: "📅", bg: "#fef3e2", value: "47", label: "RDV cette semaine", delta: "8 aujourd'hui", color: "#7a90a0" },
          { icon: "🚨", bg: "#fdeaea", value: "3", label: "Cas urgents", delta: "Attention requise", color: "#c0392b" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta" style={{ color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Statistiques globales — Avril 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "Taux d'occupation", value: 78, color: "#0a5c8a" },
            { label: "Consultations réalisées", value: 92, color: "#0f6e56" },
            { label: "Satisfaction patients", value: 88, color: "#7c3aed" },
            { label: "RDV honorés", value: 95, color: "#ef9f27" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#7a90a0" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Gestion des médecins <span className="card-link" onClick={() => setActiveMenu("medecins")}>+ Ajouter</span></div>
          <table>
            <thead><tr><th>Médecin</th><th>Spécialité</th><th>Patients</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {medecins.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{m.nom}</td>
                  <td style={{ color: "#4a6070" }}>{m.specialite}</td>
                  <td style={{ fontWeight: 600, color: "#0a5c8a" }}>{m.patients}</td>
                  <td><Badge statut={m.statut} /></td>
                  <td><div style={{ display: "flex", gap: 6 }}><button className="btn-action btn-edit">Modifier</button><button className="btn-action btn-delete">Retirer</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">Rendez-vous <span className="card-link" onClick={() => setActiveMenu("rdv")}>Voir tout →</span></div>
          {rdvs.slice(0, 4).map((r, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.patient}</div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.medecin} · {r.date}</div>
                </div>
                <Badge statut={r.statut} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Gestion des patients <span className="card-link" onClick={() => setActiveMenu("patients")}>Voir tout →</span></div>
        <table>
          <thead><tr><th>Patient</th><th>Âge</th><th>Médecin traitant</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {patients.slice(0, 4).map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{p.nom}</td>
                <td style={{ color: "#4a6070" }}>{p.age} ans</td>
                <td style={{ color: "#4a6070" }}>{p.medecin}</td>
                <td><Badge statut={p.statut} /></td>
                <td><div style={{ display: "flex", gap: 6 }}><button className="btn-action btn-edit">Voir</button><button className="btn-action btn-delete">Supprimer</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SECTION : GESTION MÉDECINS ───────────────────────────────────────────────
function SectionMedecins() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="pg-header">Gestion des médecins</div>
      <div className="pg-sub-text">12 médecins · 3 spécialités · 1 inactif</div>

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un médecin..." />
        <select style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1f2d", outline: "none" }}>
          <option>Toutes les spécialités</option>
          <option>Médecine générale</option><option>Cardiologie</option><option>Pédiatrie</option><option>Chirurgie</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Ajouter un médecin</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Nouveau médecin</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[["Nom complet", "text", "Dr. Prénom Nom"], ["Spécialité", "text", "Ex: Cardiologie"], ["Téléphone", "tel", "+221 77 XXX XX XX"]].map(([lbl, type, ph]) => (
              <div key={lbl} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#4a6070" }}>{lbl}</label>
                <input type={type} placeholder={ph} style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary">Enregistrer</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {medecins.map((m, i) => (
          <div key={i} className="card">
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: m.tc, flexShrink: 0 }}>{m.initiales}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f2d" }}>{m.nom}</div>
                  <Badge statut={m.statut} />
                </div>
                <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>{m.specialite}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "14px 0" }}>
              <div className="info-item" style={{ textAlign: "center", padding: "8px 10px" }}>
                <div className="info-label">Patients</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0a5c8a", fontFamily: "'Playfair Display', serif" }}>{m.patients}</div>
              </div>
              <div className="info-item" style={{ textAlign: "center", padding: "8px 10px" }}>
                <div className="info-label">RDV auj.</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f6e56", fontFamily: "'Playfair Display', serif" }}>{m.rdv}</div>
              </div>
              <div className="info-item" style={{ textAlign: "center", padding: "8px 10px" }}>
                <div className="info-label">Tél.</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0d1f2d", marginTop: 2 }}>{m.tel}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-action btn-edit" style={{ flex: 1, padding: "7px" }}>Modifier</button>
              <button className="btn-action btn-delete" style={{ flex: 1, padding: "7px" }}>Retirer</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── SECTION : GESTION PATIENTS ───────────────────────────────────────────────
function SectionPatients() {
  const [filtre, setFiltre] = useState("tous");

  const filtres = filtre === "tous" ? patients : patients.filter(p =>
    filtre === "urgent" ? p.statut === "Urgent" :
    filtre === "hospi" ? p.statut === "Hospitalisé" :
    p.statut === "En attente"
  );

  return (
    <>
      <div className="pg-header">Gestion des patients</div>
      <div className="pg-sub-text">348 patients enregistrés · 5 hospitalisés actuellement</div>

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un patient..." />
        <select style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1f2d", outline: "none" }}
          value={filtre} onChange={e => setFiltre(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          <option value="urgent">Urgents</option>
          <option value="hospi">Hospitalisés</option>
          <option value="attente">En attente</option>
        </select>
        <button className="btn-primary">+ Nouveau patient</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Patient</th><th>Âge</th><th>Médecin traitant</th><th>Chambre</th><th>Admission</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtres.map((p, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: p.tc, flexShrink: 0 }}>{p.initiales}</div>
                    <span style={{ fontWeight: 600 }}>{p.nom}</span>
                  </div>
                </td>
                <td style={{ color: "#4a6070" }}>{p.age} ans</td>
                <td style={{ color: "#4a6070" }}>{p.medecin}</td>
                <td style={{ color: "#4a6070" }}>{p.chambre}</td>
                <td style={{ color: "#7a90a0" }}>{p.date}</td>
                <td><Badge statut={p.statut} /></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-action btn-edit">Voir</button>
                    <button className="btn-action btn-delete">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, padding: "0 4px" }}>
        <span style={{ fontSize: 12, color: "#7a90a0" }}>Affichage 1–{filtres.length} sur 348 patients</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>← Précédent</button>
          <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>Suivant →</button>
        </div>
      </div>
    </>
  );
}

// ─── SECTION : RENDEZ-VOUS ────────────────────────────────────────────────────
function SectionRdv() {
  return (
    <>
      <div className="pg-header">Rendez-vous</div>
      <div className="pg-sub-text">Tous les rendez-vous programmés — Mai 2026</div>

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un RDV..." />
        <select style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1f2d", outline: "none" }}>
          <option>Tous les médecins</option>
          {medecins.map(m => <option key={m.nom}>{m.nom}</option>)}
        </select>
        <button className="btn-primary">+ Nouveau RDV</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Tous les rendez-vous</div>
          <table>
            <thead><tr><th>Patient</th><th>Médecin</th><th>Date & Heure</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {rdvs.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.patient}</td>
                  <td style={{ color: "#4a6070" }}>{r.medecin}</td>
                  <td style={{ color: "#7a90a0" }}>{r.date}</td>
                  <td><Badge statut={r.statut} /></td>
                  <td><span style={{ fontSize: 12, color: "#0a5c8a", fontWeight: 600, cursor: "pointer" }}>Modifier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Résumé du jour</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Total RDV", "8", "#0a5c8a"], ["Confirmés", "5", "#0f6e56"],
                ["En attente", "2", "#854f0b"], ["Urgents", "1", "#c0392b"],
              ].map(([lbl, val, color]) => (
                <div key={lbl} className="info-item" style={{ textAlign: "center" }}>
                  <div className="info-label">{lbl}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Charge par médecin</div>
            {medecins.map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#4a6070", fontWeight: 600 }}>{m.nom}</span>
                  <span style={{ fontSize: 11, color: "#0a5c8a", fontWeight: 600 }}>{m.rdv} RDV</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(m.rdv / 8) * 100}%`, background: m.statut === "inactif" ? "#f0f4f8" : "#0a5c8a" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SECTION : STATISTIQUES ───────────────────────────────────────────────────
function SectionStats() {
  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui"];
  const consultData = [28, 35, 42, 38, 45, 40];
  const maxConsult = Math.max(...consultData);

  return (
    <>
      <div className="pg-header">Statistiques</div>
      <div className="pg-sub-text">Indicateurs de performance — KDG Health 2026</div>

      <div className="stats-grid">
        {[
          { icon: "📊", bg: "#eef6fb", value: "78%", label: "Taux d'occupation", delta: "+5% vs mars", color: "#0f6e56" },
          { icon: "✅", bg: "#e6f7f2", value: "95%", label: "RDV honorés", delta: "Objectif : 90%", color: "#0f6e56" },
          { icon: "⭐", bg: "#fef3e2", value: "4.6/5", label: "Satisfaction patients", delta: "+0.2 vs trimestre", color: "#0f6e56" },
          { icon: "⏱️", bg: "#f3efff", value: "18 min", label: "Temps d'attente moyen", delta: "-3 min vs mars", color: "#0f6e56" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta" style={{ color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Consultations — 6 derniers mois</div>
          <div className="chart-bar">
            {consultData.map((val, i) => (
              <div key={i} className="bar-col">
                <div className="bar-val">{val}</div>
                <div className="bar-fill" style={{ height: `${(val / maxConsult) * 80}px`, background: i === 3 ? "#0a5c8a" : "#b5d4f4" }} />
                <div className="bar-label">{moisLabels[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 10, textAlign: "center" }}>Avril 2026 en surbrillance</div>
        </div>

        <div className="card">
          <div className="card-title">Répartition par spécialité</div>
          {[
            { label: "Médecine générale", pct: 42, color: "#0a5c8a", nb: 146 },
            { label: "Pédiatrie", pct: 27, color: "#7c3aed", nb: 94 },
            { label: "Cardiologie", pct: 19, color: "#0f6e56", nb: 66 },
            { label: "Chirurgie", pct: 12, color: "#ef9f27", nb: 42 },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#4a6070", fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: "#7a90a0" }}>{s.nb} patients · <strong style={{ color: s.color }}>{s.pct}%</strong></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Indicateurs qualité — Avril 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "Taux d'occupation", value: 78, color: "#0a5c8a" },
            { label: "Consultations réalisées", value: 92, color: "#0f6e56" },
            { label: "Satisfaction patients", value: 88, color: "#7c3aed" },
            { label: "RDV honorés", value: 95, color: "#ef9f27" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#7a90a0" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── SECTION : RAPPORTS ───────────────────────────────────────────────────────
function SectionRapports() {
  return (
    <>
      <div className="pg-header">Rapports</div>
      <div className="pg-sub-text">Génération et téléchargement des rapports administratifs</div>

      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Générer un rapport</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Type de rapport", type: "select", options: ["Rapport mensuel", "Rapport trimestriel", "Rapport annuel", "Rapport par médecin"] },
                { label: "Période", type: "select", options: ["Avril 2026", "Mars 2026", "Février 2026", "Q1 2026"] },
                { label: "Format", type: "select", options: ["PDF", "Excel", "CSV"] },
              ].map(({ label, type, options }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#4a6070" }}>{label}</label>
                  <select style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1f2d", outline: "none" }}>
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button className="btn-primary" style={{ marginTop: 6 }}>Générer le rapport</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Rapports programmés</div>
            {[
              { nom: "Rapport mensuel automatique", freq: "Le 1er de chaque mois", proch: "01 juin 2026", statut: "actif" },
              { nom: "Rapport hebdomadaire RDV", freq: "Tous les lundis", proch: "11 mai 2026", statut: "actif" },
              { nom: "Rapport qualité trimestriel", freq: "Chaque trimestre", proch: "01 juil. 2026", statut: "actif" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.nom}</div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.freq} · Prochain : {r.proch}</div>
                  </div>
                  <Badge statut={r.statut} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Rapports récents</div>
          {[
            { nom: "Rapport mensuel — Avril 2026", date: "01 mai 2026", taille: "2.4 MB", type: "PDF", color: "#c0392b" },
            { nom: "Rapport mensuel — Mars 2026", date: "01 avr. 2026", taille: "2.1 MB", type: "PDF", color: "#c0392b" },
            { nom: "Rapport qualité — Q1 2026", date: "01 avr. 2026", taille: "3.8 MB", type: "PDF", color: "#c0392b" },
            { nom: "Statistiques RDV — Mars 2026", date: "31 mars 2026", taille: "0.9 MB", type: "Excel", color: "#0f6e56" },
            { nom: "Liste médecins actifs", date: "28 mars 2026", taille: "0.3 MB", type: "CSV", color: "#0a5c8a" },
            { nom: "Rapport mensuel — Février 2026", date: "01 mars 2026", taille: "1.9 MB", type: "PDF", color: "#c0392b" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.type}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nom}</div>
                <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.date} · {r.taille}</div>
              </div>
              <button className="btn-action btn-edit">↓ Télécharger</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard": return <SectionDashboard setActiveMenu={setActiveMenu} />;
      case "medecins":  return <SectionMedecins />;
      case "patients":  return <SectionPatients />;
      case "rdv":       return <SectionRdv />;
      case "stats":     return <SectionStats />;
      case "rapports":  return <SectionRapports />;
      default:          return null;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z" /></svg>
            </div>
            <span>KDG Health</span>
          </div>
          <div className="sidebar-menu">
            <div className="menu-label">Administration</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
              <div className="user-avatar">AD</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Administrateur</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Super Admin</div>
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
