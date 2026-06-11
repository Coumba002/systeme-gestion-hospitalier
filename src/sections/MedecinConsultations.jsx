import React, { useState, useEffect, useMemo } from "react";
import {
  getConsultations, createConsultation, updateConsultation,
  getPatients, createPrescription, getPrescriptions, getMedecins,
} from "../api";
import { printOrdonnance } from "../utils/printPdf";

const STATUTS = {
  planifiee: ["#fef3e2", "#854f0b", "Planifiée"],
  realisee:  ["#e6f7f2", "#0f6e56", "Réalisée"],
  annulee:   ["#fdeaea", "#c0392b", "Annulée"],
};

function Badge({ s }) {
  const [bg, col, lbl] = STATUTS[s] || ["#f0f4f8", "#7a90a0", s || "—"];
  return <span style={{ background: bg, color: col, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{lbl}</span>;
}

const cim10Examples = [
  "E11 — Diabète sucré de type 2",
  "I10 — Hypertension essentielle",
  "J06.9 — Infection aiguë voies respiratoires sup.",
  "K29 — Gastrite et duodénite",
  "M54.5 — Lombalgie",
  "R51 — Céphalée",
  "R50.9 — Fièvre, sans précision",
  "J45 — Asthme",
];

export default function MedecinConsultations({ medecinId }) {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null); // consultation ouverte dans le panneau détail
  const [msg, setMsg] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const emptyConsult = { patient_id: "", date_consultation: "", motif: "", diagnostic: "", notes: "", statut: "planifiee" };
  const [form, setForm] = useState(emptyConsult);

  // Ordonnance liée à la consultation sélectionnée
  const emptyOrd = { medicaments: "", dosage: "", frequence: "2 fois/jour", duree: "", instructions: "" };
  const [ord, setOrd] = useState(emptyOrd);

  const load = async () => {
    setLoading(true);
    try {
      const [c, p, pr, md] = await Promise.all([
        getConsultations(),
        getPatients(),
        getPrescriptions(),
        getMedecins(),
      ]);
      setList(Array.isArray(c) ? c : c.data || []);
      setPatients(Array.isArray(p) ? p : p.data || []);
      setPrescriptions(Array.isArray(pr) ? pr : pr.data || []);
      setMedecins(Array.isArray(md) ? md : md.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveConsult = async () => {
    if (!form.patient_id || !form.date_consultation) { setMsg({ type: "err", text: "Patient et date obligatoires" }); return; }
    try {
      const payload = { ...form, medecin_id: medecinId || form.medecin_id };
      if (editItem) await updateConsultation(editItem.id, payload);
      else await createConsultation(payload);
      setShowForm(false);
      setMsg({ type: "ok", text: editItem ? "Consultation modifiée" : "Consultation créée" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const saveDiagnostic = async () => {
    if (!selected) return;
    try {
      await updateConsultation(selected.id, {
        diagnostic: selected.diagnostic,
        notes: selected.notes,
        statut: "realisee",
      });
      setMsg({ type: "ok", text: "Diagnostic enregistré et consultation marquée réalisée" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const saveOrdonnance = async () => {
    if (!selected || !ord.medicaments) {
      setMsg({ type: "err", text: "Médicament obligatoire pour créer une ordonnance" });
      return;
    }
    try {
      await createPrescription({
        patient_id: selected.patient_id,
        medecin_id: medecinId || selected.medecin_id,
        consultation_id: selected.id,
        date_prescription: new Date().toISOString().slice(0, 10),
        ...ord,
      });
      setMsg({ type: "ok", text: "Ordonnance créée et liée à la consultation" });
      setOrd(emptyOrd);
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const annuler = async (c) => {
    if (!window.confirm("Annuler cette consultation ?")) return;
    try { await updateConsultation(c.id, { statut: "annulee" }); load(); }
    catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const ordonnancesPourConsult = (consultId) =>
    prescriptions.filter(p => p.consultation_id === consultId);

  const filtered = useMemo(() => list.filter(c => {
    if (filtreStatut !== "tous" && c.statut !== filtreStatut) return false;
    if (search) {
      const s = `${c.patient?.nom || ""} ${c.patient?.prenom || ""} ${c.motif || ""} ${c.diagnostic || ""}`.toLowerCase();
      if (!s.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [list, filtreStatut, search]);

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };
  const btn = (bg, col) => ({ background: bg, color: col, border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" });

  const stats = {
    total: list.length,
    aujourdhui: list.filter(c => c.date_consultation && new Date(c.date_consultation).toDateString() === new Date().toDateString()).length,
    realisees: list.filter(c => c.statut === "realisee").length,
    planifiees: list.filter(c => c.statut === "planifiee").length,
  };

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>Mes consultations</div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>Gestion des consultations, diagnostics et ordonnances liées</div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {[
          ["Total", stats.total, "#0a5c8a"],
          ["Aujourd'hui", stats.aujourdhui, "#7c3aed"],
          ["Planifiées", stats.planifiees, "#854f0b"],
          ["Réalisées", stats.realisees, "#0f6e56"],
        ].map(([lbl, val, col]) => (
          <div key={lbl} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: col, fontFamily: "'Playfair Display',serif", marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 460px" : "1fr", gap: 16 }}>
        {/* Colonne liste */}
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Rechercher patient, motif, diagnostic..."
              style={{ ...inp, flex: 1, minWidth: 200 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={{ ...inp, width: "auto" }} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
              <option value="tous">Tous statuts</option>
              <option value="planifiee">Planifiées</option>
              <option value="realisee">Réalisées</option>
              <option value="annulee">Annulées</option>
            </select>
            <button style={btn("#0a5c8a", "#fff")} onClick={() => { setEditItem(null); setForm(emptyConsult); setShowForm(true); }}>
              + Nouvelle consultation
            </button>
          </div>

          {showForm && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 14 }}>
                {editItem ? "Modifier la consultation" : "Nouvelle consultation"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Patient *</label>
                  <select style={inp} value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                    <option value="">-- Sélectionner --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date & heure *</label>
                  <input type="datetime-local" style={inp} value={form.date_consultation} onChange={e => setForm({ ...form, date_consultation: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Motif de consultation</label>
                  <input type="text" style={inp} placeholder="Douleurs abdominales, suivi diabète..." value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btn("#0a5c8a", "#fff")} onClick={saveConsult}>Enregistrer</button>
                <button style={btn("#f0f4f8", "#0d1f2d")} onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>
                Aucune consultation. Créez-en une avec le bouton ci-dessus.
              </div>
            ) : filtered.map(c => {
              const isSel = selected?.id === c.id;
              const ordCount = ordonnancesPourConsult(c.id).length;
              return (
                <div
                  key={c.id}
                  onClick={() => { setSelected(c); setOrd(emptyOrd); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderBottom: "1px solid #f0f4f8",
                    cursor: "pointer",
                    background: isSel ? "#eef6fb" : "transparent",
                    borderLeft: isSel ? "3px solid #0a5c8a" : "3px solid transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ background: "#f9fbfc", borderRadius: 10, padding: "8px 12px", minWidth: 64, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0a5c8a", fontFamily: "'Playfair Display',serif" }}>
                      {c.date_consultation ? new Date(c.date_consultation).getDate() : "?"}
                    </div>
                    <div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase" }}>
                      {c.date_consultation ? new Date(c.date_consultation).toLocaleString("fr-FR", { month: "short" }) : ""}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                      {c.patient ? `${c.patient.nom} ${c.patient.prenom}` : `Patient #${c.patient_id}`}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.motif || "Sans motif"}
                      {c.diagnostic && <span style={{ color: "#0f6e56", fontWeight: 600 }}> · {c.diagnostic.slice(0, 40)}{c.diagnostic.length > 40 ? "…" : ""}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                    <Badge s={c.statut} />
                    {ordCount > 0 && (
                      <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600, background: "#f3efff", padding: "2px 6px", borderRadius: 5 }}>
                        💊 {ordCount} ord.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau détail consultation */}
        {selected && (
          <div style={{ position: "sticky", top: 24, alignSelf: "flex-start", background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0a5c8a", textTransform: "uppercase", letterSpacing: 0.5 }}>Consultation #{selected.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginTop: 4 }}>
                  {selected.patient ? `${selected.patient.nom} ${selected.patient.prenom}` : `Patient #${selected.patient_id}`}
                </div>
                <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>
                  {selected.date_consultation ? new Date(selected.date_consultation).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }) : "—"}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", fontSize: 20, color: "#7a90a0", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Badge s={selected.statut} />
              {selected.motif && <div style={{ fontSize: 12, color: "var(--text-secondary, #4a6070)", marginTop: 8 }}><strong>Motif :</strong> {selected.motif}</div>}
            </div>

            <div style={{ borderTop: "1px solid #f0f4f8", paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 10 }}>📋 Diagnostic</div>
              <textarea
                style={{ ...inp, resize: "vertical", minHeight: 80 }}
                rows={3}
                value={selected.diagnostic || ""}
                onChange={e => setSelected({ ...selected, diagnostic: e.target.value })}
                placeholder="Description clinique, code CIM-10..."
              />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, marginBottom: 4 }}>Codes CIM-10 fréquents :</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {cim10Examples.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelected({ ...selected, diagnostic: (selected.diagnostic ? selected.diagnostic + " · " : "") + c })}
                      style={{ background: "#f0f4f8", border: "none", padding: "3px 8px", borderRadius: 4, fontSize: 10, color: "var(--text-secondary, #4a6070)", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      + {c.split(" — ")[0]}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                style={{ ...inp, resize: "vertical", minHeight: 60, marginTop: 10 }}
                rows={2}
                value={selected.notes || ""}
                onChange={e => setSelected({ ...selected, notes: e.target.value })}
                placeholder="Notes complémentaires..."
              />
              <button style={{ ...btn("#0a5c8a", "#fff"), width: "100%", marginTop: 10 }} onClick={saveDiagnostic}>
                💾 Enregistrer diagnostic & marquer réalisée
              </button>
            </div>

            <div style={{ borderTop: "1px solid #f0f4f8", paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 10 }}>💊 Ordonnance liée</div>
              {ordonnancesPourConsult(selected.id).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {ordonnancesPourConsult(selected.id).map(p => {
                    const med = medecins.find(m => m.id === (p.medecin_id || selected.medecin_id));
                    const pat = patients.find(pt => pt.id === selected.patient_id) || selected.patient;
                    return (
                      <div key={p.id} style={{ background: "#f3efff", borderLeft: "3px solid #7c3aed", padding: "8px 12px", borderRadius: 6, marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>{p.medicaments}</div>
                          <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                            {[p.dosage, p.frequence, p.duree].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <button
                          onClick={() => printOrdonnance({ prescription: p, patient: pat, medecin: med })}
                          title="Imprimer l'ordonnance"
                          style={{ background: "#fff", border: "1px solid #7c3aed", color: "#7c3aed", padding: "4px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          🖨 PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <input type="text" style={inp} placeholder="Médicament *" value={ord.medicaments} onChange={e => setOrd({ ...ord, medicaments: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <input type="text" style={inp} placeholder="Dosage (500mg)" value={ord.dosage} onChange={e => setOrd({ ...ord, dosage: e.target.value })} />
                <select style={inp} value={ord.frequence} onChange={e => setOrd({ ...ord, frequence: e.target.value })}>
                  <option>1 fois/jour</option>
                  <option>2 fois/jour</option>
                  <option>3 fois/jour</option>
                  <option>Au besoin</option>
                </select>
              </div>
              <input type="text" style={{ ...inp, marginTop: 8 }} placeholder="Durée (30 jours)" value={ord.duree} onChange={e => setOrd({ ...ord, duree: e.target.value })} />
              <textarea style={{ ...inp, resize: "vertical", marginTop: 8 }} rows={2} placeholder="Instructions..." value={ord.instructions} onChange={e => setOrd({ ...ord, instructions: e.target.value })} />
              <button style={{ ...btn("#7c3aed", "#fff"), width: "100%", marginTop: 10 }} onClick={saveOrdonnance}>
                + Créer ordonnance
              </button>
            </div>

            <div style={{ borderTop: "1px solid #f0f4f8", paddingTop: 14, display: "flex", gap: 8 }}>
              {selected.statut !== "annulee" && (
                <button onClick={() => annuler(selected)} style={{ ...btn("#fdeaea", "#c0392b"), flex: 1, padding: "8px 14px" }}>
                  Annuler consultation
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
