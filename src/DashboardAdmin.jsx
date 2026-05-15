import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminConsultations from "./sections/AdminConsultations";
import AdminHospitalisations from "./sections/AdminHospitalisations";
import AdminFacturation from "./sections/AdminFacturation";
import AdminInfirmiers from "./sections/AdminInfirmiers";
import AdminUtilisateurs from "./sections/AdminUtilisateurs";
import { getMedecins, createMedecin, deleteMedecin, getPatients, deletePatient, getStatsDashboard, getRendezVous, getUser, logout } from "./api";

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
  { icon: "🩺", label: "Infirmiers", key: "infirmiers" },
  { icon: "👥", label: "Gestion patients", key: "patients" },
  { icon: "🔬", label: "Consultations", key: "consultations" },
  { icon: "🏥", label: "Hospitalisations", key: "hospitalisations" },
  { icon: "📅", label: "Rendez-vous", key: "rdv" },
  { icon: "💰", label: "Facturation", key: "facturation" },
  { icon: "👤", label: "Utilisateurs", key: "utilisateurs" },
  { icon: "📈", label: "Statistiques", key: "stats" },
  { icon: "📄", label: "Rapports", key: "rapports" },
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
// ─── SECTION : TABLEAU DE BORD ────────────────────────────────────────────────
function SectionDashboard({ setActiveMenu, prenom, nom, initiales, dateAujourdhui }) {
  const [stats, setStats] = useState(null);
  const [medecins, setMedecinsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [rdvs, setRdvs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [st, md, pt, rv] = await Promise.all([
          getStatsDashboard(),
          getMedecins(),
          getPatients(),
          getRendezVous()
        ]);
        setStats(st);
        setMedecinsList(md);
        setPatientsList(pt);
        setRdvs(rv);
      } catch (e) {
        console.error("Erreur chargement dashboard", e);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Tableau de bord — Administration</div>
          <div className="page-sub">{dateAujourdhui} · Hôpital KDG Health</div>
        </div>
        <div className="user-pill">
          <div className="user-avatar">{initiales}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>{prenom} {nom}</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: "👨‍⚕️", bg: "#eef6fb", value: stats?.medecins || "0", label: "Médecins", delta: "Actifs", color: "#0f6e56" },
          { icon: "👥", bg: "#e6f7f2", value: stats?.patients || "0", label: "Patients", delta: "Enregistrés", color: "#0f6e56" },
          { icon: "📅", bg: "#fef3e2", value: stats?.rendezvous_aujourd_hui || "0", label: "RDV aujourd'hui", delta: "Aujourd'hui", color: "#7a90a0" },
          { icon: "🏥", bg: "#fdeaea", value: stats?.hospitalisations_en_cours || "0", label: "Hospitalisations", delta: "En cours", color: "#c0392b" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta" style={{ color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Gestion des médecins <span className="card-link" onClick={() => setActiveMenu("medecins")}>Voir tout →</span></div>
          <table>
            <thead><tr><th>Médecin</th><th>Spécialité</th><th>Téléphone</th><th>Ordre</th></tr></thead>
            <tbody>
              {medecins.slice(0, 4).map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>Dr. {m.nom} {m.prenom}</td>
                  <td style={{ color: "#4a6070" }}>{m.specialite}</td>
                  <td style={{ fontWeight: 600, color: "#0a5c8a" }}>{m.telephone}</td>
                  <td style={{ color: "#4a6070" }}>{m.numero_ordre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">Rendez-vous récents <span className="card-link" onClick={() => setActiveMenu("rdv")}>Voir tout →</span></div>
          {rdvs.slice(0, 4).map((r, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0f4f8" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f2d" }}>Patient #{r.patient_id}</div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{new Date(r.date_heure).toLocaleString('fr-FR')}</div>
                </div>
                <Badge statut={r.statut} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Patients récents <span className="card-link" onClick={() => setActiveMenu("patients")}>Voir tout →</span></div>
        <table>
          <thead><tr><th>Patient</th><th>Téléphone</th><th>Adresse</th><th>Contact d'urgence</th></tr></thead>
          <tbody>
            {patientsList.slice(0, 4).map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</td>
                <td style={{ color: "#4a6070" }}>{p.telephone}</td>
                <td style={{ color: "#4a6070" }}>{p.adresse}</td>
                <td style={{ color: "#4a6070" }}>{p.contact_urgence || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SECTION : GESTION MÉDECINS (connectée API) ───────────────────────────────
function SectionMedecins() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [compteInfo, setCompteInfo] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ nom:"", prenom:"", specialite:"", telephone:"", email:"", numero_ordre:"", email_compte:"", password:"" });
  const inp = { padding:"9px 12px", border:"1px solid #e8edf2", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%" };

  const load = async () => { try { const d = await getMedecins(); setList(Array.isArray(d)?d:d.data||[]); } catch(e){} };
  useEffect(()=>{ load(); }, []);

  const save = async () => {
    try {
      const res = await createMedecin(form);
      if (res.compte_genere) setCompteInfo(res.compte_genere);
      setShowForm(false); setMsg({type:"ok",text:"Médecin ajouté"}); load();
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };
  const remove = async (id) => { if(!window.confirm("Supprimer ce médecin ?")) return; try { await deleteMedecin(id); load(); } catch(e){} };

  return (
    <>
      <div className="pg-header">Gestion des médecins</div>
      <div className="pg-sub-text">{list.length} médecins enregistrés</div>

      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:12,fontSize:13}}>{msg.text}</div>}
      {compteInfo && (
        <div style={{background:"#fff9e6",border:"1px solid #f0c040",borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#854f0b",marginBottom:8}}>⚠️ Identifiants du compte médecin créé</div>
          <div style={{fontSize:13}}>Email : <strong>{compteInfo.email}</strong> · Mot de passe : <strong style={{fontFamily:"monospace"}}>{compteInfo.password}</strong></div>
          <button style={{background:"#854f0b",color:"#fff",border:"none",padding:"6px 14px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",marginTop:8}} onClick={()=>setCompteInfo(null)}>Noté ✓</button>
        </div>
      )}

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un médecin..." />
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Ajouter un médecin</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Nouveau médecin — compte créé automatiquement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[["Nom","nom"],["Prénom","prenom"],["Spécialité","specialite"],["Téléphone","telephone"],["Email pro","email"],["N° Ordre","numero_ordre"]].map(([lbl,key]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#4a6070" }}>{lbl}</label>
                <input type="text" style={inp} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#0a5c8a" }}>Email compte connexion</label>
              <input type="email" style={{...inp,borderColor:"#0a5c8a"}} value={form.email_compte} onChange={e=>setForm({...form,email_compte:e.target.value})} placeholder="Laissez vide = email pro" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#0a5c8a" }}>Mot de passe (optionnel)</label>
              <input type="text" style={{...inp,borderColor:"#0a5c8a"}} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Auto-généré si vide" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={save}>Enregistrer</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {list.map((m, i) => (
          <div key={m.id||i} className="card">
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#eef6fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#0a5c8a", flexShrink: 0 }}>{(m.nom||"?")[0]}{(m.prenom||"?")[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f2d" }}>Dr. {m.nom} {m.prenom}</div>
                <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>{m.specialite}</div>
                {m.user && <div style={{ fontSize: 11, color: "#0f6e56", marginTop: 4 }}>✓ Compte actif</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0" }}>
              <div className="info-item"><div className="info-label">Téléphone</div><div className="info-value">{m.telephone||"—"}</div></div>
              <div className="info-item"><div className="info-label">N° Ordre</div><div className="info-value">{m.numero_ordre||"—"}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-action btn-delete" style={{ flex: 1, padding: "7px" }} onClick={()=>remove(m.id)}>Retirer</button>
            </div>
          </div>
        ))}
        {list.length===0 && <div style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:"#7a90a0"}}>Aucun médecin enregistré</div>}
      </div>
    </>
  );
}

// ─── SECTION : GESTION PATIENTS ───────────────────────────────────────────────
// ─── SECTION : GESTION PATIENTS ───────────────────────────────────────────────
function SectionPatients() {
  const [filtre, setFiltre] = useState("tous");
  const [patientsList, setPatientsList] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPatients();
        setPatientsList(Array.isArray(data) ? data : data.data || []);
      } catch (e) { console.error("Erreur chargement patients", e); }
    }
    load();
  }, []);

  const filtres = patientsList;

  return (
    <>
      <div className="pg-header">Gestion des patients</div>
      <div className="pg-sub-text">{patientsList.length} patients enregistrés</div>

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un patient..." />
        <button className="btn-primary">+ Nouveau patient</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Patient</th><th>Téléphone</th><th>Adresse</th><th>Sexe</th><th>Groupe Sanguin</th><th>Contact Urgence</th></tr></thead>
          <tbody>
            {filtres.map((p, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef6fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a5c8a", flexShrink: 0 }}>{(p.nom||"?")[0]}{(p.prenom||"?")[0]}</div>
                    <span style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</span>
                  </div>
                </td>
                <td style={{ color: "#4a6070" }}>{p.telephone}</td>
                <td style={{ color: "#4a6070" }}>{p.adresse}</td>
                <td style={{ color: "#4a6070" }}>{p.sexe}</td>
                <td style={{ color: "#7a90a0" }}>{p.groupe_sanguin}</td>
                <td style={{ color: "#4a6070" }}>{p.contact_urgence}</td>
              </tr>
            ))}
            {filtres.length === 0 && <tr><td colSpan="6" style={{textAlign:"center", padding:20, color:"#7a90a0"}}>Aucun patient</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SECTION : RENDEZ-VOUS ────────────────────────────────────────────────────
function SectionRdv() {
  const [rdvs, setRdvs] = useState([]);
  const [medecinsList, setMedecinsList] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [r, m] = await Promise.all([getRendezVous(), getMedecins()]);
        setRdvs(Array.isArray(r) ? r : r.data || []);
        setMedecinsList(Array.isArray(m) ? m : m.data || []);
      } catch (e) { console.error("Erreur", e); }
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Rendez-vous</div>
      <div className="pg-sub-text">Tous les rendez-vous programmés</div>

      <div className="search-bar">
        <input type="text" placeholder="Rechercher un RDV..." />
        <select style={{ padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1f2d", outline: "none" }}>
          <option>Tous les médecins</option>
          {medecinsList.map(m => <option key={m.id}>Dr. {m.nom} {m.prenom}</option>)}
        </select>
        <button className="btn-primary">+ Nouveau RDV</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Tous les rendez-vous</div>
          <table>
            <thead><tr><th>Patient ID</th><th>Médecin ID</th><th>Date & Heure</th><th>Statut</th><th>Motif</th></tr></thead>
            <tbody>
              {rdvs.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.patient_id}</td>
                  <td style={{ color: "#4a6070" }}>{r.medecin_id}</td>
                  <td style={{ color: "#7a90a0" }}>{new Date(r.date_heure).toLocaleString()}</td>
                  <td><Badge statut={r.statut} /></td>
                  <td style={{ color: "#4a6070" }}>{r.motif || '—'}</td>
                </tr>
              ))}
              {rdvs.length === 0 && <tr><td colSpan="5" style={{textAlign:"center", padding:20, color:"#7a90a0"}}>Aucun rendez-vous</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Résumé des RDVs</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Total RDV", rdvs.length, "#0a5c8a"], ["Confirmés", rdvs.filter(r => r.statut === "confirme").length, "#0f6e56"],
                ["En attente", rdvs.filter(r => r.statut === "en_attente").length, "#854f0b"], ["Annulés", rdvs.filter(r => r.statut === "annule").length, "#c0392b"],
              ].map(([lbl, val, color]) => (
                <div key={lbl} className="info-item" style={{ textAlign: "center" }}>
                  <div className="info-label">{lbl}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SECTION : STATISTIQUES ───────────────────────────────────────────────────
function SectionStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try { const d = await getStatsDashboard(); setStats(d); } catch(e) {}
    }
    load();
  }, []);

  return (
    <>
      <div className="pg-header">Statistiques</div>
      <div className="pg-sub-text">Indicateurs de performance de l'API Laravel</div>

      <div className="stats-grid">
        {[
          { icon: "👨‍⚕️", bg: "#eef6fb", value: stats?.medecins||"0", label: "Médecins", color: "#0a5c8a" },
          { icon: "🩺", bg: "#e6f7f2", value: stats?.infirmiers||"0", label: "Infirmiers", color: "#0f6e56" },
          { icon: "👥", bg: "#fef3e2", value: stats?.patients||"0", label: "Patients", color: "#854f0b" },
          { icon: "🔬", bg: "#f3efff", value: stats?.consultations||"0", label: "Consultations", color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 18 }}>{s.icon}</span></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
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
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/connexion"); return; }
    setUser(u);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const prenom = user?.prenom || user?.name?.split(" ")[0] || "Admin";
  const nom = user?.nom || user?.name?.split(" ")[1] || "";
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "AD";
  const dateAujourdhui = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " - " + now.toLocaleTimeString("fr-FR");

  const renderSection = () => {
    switch (activeMenu) {
      case "dashboard":       return <SectionDashboard setActiveMenu={setActiveMenu} prenom={prenom} nom={nom} initiales={initiales} dateAujourdhui={dateAujourdhui} />;
      case "medecins":        return <SectionMedecins />;
      case "infirmiers":      return <AdminInfirmiers />;
      case "patients":        return <SectionPatients />;
      case "consultations":   return <AdminConsultations />;
      case "hospitalisations":return <AdminHospitalisations />;
      case "rdv":             return <SectionRdv />;
      case "facturation":     return <AdminFacturation />;
      case "utilisateurs":    return <AdminUtilisateurs />;
      case "stats":           return <SectionStats />;
      case "rapports":        return <SectionRapports />;
      default:                return null;
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
              <div className="user-avatar">{initiales}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{prenom} {nom}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Administrateur</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/connexion"); }}>
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
