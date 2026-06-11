import React, { useState, useEffect } from "react";
import { getPatients, createPatient, updatePatient, deletePatient } from "../api";

export default function AdminPatients() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [compteInfo, setCompteInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [filtreSexe, setFiltreSexe] = useState("");
  const empty = {
    nom: "", prenom: "", date_naissance: "", sexe: "", adresse: "", telephone: "",
    email: "", groupe_sanguin: "", contact_urgence: "", numero_securite_sociale: "",
    mutuelle: "", allergies: "", antecedents: "",
    creer_compte: false, password: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getPatients();
      setList(Array.isArray(d) ? d : d.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm(empty); setShowForm(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      ...empty,
      nom: p.nom || "", prenom: p.prenom || "",
      date_naissance: p.date_naissance ? p.date_naissance.slice(0, 10) : "",
      sexe: p.sexe || "", adresse: p.adresse || "", telephone: p.telephone || "",
      email: p.email || "", groupe_sanguin: p.groupe_sanguin || "",
      contact_urgence: p.contact_urgence || "",
      numero_securite_sociale: p.numero_securite_sociale || "",
      mutuelle: p.mutuelle || "", allergies: p.allergies || "", antecedents: p.antecedents || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.nom || !form.prenom) { setMsg({ type: "err", text: "Nom et prénom obligatoires" }); return; }
    try {
      if (editItem) {
        await updatePatient(editItem.id, form);
        setMsg({ type: "ok", text: "Patient modifié" });
      } else {
        const res = await createPatient(form);
        if (res.compte_genere) setCompteInfo(res.compte_genere);
        setMsg({ type: "ok", text: "Patient enregistré" });
      }
      setShowForm(false);
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce patient ? Cette action est irréversible.")) return;
    try { await deletePatient(id); setMsg({ type: "ok", text: "Patient supprimé" }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };
  const btn = (bg, col) => ({ background: bg, color: col, border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" });

  const filtered = list.filter(p => {
    if (filtreSexe && p.sexe !== filtreSexe) return false;
    if (search) {
      const s = `${p.nom} ${p.prenom} ${p.telephone || ""}`.toLowerCase();
      if (!s.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>Gestion des patients</div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>{list.length} patients enregistrés</div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {compteInfo && (
        <div style={{ background: "#fff9e6", border: "1px solid #f0c040", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#854f0b", marginBottom: 8 }}>⚠️ Compte patient créé</div>
          <div style={{ fontSize: 13 }}>Email : <strong>{compteInfo.email}</strong> · Mot de passe : <strong style={{ fontFamily: "monospace" }}>{compteInfo.password}</strong></div>
          <button style={{ background: "#854f0b", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", marginTop: 8 }} onClick={() => setCompteInfo(null)}>Noté ✓</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <input type="text" placeholder="Rechercher par nom, téléphone..." style={{ ...inp, flex: 1, minWidth: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...inp, width: "auto" }} value={filtreSexe} onChange={e => setFiltreSexe(e.target.value)}>
          <option value="">Tous sexes</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
          <option value="Autre">Autre</option>
        </select>
        <button style={btn("#1a2332", "#fff")} onClick={openCreate}>+ Nouveau patient</button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 16 }}>
            {editItem ? "Modifier le patient" : "Nouveau patient"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[
              ["Nom *", "nom", "text"],
              ["Prénom *", "prenom", "text"],
              ["Date de naissance", "date_naissance", "date"],
              ["Téléphone", "telephone", "tel"],
              ["Email", "email", "email"],
              ["Adresse", "adresse", "text"],
              ["N° sécurité sociale", "numero_securite_sociale", "text"],
              ["Groupe sanguin", "groupe_sanguin", "select", ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
              ["Sexe", "sexe", "select", ["", "M", "F", "Autre"]],
              ["Mutuelle", "mutuelle", "text"],
              ["Contact d'urgence", "contact_urgence", "text"],
            ].map(([lbl, key, type, opts]) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>{lbl}</label>
                {type === "select" ? (
                  <select style={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}>
                    {opts.map(o => <option key={o} value={o}>{o || "—"}</option>)}
                  </select>
                ) : (
                  <input type={type} style={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Allergies</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="Pénicilline, fruits de mer..." />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Antécédents médicaux</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={form.antecedents} onChange={e => setForm({ ...form, antecedents: e.target.value })} placeholder="Diabète, hypertension..." />
            </div>
          </div>

          {!editItem && (
            <div style={{ background: "#eef6fb", borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0a5c8a", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.creer_compte} onChange={e => setForm({ ...form, creer_compte: e.target.checked })} />
                Créer un compte patient (portail)
              </label>
              {form.creer_compte && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Email connexion</label>
                    <input type="email" style={inp} value={form.email_compte || form.email || ""} onChange={e => setForm({ ...form, email_compte: e.target.value })} placeholder="Sinon = email patient" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Mot de passe (optionnel)</label>
                    <input type="text" style={inp} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Auto-généré si vide" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btn("#1a2332", "#fff")} onClick={save}>Enregistrer</button>
            <button style={btn("#f0f4f8", "#1a2332")} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Patient", "Téléphone", "Sexe", "Groupe", "Adresse", "Compte", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#7a90a0", textTransform: "uppercase", borderBottom: "1px solid #f0f4f8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#7a90a0" }}>Aucun patient</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef6fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a5c8a" }}>
                        {(p.nom || "?")[0]}{(p.prenom || "?")[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</div>
                        {p.date_naissance && <div style={{ fontSize: 11, color: "#7a90a0" }}>{new Date(p.date_naissance).toLocaleDateString("fr-FR")}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>{p.telephone || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>{p.sexe || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#c0392b", fontWeight: 600 }}>{p.groupe_sanguin || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>{p.adresse || "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {p.user ? <span style={{ fontSize: 11, color: "#0f6e56", fontWeight: 600 }}>✓ Actif</span> : <span style={{ fontSize: 11, color: "#7a90a0" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ background: "#eef6fb", color: "#0a5c8a", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Modifier</button>
                      <button onClick={() => remove(p.id)} style={{ background: "#fdeaea", color: "#c0392b", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
