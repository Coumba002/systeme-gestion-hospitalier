import React, { useState, useEffect, useMemo } from "react";
import { getHospitalisations, createHospitalisation, enregistrerSortie, getPatients, getMedecins } from "../api";

const STATUTS = {
  en_cours: ["#eef6fb", "#0a5c8a", "En cours"],
  sortie:   ["#f0f4f8", "#7a90a0", "Sortie"],
  transfere:["#fef3e2", "#854f0b", "Transféré"],
};

function Badge({ s }) {
  const [bg, col, lbl] = STATUTS[s] || ["#f0f4f8", "#7a90a0", s];
  return <span style={{ background: bg, color: col, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{lbl}</span>;
}

// ─── Structure de l'hôpital (statique) ──────────────────────────────────────
// Services × chambres × lits — adapter selon les besoins réels
const SERVICES = [
  { code: "MED",   nom: "Médecine générale",   color: "#0a5c8a", rooms: ["101", "102", "103", "104", "105"], litsParRoom: 2 },
  { code: "CHIR",  nom: "Chirurgie",           color: "#7c3aed", rooms: ["201", "202", "203", "204"],         litsParRoom: 2 },
  { code: "PED",   nom: "Pédiatrie",           color: "#0f6e56", rooms: ["301", "302", "303"],                litsParRoom: 3 },
  { code: "MAT",   nom: "Maternité",           color: "#c0392b", rooms: ["401", "402"],                       litsParRoom: 2 },
  { code: "URG",   nom: "Urgences",            color: "#854f0b", rooms: ["501", "502"],                       litsParRoom: 4 },
];

// Génère la liste complète des lits : ["MED-101-1", "MED-101-2", ...]
function allBeds() {
  const beds = [];
  for (const s of SERVICES) {
    for (const r of s.rooms) {
      for (let l = 1; l <= s.litsParRoom; l++) {
        beds.push({ service: s.code, serviceNom: s.nom, color: s.color, chambre: r, lit: `Lit ${l}`, key: `${s.code}-${r}-${l}` });
      }
    }
  }
  return beds;
}

const ALL_BEDS = allBeds();

export default function AdminHospitalisations() {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sortieModal, setSortieModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filtre, setFiltre] = useState("tous");
  const [view, setView] = useState("liste"); // "liste" | "chambres"
  const [selectedBed, setSelectedBed] = useState(null);
  const [serviceFiltre, setServiceFiltre] = useState("tous");

  const emptyForm = { patient_id: "", medecin_id: "", chambre: "", lit: "", date_entree: "", date_sortie_prevue: "", motif: "", notes: "", statut: "en_cours" };
  const [form, setForm] = useState(emptyForm);
  const [sortieDate, setSortieDate] = useState("");

  const load = async () => {
    try {
      const [h, p, m] = await Promise.all([getHospitalisations(), getPatients(), getMedecins()]);
      setList(Array.isArray(h) ? h : h.data || []);
      setPatients(Array.isArray(p) ? p : p.data || []);
      setMedecins(Array.isArray(m) ? m : m.data || []);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Map des lits occupés : { "101-Lit 1": {hospi, patient, ...} }
  const bedsOccupes = useMemo(() => {
    const occ = {};
    list.filter(h => h.statut === "en_cours").forEach(h => {
      const key = `${h.chambre}-${h.lit}`;
      occ[key] = h;
    });
    return occ;
  }, [list]);

  const isBedOccupied = (b) => !!bedsOccupes[`${b.chambre}-${b.lit}`];

  const stats = useMemo(() => {
    const total = ALL_BEDS.length;
    const occupes = ALL_BEDS.filter(isBedOccupied).length;
    const libres = total - occupes;
    const taux = total > 0 ? Math.round((occupes / total) * 100) : 0;
    return { total, occupes, libres, taux, enCours: list.filter(h => h.statut === "en_cours").length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, bedsOccupes]);

  const save = async () => {
    if (!form.patient_id || !form.medecin_id || !form.chambre || !form.date_entree) {
      setMsg({ type: "err", text: "Patient, médecin, chambre et date d'entrée obligatoires" });
      return;
    }
    // Vérifier que le lit n'est pas déjà occupé
    if (bedsOccupes[`${form.chambre}-${form.lit}`]) {
      setMsg({ type: "err", text: `Le lit ${form.lit} de la chambre ${form.chambre} est déjà occupé` });
      return;
    }
    try {
      await createHospitalisation(form);
      setShowForm(false); setForm(emptyForm); setSelectedBed(null);
      setMsg({ type: "ok", text: "Hospitalisation enregistrée — lit attribué" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const doSortie = async () => {
    if (!sortieDate) return;
    try {
      await enregistrerSortie(sortieModal.id, { date_sortie_reelle: sortieDate });
      setSortieModal(null);
      setMsg({ type: "ok", text: "Sortie enregistrée — lit libéré" });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const onBedClick = (bed) => {
    if (isBedOccupied(bed)) {
      const hospi = bedsOccupes[`${bed.chambre}-${bed.lit}`];
      setSortieModal(hospi);
      setSortieDate("");
    } else {
      setSelectedBed(bed);
      setForm({ ...emptyForm, chambre: bed.chambre, lit: bed.lit, date_entree: new Date().toISOString().slice(0, 16) });
      setShowForm(true);
    }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" };
  const btn = (bg, col) => ({ background: bg, color: col, border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" });

  const displayed = filtre === "tous" ? list : list.filter(h => h.statut === filtre);
  const servicesAffiches = serviceFiltre === "tous" ? SERVICES : SERVICES.filter(s => s.code === serviceFiltre);

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Gestion des hospitalisations
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>
        {stats.enCours} patients hospitalisés · {stats.libres} lits disponibles sur {stats.total}
      </div>

      {msg && (
        <div style={{ background: msg.type === "ok" ? "#e6f7f2" : "#fdeaea", color: msg.type === "ok" ? "#0f6e56" : "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {[
          ["Lits totaux", stats.total, "#0a5c8a"],
          ["Lits occupés", stats.occupes, "#c0392b"],
          ["Lits libres", stats.libres, "#0f6e56"],
          ["Taux d'occupation", stats.taux + "%", "#7c3aed"],
        ].map(([lbl, val, col]) => (
          <div key={lbl} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: col, fontFamily: "'Playfair Display',serif", marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Toggle vue */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "#fff", border: "1px solid #e8edf2", borderRadius: 8, padding: 3 }}>
          {[
            ["liste", "📋 Liste"],
            ["chambres", "🛏 Plan des chambres"],
          ].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "#1a2332" : "transparent",
                color: view === v ? "#fff" : "#4a6070",
                border: "none", padding: "7px 14px", borderRadius: 6,
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        {view === "liste" && (
          <select style={{ ...inp, width: "auto" }} value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option value="tous">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="sortie">Sortie</option>
            <option value="transfere">Transféré</option>
          </select>
        )}
        {view === "chambres" && (
          <select style={{ ...inp, width: "auto" }} value={serviceFiltre} onChange={e => setServiceFiltre(e.target.value)}>
            <option value="tous">Tous les services</option>
            {SERVICES.map(s => <option key={s.code} value={s.code}>{s.nom}</option>)}
          </select>
        )}
        <div style={{ flex: 1 }}></div>
        <button style={btn("#1a2332", "#fff")} onClick={() => { setForm(emptyForm); setSelectedBed(null); setShowForm(!showForm); }}>
          + Nouvelle hospitalisation
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 12 }}>
            Nouvelle hospitalisation
            {selectedBed && (
              <span style={{ marginLeft: 10, fontSize: 12, color: selectedBed.color, fontWeight: 600 }}>
                · {selectedBed.serviceNom} · Chambre {selectedBed.chambre} · {selectedBed.lit}
              </span>
            )}
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
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Médecin responsable *</label>
              <select style={inp} value={form.medecin_id} onChange={e => setForm({ ...form, medecin_id: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Chambre *</label>
              <input type="text" style={inp} placeholder="Ex: 204" value={form.chambre} onChange={e => setForm({ ...form, chambre: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Lit</label>
              <input type="text" style={inp} placeholder="Ex: Lit 2" value={form.lit} onChange={e => setForm({ ...form, lit: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date d'entrée *</label>
              <input type="datetime-local" style={inp} value={form.date_entree} onChange={e => setForm({ ...form, date_entree: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date de sortie prévue</label>
              <input type="datetime-local" style={inp} value={form.date_sortie_prevue} onChange={e => setForm({ ...form, date_sortie_prevue: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Motif d'hospitalisation</label>
              <input type="text" style={inp} value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btn("#1a2332", "#fff")} onClick={save}>Enregistrer</button>
            <button style={btn("#f0f4f8", "#1a2332")} onClick={() => { setShowForm(false); setSelectedBed(null); }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Sortie modal */}
      {sortieModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 420 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 8 }}>Enregistrer la sortie du patient</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary, #4a6070)", marginBottom: 8 }}>
              <strong>{sortieModal.patient?.nom} {sortieModal.patient?.prenom}</strong>
            </div>
            <div style={{ fontSize: 12, color: "#7a90a0", marginBottom: 16 }}>
              Chambre {sortieModal.chambre} · {sortieModal.lit} · entrée le {sortieModal.date_entree ? new Date(sortieModal.date_entree).toLocaleDateString("fr-FR") : "—"}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #4a6070)", display: "block", marginBottom: 4 }}>Date de sortie réelle *</label>
              <input type="datetime-local" style={inp} value={sortieDate} onChange={e => setSortieDate(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn("#0f6e56", "#fff")} onClick={doSortie}>Confirmer la sortie</button>
              <button style={btn("#f0f4f8", "#1a2332")} onClick={() => setSortieModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Vue Plan des chambres */}
      {view === "chambres" && (
        <div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#7a90a0", marginBottom: 12, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span>Légende :</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 14, background: "#e6f7f2", border: "1px solid #0f6e56", borderRadius: 3 }}></span> Libre (cliquez pour attribuer)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 14, background: "#fdeaea", border: "1px solid #c0392b", borderRadius: 3 }}></span> Occupé (cliquez pour sortie)
              </span>
            </div>
          </div>

          {servicesAffiches.map(service => (
            <div key={service.code} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 4, height: 22, background: service.color, borderRadius: 2 }}></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>{service.nom}</div>
                <div style={{ fontSize: 11, color: "#7a90a0" }}>
                  {service.rooms.length} chambres · {service.rooms.length * service.litsParRoom} lits
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {service.rooms.map(room => {
                  return (
                    <div key={room} style={{ background: "#fafbfc", border: "1px solid #f0f4f8", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary, #4a6070)", marginBottom: 8, letterSpacing: 0.5 }}>
                        CHAMBRE {room}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {Array.from({ length: service.litsParRoom }).map((_, i) => {
                          const bed = { service: service.code, serviceNom: service.nom, color: service.color, chambre: room, lit: `Lit ${i + 1}` };
                          const occupied = isBedOccupied(bed);
                          const hospi = occupied ? bedsOccupes[`${room}-Lit ${i + 1}`] : null;
                          return (
                            <button
                              key={i}
                              onClick={() => onBedClick(bed)}
                              style={{
                                background: occupied ? "#fdeaea" : "#e6f7f2",
                                border: occupied ? "1px solid #c0392b" : "1px solid #0f6e56",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                textAlign: "left",
                                color: occupied ? "#c0392b" : "#0f6e56",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              title={hospi ? `${hospi.patient?.nom} ${hospi.patient?.prenom} · ${hospi.motif || ""}` : "Cliquer pour attribuer"}
                            >
                              <span style={{ fontSize: 13 }}>{occupied ? "🛏" : "✓"}</span>
                              <span style={{ flex: 1 }}>Lit {i + 1}</span>
                              {hospi && (
                                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 70 }}>
                                  {hospi.patient?.nom}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {view === "liste" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden" }}>
          {loading ? <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc" }}>
                {["Patient", "Médecin", "Chambre / Lit", "Entrée", "Sortie prévue", "Motif", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#7a90a0", textTransform: "uppercase", borderBottom: "1px solid #f0f4f8" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#7a90a0" }}>Aucune hospitalisation</td></tr>
                ) : displayed.map(h => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{h.patient ? `${h.patient.nom} ${h.patient.prenom}` : "—"}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)" }}>Dr. {h.medecin?.nom || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#0a5c8a", fontWeight: 600 }}>{h.chambre || "—"} {h.lit ? `/ ${h.lit}` : ""}</td>
                    <td style={{ padding: "10px 14px", color: "#7a90a0" }}>{h.date_entree ? new Date(h.date_entree).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#7a90a0" }}>{h.date_sortie_prevue ? new Date(h.date_sortie_prevue).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary, #4a6070)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.motif || "—"}</td>
                    <td style={{ padding: "10px 14px" }}><Badge s={h.statut} /></td>
                    <td style={{ padding: "10px 14px" }}>
                      {h.statut === "en_cours" && (
                        <button onClick={() => { setSortieModal(h); setSortieDate(new Date().toISOString().slice(0, 16)); }} style={{ background: "#e6f7f2", color: "#0f6e56", border: "none", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Sortie
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
