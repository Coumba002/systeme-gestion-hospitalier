import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  .btn-action { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-edit { background: #eef6fb; color: #0a5c8a; }
  .btn-delete { background: #fdeaea; color: #c0392b; }

  .progress-bar { height: 6px; background: #f0f4f8; border-radius: 3px; overflow: hidden; margin-top: 6px; }
  .progress-fill { height: 100%; border-radius: 3px; }

  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1a2332; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.5); font-size: 13px; background: transparent; border: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,0,0,0.15); color: #ff8080; }
`;

const menuItems = [
  { icon: "📊", label: "Tableau de bord", key: "dashboard" },
  { icon: "👨‍⚕️", label: "Gestion médecins", key: "medecins" },
  { icon: "👥", label: "Gestion patients", key: "patients" },
  { icon: "📅", label: "Rendez-vous", key: "rdv" },
  { icon: "📈", label: "Statistiques", key: "stats" },
  { icon: "📄", label: "Rapports", key: "rapports" },
];

const medecins = [
  { nom: "Dr. Diallo B.", specialite: "Médecine générale", patients: 24, statut: "actif" },
  { nom: "Dr. Fall A.", specialite: "Cardiologie", patients: 18, statut: "actif" },
  { nom: "Dr. Sow M.", specialite: "Pédiatrie", patients: 31, statut: "actif" },
  { nom: "Dr. Ba K.", specialite: "Chirurgie", patients: 12, statut: "inactif" },
];

const patients = [
  { nom: "Fatou Ndiaye", age: 48, medecin: "Dr. Diallo B.", statut: "Hospitalisé" },
  { nom: "Ibrahima Sarr", age: 62, medecin: "Dr. Fall A.", statut: "Urgent" },
  { nom: "Moussa Touré", age: 55, medecin: "Dr. Sow M.", statut: "En attente" },
  { nom: "Aïssatou Ciss", age: 27, medecin: "Dr. Ba K.", statut: "Sortie" },
];

const rdvs = [
  { patient: "Fatou Ndiaye", medecin: "Dr. Diallo B.", date: "30 Avr · 10h00", statut: "Confirmé" },
  { patient: "Ibrahima Sarr", medecin: "Dr. Fall A.", date: "30 Avr · 11h30", statut: "Urgent" },
  { patient: "Rokhaya Diop", medecin: "Dr. Diallo B.", date: "01 Mai · 09h00", statut: "En attente" },
  { patient: "Aliou Ba", medecin: "Dr. Sow M.", date: "02 Mai · 14h00", statut: "Confirmé" },
];

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/></svg>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <div className="topbar">
            <div>
              <div className="page-title">Tableau de bord — Administration</div>
              <div className="page-sub">Dimanche 26 avril 2026 · Hôpital KDG Health</div>
            </div>
            <div className="user-pill">
              <div className="user-avatar">AD</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Administrateur</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: "👨‍⚕️", bg: "#eef6fb", value: "12", label: "Médecins actifs", delta: "+2 ce mois", color: "#0f6e56" },
              { icon: "👥", bg: "#e6f7f2", value: "348", label: "Patients enregistrés", delta: "+28 ce mois", color: "#0f6e56" },
              { icon: "📅", bg: "#fef3e2", value: "47", label: "RDV cette semaine", delta: "8 aujourd'hui", color: "#7a90a0" },
              { icon: "🚨", bg: "#fdeaea", value: "3", label: "Cas urgents", delta: "Attention requise", color: "#c0392b" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-delta" style={{ color: s.color }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Statistiques globales */}
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
                    <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Médecins + RDV */}
          <div className="grid-3">
            <div className="card">
              <div className="card-title">Gestion des médecins <span className="card-link">+ Ajouter</span></div>
              <table>
                <thead>
                  <tr>
                    <th>Médecin</th>
                    <th>Spécialité</th>
                    <th>Patients</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medecins.map((m, i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight: 600 }}>{m.nom}</div></td>
                      <td style={{ color: "#4a6070" }}>{m.specialite}</td>
                      <td style={{ fontWeight: 600, color: "#0a5c8a" }}>{m.patients}</td>
                      <td><span className={`badge badge-${m.statut}`}>{m.statut === "actif" ? "Actif" : "Inactif"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-action btn-edit">Modifier</button>
                          <button className="btn-action btn-delete">Retirer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-title">Rendez-vous <span className="card-link">Voir tout →</span></div>
              {rdvs.map((r, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < rdvs.length - 1 ? "1px solid #f0f4f8" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.patient}</div>
                      <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.medecin} · {r.date}</div>
                    </div>
                    <span className={`badge ${r.statut === "Urgent" ? "badge-urgent" : r.statut === "En attente" ? "badge-attente" : "badge-actif"}`}>{r.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patients */}
          <div className="card">
            <div className="card-title">Gestion des patients <span className="card-link">Voir tout →</span></div>
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Âge</th>
                  <th>Médecin traitant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 600 }}>{p.nom}</div></td>
                    <td style={{ color: "#4a6070" }}>{p.age} ans</td>
                    <td style={{ color: "#4a6070" }}>{p.medecin}</td>
                    <td>
                      <span className={`badge ${p.statut === "Urgent" ? "badge-urgent" : p.statut === "En attente" ? "badge-attente" : "badge-actif"}`}>
                        {p.statut}
                      </span>
                    </td>
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
        </main>
      </div>
    </>
  );
}