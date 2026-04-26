import React, { useState } from "react";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f8fafc;
    color: #1a2332;
  }

  .nav-link {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.85);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.2s, color 0.2s;
  }
  .nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .nav-link.active { background: rgba(255,255,255,0.18); color: #fff; }

  .btn-connect {
    background: #fff;
    color: #0a5c8a;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn-connect:hover { opacity: 0.9; }

  .cta-btn {
    background: #0a5c8a;
    color: #fff;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    padding: 14px 32px;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s;
  }
  .cta-btn:hover { background: #084f79; transform: translateY(-1px); }

  .cta-outline {
    background: transparent;
    color: #0a5c8a;
    border: 1.5px solid #0a5c8a;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    padding: 13px 28px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .cta-outline:hover { background: #eef6fb; }

  .feature-card {
    background: #fff;
    border: 1px solid #e8edf2;
    border-radius: 14px;
    padding: 32px 28px;
    flex: 1;
    min-width: 240px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .feature-card:hover {
    box-shadow: 0 8px 32px rgba(10,92,138,0.10);
    transform: translateY(-3px);
  }

  .stat-block {
    background: #fff;
    border: 1px solid #e8edf2;
    border-radius: 12px;
    padding: 24px 20px;
    text-align: center;
    flex: 1;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim { animation: fadeUp 0.55s ease both; }
  .anim-1 { animation-delay: 0.05s; }
  .anim-2 { animation-delay: 0.15s; }
  .anim-3 { animation-delay: 0.25s; }
  .anim-4 { animation-delay: 0.35s; }
`;

const IconPatient = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="#0a5c8a" opacity="0.15"/>
    <circle cx="12" cy="8" r="4" stroke="#0a5c8a" strokeWidth="1.5"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0a5c8a" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="17" rx="3" fill="#0f6e56" opacity="0.12"/>
    <rect x="3" y="5" width="18" height="17" rx="3" stroke="#0f6e56" strokeWidth="1.5"/>
    <path d="M3 10h18M8 3v4M16 3v4" stroke="#0f6e56" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 14h2v2H8z" fill="#0f6e56"/>
    <path d="M11 14h2v2h-2z" fill="#0f6e56" opacity="0.5"/>
  </svg>
);

const IconFile = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#7c3aed" opacity="0.12" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M14 2v6h6M8 13h8M8 17h5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const features = [
  {
    icon: <IconPatient />,
    accent: "#0a5c8a",
    accentBg: "#eef6fb",
    title: "Gestion des patients",
    desc: "Créez, modifiez et consultez les dossiers patients en toute simplicité. Historique complet, informations personnelles et suivi médical centralisés.",
    tag: "Patients",
  },
  {
    icon: <IconCalendar />,
    accent: "#0f6e56",
    accentBg: "#e6f7f2",
    title: "Rendez-vous",
    desc: "Planifiez et suivez les consultations avec un calendrier intelligent. Rappels automatiques, gestion des disponibilités et vue d'ensemble des agendas.",
    tag: "Planning",
  },
  {
    icon: <IconFile />,
    accent: "#7c3aed",
    accentBg: "#f3efff",
    title: "Dossiers médicaux",
    desc: "Accédez aux historiques médicaux en toute sécurité. Ordonnances, résultats d'examens, comptes-rendus — tout en un seul endroit.",
    tag: "Dossiers",
  },
];

const stats = [
  { value: "Ready", label: "Système prêt à l'utilisation" },
  { value: "98 %", label: "Satisfaction" },
  { value: "100% ", label: "Données protégées en continu" },
  { value: "24/7", label: "Disponibilité" },
];

export default function HomePage() {


  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* Navbar */}
        <nav style={{
          background: "linear-gradient(135deg, #0a5c8a 0%, #0c6ea3 60%, #1a8cbf 100%)",
          padding: "0 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(10,92,138,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: "rgba(255,255,255,0.2)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#fff", fontWeight: 700, letterSpacing: "-0.3px" }}>
              KDG Health
            </span>
          </div>

        

          <button className="btn-connect">Connexion</button>
        </nav>

        {/* Hero */}
        <header style={{
          background: "linear-gradient(160deg, #eef6fb 0%, #f8fafc 55%, #e6f7f2 100%)",
          padding: "80px 40px 72px",
          textAlign: "center",
          borderBottom: "1px solid #e3eaf0",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%", background:"rgba(10,92,138,0.05)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-80, left:-40, width:220, height:220, borderRadius:"50%", background:"rgba(15,110,86,0.05)", pointerEvents:"none" }}/>

          

          <h1 className="anim anim-2" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 700,
            color: "#0d1f2d",
            lineHeight: 1.15,
            maxWidth: 680,
            margin: "0 auto 20px",
          }}>
            Bienvenue au<br />
            <span style={{ color: "#0a5c8a", fontStyle: "italic" }}>Système Hospitalier</span>
          </h1>

          <p className="anim anim-3" style={{
            fontSize: 17, color: "#4a6070", lineHeight: 1.7, fontWeight: 400,
            maxWidth: 520, margin: "0 auto 36px",
          }}>
            Gérez efficacement les patients, les rendez-vous et les dossiers médicaux — depuis une interface unifiée, sécurisée et moderne.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-block" style={{ minWidth: 130, maxWidth: 160 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0a5c8a" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Features */}
        <section style={{ padding: "72px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0a5c8a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Fonctionnalités
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "#0d1f2d", lineHeight: 1.2 }}>
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: f.accentBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <div style={{
                  display: "inline-block", background: f.accentBg,
                  color: f.accent, fontSize: 10, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 10, letterSpacing: "0.06em",
                  textTransform: "uppercase", marginBottom: 12,
                }}>
                  {f.tag}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0d1f2d", marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#5a7080", lineHeight: 1.7, fontWeight: 400 }}>
                  {f.desc}
                </p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: f.accent, fontSize: 13, fontWeight: 600 }}>
                  En savoir plus
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        

        {/* Footer */}
        <footer style={{
          background: "#0d1f2d",
          padding: "28px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>KDG Health</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>© 2026 Tous droits réservés</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Confidentialité", "Contact"].map(l => (
              <span
                key={l}
                style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}
                onMouseOver={e => e.target.style.color = "rgba(255,255,255,0.85)"}
                onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >{l}</span>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}