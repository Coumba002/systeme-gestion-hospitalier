import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./components/Logo";

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
    background: transparent;
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.6);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-connect:hover { background: rgba(255,255,255,0.12); }

  .btn-register {
    background: #fff;
    color: #0a5c8a;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn-register:hover { opacity: 0.9; transform: translateY(-1px); }

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

const defaultStats = [
  { value: "Ready", label: "Système prêt à l'utilisation" },
  { value: "98 %", label: "Satisfaction" },
  { value: "100%", label: "Données protégées en continu" },
  { value: "24/7", label: "Disponibilité" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = React.useState(null);
  const [modal, setModal] = React.useState(null); // "confidentialite" | "contact" | null
  const [contactForm, setContactForm] = React.useState({ nom: "", email: "", sujet: "", message: "" });
  const [contactSent, setContactSent] = React.useState(false);

  React.useEffect(() => {
    // Optionnel : tente de récupérer les stats publiques si déjà connecté
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch((process.env.REACT_APP_API_URL || "http://localhost:8000/api") + "/stats/dashboard", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).then(r => r.ok ? r.json() : null).then(setLiveStats).catch(() => {});
  }, []);

  const stats = liveStats ? [
    { value: liveStats.patients ?? 0,                label: "Patients enregistrés" },
    { value: liveStats.medecins ?? 0,                label: "Médecins actifs" },
    { value: liveStats.rendezvous_aujourd_hui ?? 0,  label: "Rendez-vous aujourd'hui" },
    { value: liveStats.hospitalisations_en_cours ?? 0, label: "Hospitalisations" },
  ] : defaultStats;

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
          <Logo size={36} withText textColor="#fff" />

          {/* Boutons Connexion + Inscription */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-connect" onClick={() => navigate("/connexion")}>
              Connexion
            </button>
            <button className="btn-register" onClick={() => navigate("/inscription")}>
              Inscription
            </button>
          </div>
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

          <div className="anim anim-1" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <Logo variant="image" height={130} />
          </div>

          <h1 className="anim anim-2" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 700,
            color: "#0d1f2d",
            lineHeight: 1.15,
            maxWidth: 680,
            margin: "0 auto 20px",
          }}>
            Bienvenue sur<br />
            <span style={{ color: "#0a5c8a", fontStyle: "italic" }}>KDG Health</span>
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
              </div>
            ))}
          </div>
        </section>

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={28} withText textColor="#fff" gap={8} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 4 }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>© 2026 Tous droits réservés</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Confidentialité", key: "confidentialite" },
              { label: "Contact",         key: "contact" },
            ].map(l => (
              <button
                key={l.key}
                onClick={() => { setModal(l.key); setContactSent(false); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  fontWeight: 500,
                }}
                onMouseOver={e => e.currentTarget.style.color = "rgba(255,255,255,0.95)"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
              >
                {l.label}
              </button>
            ))}
          </div>
        </footer>

        {/* ─── Modal Confidentialité / Contact ─── */}
        {modal && (
          <div
            onClick={() => setModal(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(13,31,45,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20,
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 16,
                maxWidth: 620,
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                animation: "fadeUp 0.3s ease",
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "22px 28px",
                borderBottom: "1px solid #e8edf2",
                background: "linear-gradient(135deg, #eef6fb 0%, #fff 100%)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Logo size={36} />
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#0d1f2d" }}>
                      {modal === "confidentialite" ? "Politique de confidentialité" : "Nous contacter"}
                    </div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                      {modal === "confidentialite" ? "Vos données médicales sont protégées" : "Une question ? Nous répondons sous 24h"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setModal(null)} style={{
                  background: "#f0f4f8", border: "none", width: 32, height: 32,
                  borderRadius: 8, fontSize: 18, color: "#4a6070",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>

              <div style={{ padding: "26px 28px" }}>
                {modal === "confidentialite" ? (
                  <div style={{ fontSize: 14, color: "#4a6070", lineHeight: 1.75 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0a5c8a", marginBottom: 8, marginTop: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Collecte des données
                    </h3>
                    <p style={{ marginBottom: 16 }}>
                      KDG Health collecte uniquement les informations strictement nécessaires à la prise en charge médicale : identité, coordonnées, antécédents médicaux, allergies et historique des consultations.
                    </p>

                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0a5c8a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Sécurité et stockage
                    </h3>
                    <p style={{ marginBottom: 16 }}>
                      Toutes les données sont stockées sur des serveurs sécurisés au Sénégal. Elles sont chiffrées en transit (HTTPS) et au repos. Les mots de passe sont hachés avec bcrypt.
                    </p>

                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0a5c8a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Accès aux données
                    </h3>
                    <p style={{ marginBottom: 16 }}>
                      Seul le personnel médical autorisé (médecins, infirmiers, agents administratifs) a accès aux dossiers patients selon son rôle. Chaque action est tracée dans un journal d'audit.
                    </p>

                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0a5c8a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Vos droits
                    </h3>
                    <p style={{ marginBottom: 16 }}>
                      Vous pouvez à tout moment accéder à vos données, demander leur correction ou leur suppression en contactant l'administrateur de l'établissement.
                    </p>

                    <div style={{ background: "#eef6fb", borderLeft: "3px solid #0a5c8a", padding: "12px 16px", borderRadius: 6, fontSize: 12, color: "#0a5c8a", marginTop: 18 }}>
                      📅 Dernière mise à jour : juin 2026<br />
                      📧 Délégué à la protection des données : <strong>dpo@kdghealth.sn</strong>
                    </div>
                  </div>
                ) : contactSent ? (
                  <div style={{ textAlign: "center", padding: "30px 10px" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0f6e56", marginBottom: 8, fontFamily: "'Playfair Display',serif" }}>
                      Message envoyé
                    </div>
                    <div style={{ fontSize: 13, color: "#4a6070", marginBottom: 22 }}>
                      Merci ! Nous vous répondrons à <strong style={{ color: "#0d1f2d" }}>{contactForm.email}</strong> dans les plus brefs délais.
                    </div>
                    <button
                      onClick={() => setModal(null)}
                      style={{ background: "#0a5c8a", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                      <div style={{ background: "#fafbfc", padding: "14px 16px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>📍 Adresse</div>
                        <div style={{ fontSize: 13, color: "#0d1f2d", fontWeight: 600 }}>Avenue Léopold Sédar Senghor<br />Dakar, Sénégal</div>
                      </div>
                      <div style={{ background: "#fafbfc", padding: "14px 16px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>📞 Téléphone</div>
                        <div style={{ fontSize: 13, color: "#0d1f2d", fontWeight: 600 }}>+221 33 800 00 00<br /><span style={{ fontSize: 11, color: "#7a90a0", fontWeight: 400 }}>Urgences : 1515 (24h/24)</span></div>
                      </div>
                    </div>

                    <form onSubmit={e => {
                      e.preventDefault();
                      if (!contactForm.nom || !contactForm.email || !contactForm.message) return;
                      setContactSent(true);
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <input required type="text" placeholder="Votre nom complet *" value={contactForm.nom} onChange={e => setContactForm({ ...contactForm, nom: e.target.value })}
                          style={{ padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" }} />
                        <input required type="email" placeholder="Votre email *" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                          style={{ padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" }} />
                      </div>
                      <input type="text" placeholder="Sujet" value={contactForm.sujet} onChange={e => setContactForm({ ...contactForm, sujet: e.target.value })}
                        style={{ padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", marginBottom: 12 }} />
                      <textarea required rows={4} placeholder="Votre message *" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{ padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", resize: "vertical", marginBottom: 14 }} />
                      <button type="submit" style={{ background: "#0a5c8a", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                        Envoyer le message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}