import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  .rdv-card { border: 1px solid #e8edf2; border-radius: 10px; padding: 14px; margin-bottom: 10px; display: flex; gap: 14px; align-items: center; }
  .rdv-date-block { background: #e6f7f2; border-radius: 8px; padding: 8px 12px; text-align: center; min-width: 52px; }
  .rdv-day { font-size: 20px; font-weight: 700; color: #0f6e56; font-family: 'Playfair Display', serif; }
  .rdv-month { font-size: 10px; color: #0f6e56; font-weight: 600; text-transform: uppercase; }

  .result-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f4f8; }
  .result-item:last-child { border-bottom: none; }

  .msg-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f4f8; cursor: pointer; }
  .msg-item:last-child { border-bottom: none; }
  .msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e6f7f2; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0f6e56; flex-shrink: 0; }

  .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #0f6e56; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.6); font-size: 13px; background: transparent; border: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,0,0,0.15); color: #ff8080; }
`;

const menuItems = [
  { icon: "🏠", label: "Mon espace", key: "dashboard" },
  { icon: "📅", label: "Mes rendez-vous", key: "rdv" },
  { icon: "📋", label: "Mon dossier médical", key: "dossier" },
  { icon: "💊", label: "Mes ordonnances", key: "ordonnances" },
  { icon: "🔬", label: "Résultats d'examens", key: "resultats" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];

export default function DashboardPatient() {
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
            <div className="menu-label">Menu patient</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <div className="topbar">
            <div>
              <div className="page-title">Bonjour, Fatou 👋</div>
              <div className="page-sub">Dimanche 26 avril 2026 · Voici votre espace santé</div>
            </div>
            <div className="user-pill">
              <div className="user-avatar">FN</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Fatou Ndiaye</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: "📅", bg: "#e6f7f2", value: "2", label: "Prochains rendez-vous" },
              { icon: "💊", bg: "#eef6fb", value: "3", label: "Ordonnances actives" },
              { icon: "🔬", bg: "#f3efff", value: "5", label: "Résultats disponibles" },
              { icon: "👨‍⚕️", bg: "#fef3e2", value: "1", label: "Médecin traitant" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rendez-vous + Dossier */}
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="card-title">Mes prochains rendez-vous <span className="card-link">Voir tout →</span></div>
              {[
                { day: "30", month: "Avr", heure: "10h00", medecin: "Dr. Diallo B.", type: "Consultation de suivi", statut: "Confirmé" },
                { day: "05", month: "Mai", heure: "14h30", medecin: "Dr. Fall A.", type: "Analyse sanguine", statut: "En attente" },
              ].map((r, i) => (
                <div key={i} className="rdv-card">
                  <div className="rdv-date-block">
                    <div className="rdv-day">{r.day}</div>
                    <div className="rdv-month">{r.month}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>{r.medecin}</div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.type} · {r.heure}</div>
                  </div>
                  <span className={`badge ${r.statut === "Confirmé" ? "badge-vert" : "badge-orange"}`}>{r.statut}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Mon dossier médical <span className="card-link">Détail →</span></div>
              {[
                { label: "Groupe sanguin", value: "A+" },
                { label: "Allergies", value: "Pénicilline" },
                { label: "Antécédents", value: "Diabète type 2" },
                { label: "Médecin traitant", value: "Dr. Diallo B." },
                { label: "Dernière visite", value: "15 avril 2026" },
                { label: "Poids / Taille", value: "68 kg · 1m65" },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid #f0f4f8" : "none" }}>
                  <span style={{ fontSize: 12, color: "#7a90a0" }}>{d.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Résultats + Ordonnances + Messagerie */}
          <div className="grid-3">
            <div className="card">
              <div className="card-title">Résultats d'examens <span className="card-link">Voir →</span></div>
              {[
                { nom: "Glycémie à jeun", date: "20 avr.", statut: "badge-vert", statut_label: "Normal" },
                { nom: "Bilan lipidique", date: "18 avr.", statut: "badge-orange", statut_label: "À surveiller" },
                { nom: "NFS complète", date: "15 avr.", statut: "badge-vert", statut_label: "Normal" },
                { nom: "Créatinine", date: "10 avr.", statut: "badge-bleu", statut_label: "En cours" },
              ].map((r, i) => (
                <div key={i} className="result-item">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{r.nom}</div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{r.date}</div>
                  </div>
                  <span className={`badge ${r.statut}`}>{r.statut_label}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Mes ordonnances</div>
              {[
                { med: "Metformine 500mg", freq: "2x par jour", exp: "Expire le 30 mai" },
                { med: "Vitamine D 1000UI", freq: "1x par jour", exp: "Expire le 15 juin" },
                { med: "Amlodipine 5mg", freq: "1x le soir", exp: "Expire le 10 mai" },
              ].map((o, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f8" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f2d" }}>{o.med}</div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{o.freq}</div>
                  <div style={{ fontSize: 10, color: "#0f6e56", marginTop: 4, fontWeight: 600 }}>{o.exp}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Messagerie <span style={{ background: "#0f6e56", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>1 nouveau</span></div>
              {[
                { initials: "DB", name: "Dr. Diallo B.", preview: "Vos résultats sont disponibles...", time: "Il y a 1h", unread: true },
                { initials: "FA", name: "Dr. Fall A.", preview: "RDV confirmé pour le 5 mai", time: "Hier", unread: false },
                { initials: "KH", name: "KDG Health", preview: "Rappel : rendez-vous demain à 10h", time: "Hier", unread: false },
              ].map((m, i) => (
                <div key={i} className="msg-item">
                  <div className="msg-avatar">{m.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{m.name}</span>
                      {m.unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f6e56" }}/>}
                    </div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{m.preview}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#a0b0bc", whiteSpace: "nowrap" }}>{m.time}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}