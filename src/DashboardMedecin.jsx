import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
`;

const patients = [
  { nom: "Fatou Ndiaye", age: 48, diagnostic: "Diabète type 2", statut: "stable", chambre: "204-A" },
  { nom: "Ibrahima Sarr", age: 62, diagnostic: "Infarctus", statut: "urgent", chambre: "107-B" },
  { nom: "Aminata Sy", age: 33, diagnostic: "Appendicite", statut: "urgent", chambre: "Urgences" },
  { nom: "Moussa Touré", age: 55, diagnostic: "Hypertension", statut: "attente", chambre: "312-C" },
  { nom: "Aïssatou Ciss", age: 27, diagnostic: "Post-opératoire", statut: "stable", chambre: "205-A" },
];

const rdvs = [
  { time: "08h30", name: "Mamadou Gueye", type: "Consultation de suivi", color: "#0f6e56" },
  { time: "10h00", name: "Rokhaya Diop", type: "Bilan sanguin", color: "#0a5c8a" },
  { time: "11h30", name: "Seydou Fall", type: "Visite médicale", color: "#ef9f27" },
  { time: "14h00", name: "Ndèye Mbaye", type: "Résultats examens", color: "#d85a30" },
  { time: "15h30", name: "Aliou Ba", type: "Ordonnance renouvellement", color: "#7c3aed" },
];

const messages = [
  { initials: "FN", name: "Fatou Ndiaye", preview: "Docteur, j'ai une douleur depuis hier...", time: "Il y a 5 min", unread: true },
  { initials: "IS", name: "Ibrahima Sarr", preview: "Merci pour les résultats, est-ce que...", time: "Il y a 1h", unread: true },
  { initials: "MS", name: "Dr. Moussa Sow", preview: "Réunion de service confirmée à 14h", time: "Il y a 2h", unread: false },
  { initials: "AM", name: "Aminata Mbaye", preview: "Mon prochain rendez-vous est-il...", time: "Hier", unread: false },
];

const menuItems = [
  { icon: "🏠", label: "Tableau de bord", key: "dashboard" },
  { icon: "👥", label: "Mes patients", key: "patients" },
  { icon: "📅", label: "Rendez-vous", key: "rdv" },
  { icon: "📋", label: "Dossiers médicaux", key: "dossiers" },
  { icon: "💊", label: "Ordonnances", key: "ordonnances" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];

export default function DashboardMedecin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/></svg>
            </div>
            <span>KDG Health</span>
          </div>

          <div className="sidebar-menu">
            <div className="menu-label">Menu principal</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
              <div className="user-avatar">DB</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Dr. Diallo B.</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Médecin généraliste</div>
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
              <div className="page-title">Tableau de bord — Médecin</div>
              <div className="page-sub">Dimanche 26 avril 2026 · Service de médecine interne</div>
            </div>
            <div className="user-pill">
              <div className="user-avatar">DB</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Dr. Diallo B.</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: "👥", bg: "#eef6fb", color: "#0a5c8a", value: "24", label: "Patients suivis", delta: "+3 ce mois", deltaColor: "#0f6e56" },
              { icon: "📅", bg: "#e6f7f2", color: "#0f6e56", value: "5", label: "Rendez-vous aujourd'hui", delta: "2 restants", deltaColor: "#7a90a0" },
              { icon: "🚨", bg: "#fdeaea", color: "#c0392b", value: "2", label: "Cas urgents", delta: "Attention requise", deltaColor: "#c0392b" },
              { icon: "💊", bg: "#f3efff", color: "#7c3aed", value: "8", label: "Ordonnances ce mois", delta: "+2 cette semaine", deltaColor: "#0f6e56" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-delta" style={{ color: s.deltaColor }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Patients + RDV */}
          <div className="grid-3">
            {/* Patients */}
            <div className="card">
              <div className="card-title">
                Mes patients
                <span className="card-link">Voir tout →</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Diagnostic</th>
                    <th>Chambre</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.nom}</div>
                        <div style={{ fontSize: 11, color: "#7a90a0" }}>{p.age} ans</div>
                      </td>
                      <td style={{ color: "#4a6070" }}>{p.diagnostic}</td>
                      <td style={{ color: "#4a6070" }}>{p.chambre}</td>
                      <td>
                        <span className={`badge badge-${p.statut}`}>
                          {p.statut === "urgent" ? "Urgent" : p.statut === "stable" ? "Stable" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RDV */}
            <div className="card">
              <div className="card-title">
                Rendez-vous du jour
                <span className="card-link">Agenda →</span>
              </div>
              {rdvs.map((r, i) => (
                <div key={i} className="rdv-item">
                  <div className="rdv-dot" style={{ background: r.color }}/>
                  <div>
                    <div className="rdv-time">{r.time}</div>
                    <div className="rdv-name">{r.name}</div>
                    <div className="rdv-type">{r.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messagerie + Ordonnances */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">
                Messagerie
                <span style={{ background: "#0a5c8a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>2 nouveaux</span>
              </div>
              {messages.map((m, i) => (
                <div key={i} className="msg-item">
                  <div className="msg-avatar">{m.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="msg-name">{m.name}</span>
                      {m.unread && <div className="unread-dot"/>}
                    </div>
                    <div className="msg-preview">{m.preview}</div>
                  </div>
                  <div className="msg-time">{m.time}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Ordonnances récentes</div>
              {[
                { patient: "Fatou Ndiaye", med: "Metformine 500mg", date: "Aujourd'hui" },
                { patient: "Moussa Touré", med: "Amlodipine 5mg", date: "Hier" },
                { patient: "Rokhaya Diop", med: "Lévothyroxine 50µg", date: "Il y a 2j" },
                { patient: "Aliou Ba", med: "Amoxicilline 1g", date: "Il y a 3j" },
              ].map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0f4f8" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{o.patient}</div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{o.med}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#a0b0bc" }}>{o.date}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}