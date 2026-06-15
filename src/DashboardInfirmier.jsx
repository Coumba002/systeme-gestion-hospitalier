import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser, logout,
  getPatients, getHospitalisations, getConsultations, getRendezVous,
} from "./api";
import Messagerie from "./sections/Messagerie";
import Logo from "./components/Logo";
import { useUnreadMessages } from "./hooks/useUnreadMessages";
import { ThemeToggle } from "./hooks/useTheme";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .sidebar { width: 240px; background: linear-gradient(180deg, #7c3aed 0%, #9a5cf0 100%); height: 100vh; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; z-index: 10; overflow-y: auto; overflow-x: hidden; }
  .sidebar::-webkit-scrollbar { width: 6px; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 3px; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; gap: 10px; }
  .sidebar-menu { padding: 16px 12px; flex: 1; }
  .menu-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; padding: 0 12px; margin-bottom: 8px; }
  .menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; transition: all 0.15s; margin-bottom: 2px; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
  .menu-item:hover { background: rgba(255,255,255,0.10); color: #fff; }
  .menu-item.active { background: rgba(255,255,255,0.18); color: #fff; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.12); }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; transition: background 0.15s; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
  .logout-btn:hover { background: rgba(255,255,255,0.10); color: #fff; }

  .main-content { margin-left: 240px; padding: 28px 36px; min-height: 100vh; background: #f4f7fa; flex: 1; }
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--text-primary, #0d1f2d); }
  .page-sub { font-size: 13px; color: #7a90a0; margin-top: 4px; }
  .user-pill { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e8edf2; border-radius: 20px; padding: 5px 12px 5px 5px; cursor: pointer; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
  .stat-card { background: #fff; border: 1px solid #e8edf2; border-radius: 12px; padding: 18px 20px; }
  .stat-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
  .stat-value { font-size: 26px; font-weight: 700; color: var(--text-primary, #0d1f2d); font-family: 'Playfair Display', serif; }
  .stat-label { font-size: 12px; color: #7a90a0; font-weight: 500; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
  .card { background: #fff; border: 1px solid #e8edf2; border-radius: 12px; padding: 18px 20px; }
  .card-title { font-size: 13px; font-weight: 700; color: var(--text-primary, #0d1f2d); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; font-family: 'Playfair Display', serif; }
  .card-link { font-size: 11px; color: #7c3aed; font-weight: 600; cursor: pointer; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
  .badge-encours { background: #eef6fb; color: #0a5c8a; }
  .badge-sortie { background: #f0f4f8; color: #7a90a0; }
  .badge-realisee { background: #e6f7f2; color: #0f6e56; }
  .badge-planifiee { background: #fef3e2; color: #854f0b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; color: #7a90a0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f0f4f8; }
  td { padding: 12px; border-bottom: 1px solid #f0f4f8; color: var(--text-secondary, #4a6070); }
`;

const menuItems = [
  { icon: "🏠", label: "Accueil", key: "dashboard" },
  { icon: "🛏", label: "Patients hospitalisés", key: "hospi" },
  { icon: "👥", label: "Tous les patients", key: "patients" },
  { icon: "🔬", label: "Consultations", key: "consults" },
  { icon: "📅", label: "Rendez-vous du jour", key: "rdv" },
  { icon: "💬", label: "Messagerie", key: "messagerie" },
];

function StatutBadge({ s }) {
  const map = {
    en_cours: ["badge-encours", "En cours"],
    sortie: ["badge-sortie", "Sortie"],
    realisee: ["badge-realisee", "Réalisée"],
    planifiee: ["badge-planifiee", "Planifiée"],
    confirme: ["badge-realisee", "Confirmé"],
    en_attente: ["badge-planifiee", "En attente"],
  };
  const [cls, lbl] = map[s] || ["badge-sortie", s || "—"];
  return <span className={`badge ${cls}`}>{lbl}</span>;
}

// ─── Sections ───────────────────────────────────────────────────────────────
function SectionDashboard({ setActiveMenu, dateAujourdhui }) {
  const [stats, setStats] = useState({ hospi: 0, patients: 0, consults: 0, rdvs: 0 });
  const [hospitalises, setHospitalises] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [h, p, c, r] = await Promise.all([
          getHospitalisations(), getPatients(), getConsultations(), getRendezVous(),
        ]);
        const norm = (x) => Array.isArray(x) ? x : x.data || [];
        const hList = norm(h);
        const cList = norm(c);
        const rList = norm(r);
        setStats({
          hospi: hList.filter(x => x.statut === "en_cours").length,
          patients: norm(p).length,
          consults: cList.filter(x => x.date_consultation && new Date(x.date_consultation).toDateString() === new Date().toDateString()).length,
          rdvs: rList.filter(x => x.date_heure && new Date(x.date_heure).toDateString() === new Date().toDateString()).length,
        });
        setHospitalises(hList.filter(x => x.statut === "en_cours").slice(0, 5));
        setConsultations(cList.filter(x => x.statut === "planifiee").slice(0, 5));
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 22 }}>{dateAujourdhui}</div>

      <div className="stats-grid">
        {[
          { icon: "🛏", bg: "#f3efff", value: stats.hospi, label: "Patients hospitalisés" },
          { icon: "👥", bg: "#eef6fb", value: stats.patients, label: "Total patients" },
          { icon: "🔬", bg: "#e6f7f2", value: stats.consults, label: "Consultations aujourd'hui" },
          { icon: "📅", bg: "#fef3e2", value: stats.rdvs, label: "RDV aujourd'hui" },
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
          <div className="card-title">🛏 Patients hospitalisés en cours <span className="card-link" onClick={() => setActiveMenu("hospi")}>Voir tout →</span></div>
          {hospitalises.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#7a90a0", fontSize: 13 }}>Aucun patient hospitalisé</div>
          ) : hospitalises.map(h => (
            <div key={h.id} style={{ padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                    {h.patient ? `${h.patient.nom} ${h.patient.prenom}` : `Patient #${h.patient_id}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                    Chambre {h.chambre} · {h.lit || "—"} · {h.motif || "Sans motif"}
                  </div>
                </div>
                <StatutBadge s={h.statut} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🔬 Consultations à préparer <span className="card-link" onClick={() => setActiveMenu("consults")}>Voir tout →</span></div>
          {consultations.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#7a90a0", fontSize: 13 }}>Aucune consultation planifiée</div>
          ) : consultations.map(c => (
            <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                    {c.patient ? `${c.patient.nom} ${c.patient.prenom}` : `Patient #${c.patient_id}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                    {c.date_consultation ? new Date(c.date_consultation).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"} · Dr. {c.medecin?.nom || "—"}
                  </div>
                </div>
                <StatutBadge s={c.statut} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SectionHospitalises() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const h = await getHospitalisations();
        setList((Array.isArray(h) ? h : h.data || []).filter(x => x.statut === "en_cours"));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Patients hospitalisés
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>{list.length} patients en hospitalisation</div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Aucun patient hospitalisé en ce moment</div>
        ) : (
          <table>
            <thead><tr>
              <th>Patient</th><th>Chambre / Lit</th><th>Médecin</th><th>Entrée</th><th>Motif</th><th>Statut</th>
            </tr></thead>
            <tbody>
              {list.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{h.patient ? `${h.patient.nom} ${h.patient.prenom}` : `#${h.patient_id}`}</td>
                  <td style={{ color: "#7c3aed", fontWeight: 600 }}>{h.chambre} {h.lit ? `· ${h.lit}` : ""}</td>
                  <td>Dr. {h.medecin?.nom || "—"}</td>
                  <td style={{ color: "#7a90a0" }}>{h.date_entree ? new Date(h.date_entree).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>{h.motif || "—"}</td>
                  <td><StatutBadge s={h.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SectionPatients() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const p = await getPatients(); setList(Array.isArray(p) ? p : p.data || []); }
      catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const filtered = list.filter(p =>
    !search || `${p.nom} ${p.prenom} ${p.telephone || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Liste des patients
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 16 }}>{filtered.length} patient{filtered.length > 1 ? "s" : ""}</div>

      <input
        type="text"
        placeholder="Rechercher un patient par nom, prénom, téléphone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", marginBottom: 16 }}
      />

      <div className="card">
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Aucun patient trouvé</div>
        ) : (
          <table>
            <thead><tr>
              <th>Patient</th><th>Téléphone</th><th>Groupe</th><th>Allergies</th><th>Mutuelle</th><th>Contact urgence</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{p.nom} {p.prenom}</td>
                  <td>{p.telephone || "—"}</td>
                  <td style={{ fontWeight: 600, color: "#c0392b" }}>{p.groupe_sanguin || "—"}</td>
                  <td style={{ color: p.allergies ? "#c0392b" : "#7a90a0", fontWeight: p.allergies ? 600 : 400 }}>
                    {p.allergies || "Aucune"}
                  </td>
                  <td>{p.mutuelle || "—"}</td>
                  <td style={{ fontSize: 11 }}>{p.contact_urgence || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SectionConsultations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const c = await getConsultations(); setList(Array.isArray(c) ? c : c.data || []); }
      catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Consultations
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>{list.length} consultations · Vue lecture seule pour l'équipe soignante</div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Aucune consultation</div>
        ) : (
          <table>
            <thead><tr>
              <th>Date</th><th>Patient</th><th>Médecin</th><th>Motif</th><th>Diagnostic</th><th>Statut</th>
            </tr></thead>
            <tbody>
              {list.slice(0, 30).map(c => (
                <tr key={c.id}>
                  <td style={{ color: "#7a90a0" }}>{c.date_consultation ? new Date(c.date_consultation).toLocaleDateString("fr-FR") : "—"}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{c.patient ? `${c.patient.nom} ${c.patient.prenom}` : "—"}</td>
                  <td>Dr. {c.medecin?.nom || "—"}</td>
                  <td>{c.motif || "—"}</td>
                  <td style={{ fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.diagnostic || "—"}</td>
                  <td><StatutBadge s={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SectionRdv() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await getRendezVous();
        const arr = Array.isArray(r) ? r : r.data || [];
        setList(arr.filter(x => x.date_heure && new Date(x.date_heure).toDateString() === new Date().toDateString()));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Rendez-vous du jour
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>{list.length} rendez-vous prévus aujourd'hui</div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>Aucun RDV aujourd'hui</div>
        ) : (
          <table>
            <thead><tr>
              <th>Heure</th><th>Patient</th><th>Médecin</th><th>Motif</th><th>Statut</th>
            </tr></thead>
            <tbody>
              {list.sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure)).map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: "#7c3aed" }}>{new Date(r.date_heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{r.patient ? `${r.patient.nom} ${r.patient.prenom}` : `#${r.patient_id}`}</td>
                  <td>Dr. {r.medecin?.nom || "—"}</td>
                  <td>{r.motif || "—"}</td>
                  <td><StatutBadge s={r.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardInfirmier() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState(null);
  const unreadCount = useUnreadMessages(user?.id);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/connexion"); return; }
    setUser(u);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [navigate]);

  if (!user) return null;

  const prenom = user.prenom || user.name?.split(" ")[0] || "Infirmier";
  const nom = user.nom || user.name?.split(" ")[1] || "";
  const initiales = `${(prenom[0] || "").toUpperCase()}${(nom[0] || "").toUpperCase()}` || "IN";

  const dateAujourdhui = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
    " · " + now.toLocaleTimeString("fr-FR");

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard":  return <SectionDashboard setActiveMenu={setActiveMenu} dateAujourdhui={dateAujourdhui} />;
      case "hospi":      return <SectionHospitalises />;
      case "patients":   return <SectionPatients />;
      case "consults":   return <SectionConsultations />;
      case "rdv":        return <SectionRdv />;
      case "messagerie": return <Messagerie currentUserId={user?.id} />;
      default:           return <SectionDashboard setActiveMenu={setActiveMenu} dateAujourdhui={dateAujourdhui} />;
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
            <div className="menu-label">Menu Infirmier</div>
            {menuItems.map(item => (
              <button key={item.key} className={`menu-item${activeMenu === item.key ? " active" : ""}`} onClick={() => setActiveMenu(item.key)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                {item.key === "messagerie" && unreadCount > 0 && (
                  <span style={{
                    background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700,
                    padding: "2px 7px", borderRadius: 10, minWidth: 18, textAlign: "center",
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
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Infirmier(e)</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/connexion"); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="topbar">
            <div>
              <div className="page-title">
                {activeMenu === "dashboard" ? `Bonjour, ${prenom} 👋` : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ThemeToggle />
              <div className="user-pill">
                <div className="user-avatar" style={{ background: "#7c3aed" }}>{initiales}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)" }}>{prenom} {nom}</span>
              </div>
            </div>
          </div>

          {renderSection()}
        </main>
      </div>
    </>
  );
}
