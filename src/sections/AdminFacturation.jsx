import React, { useState, useEffect } from "react";
import { getFactures, createFacture, enregistrerPaiement, getPatients, getConsultations, getHospitalisations } from "../api";
import { printFacture } from "../utils/printPdf";

const S_FACT = { en_attente:["#fef3e2","#854f0b","En attente"], payee:["#e6f7f2","#0f6e56","Payée"], partielle:["#eef6fb","#0a5c8a","Partielle"], annulee:["#fdeaea","#c0392b","Annulée"] };
const MODES = ["especes","carte","assurance","mobile","virement"];

// Tarifs standards (F CFA) — adapter selon la grille tarifaire de l'établissement
const TARIFS = {
  consultation_generale: 15000,
  consultation_specialiste: 25000,
  hospitalisation_jour: 35000,
  hospitalisation_chir: 50000,
  hospitalisation_mat: 40000,
};

function Badge({s}) {
  const [bg,col,lbl]=S_FACT[s]||["#f0f4f8","#7a90a0",s];
  return <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>{lbl}</span>;
}

export default function AdminFacturation() {
  const [factures, setFactures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [hospitalisations, setHospitalisations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [paiementModal, setPaiementModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ patient_id:"", montant_total:"", description:"", date_emission:new Date().toISOString().slice(0,10), date_echeance:"" });
  const [pForm, setPForm] = useState({ montant:"", mode:"especes", date_paiement:new Date().toISOString().slice(0,16), reference:"" });

  // ─── Génération auto depuis prestations ──────────────────────────────────
  const [autoPatient, setAutoPatient] = useState("");
  const [selectedItems, setSelectedItems] = useState({}); // { "c-3": true, "h-5": true }

  const load = async () => {
    try {
      const [f, p, c, h] = await Promise.all([
        getFactures(), getPatients(),
        getConsultations(), getHospitalisations(),
      ]);
      setFactures(Array.isArray(f)?f:f.data||[]);
      setPatients(Array.isArray(p)?p:p.data||[]);
      setConsultations(Array.isArray(c)?c:c.data||[]);
      setHospitalisations(Array.isArray(h)?h:h.data||[]);
    } catch(e) { setMsg({type:"err",text:e.message}); }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  // Prestations du patient sélectionné non encore facturées
  const prestationsPatient = () => {
    if (!autoPatient) return { consultations: [], hospitalisations: [] };
    const pid = parseInt(autoPatient);
    return {
      consultations: consultations.filter(c => c.patient_id === pid && c.statut === "realisee"),
      hospitalisations: hospitalisations.filter(h => h.patient_id === pid && h.statut === "sortie"),
    };
  };

  const tarifConsultation = (c) => TARIFS.consultation_generale;
  const tarifHospitalisation = (h) => {
    const jours = h.date_entree && h.date_sortie_reelle
      ? Math.max(1, Math.ceil((new Date(h.date_sortie_reelle) - new Date(h.date_entree)) / (1000 * 60 * 60 * 24)))
      : 1;
    return jours * TARIFS.hospitalisation_jour;
  };

  const totalAuto = () => {
    const { consultations: cs, hospitalisations: hs } = prestationsPatient();
    let total = 0;
    cs.forEach(c => { if (selectedItems[`c-${c.id}`]) total += tarifConsultation(c); });
    hs.forEach(h => { if (selectedItems[`h-${h.id}`]) total += tarifHospitalisation(h); });
    return total;
  };

  const genererFacture = async () => {
    const total = totalAuto();
    if (total === 0) { setMsg({ type: "err", text: "Sélectionnez au moins une prestation" }); return; }
    const { consultations: cs, hospitalisations: hs } = prestationsPatient();
    const lignes = [];
    cs.forEach(c => {
      if (selectedItems[`c-${c.id}`]) {
        lignes.push(`Consultation du ${new Date(c.date_consultation).toLocaleDateString("fr-FR")} (${tarifConsultation(c).toLocaleString("fr-FR")} F)`);
      }
    });
    hs.forEach(h => {
      if (selectedItems[`h-${h.id}`]) {
        const jours = h.date_entree && h.date_sortie_reelle
          ? Math.max(1, Math.ceil((new Date(h.date_sortie_reelle) - new Date(h.date_entree)) / (1000 * 60 * 60 * 24)))
          : 1;
        lignes.push(`Hospitalisation ${jours} jour(s) Ch.${h.chambre} (${tarifHospitalisation(h).toLocaleString("fr-FR")} F)`);
      }
    });
    try {
      await createFacture({
        patient_id: parseInt(autoPatient),
        montant_total: total,
        description: lignes.join(" · "),
        date_emission: new Date().toISOString().slice(0, 10),
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
      setShowAuto(false); setSelectedItems({}); setAutoPatient("");
      setMsg({ type: "ok", text: `Facture générée : ${total.toLocaleString("fr-FR")} F CFA` });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
  };

  const save = async () => {
    try { await createFacture(form); setShowForm(false); setMsg({type:"ok",text:"Facture créée"}); load(); }
    catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const doPaiement = async () => {
    try { await enregistrerPaiement(paiementModal.id, pForm); setPaiementModal(null); setMsg({type:"ok",text:"Paiement enregistré"}); load(); }
    catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const inp = {padding:"9px 12px",border:"1px solid #e8edf2",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"};
  const btn = (bg,col)=>({background:bg,color:col,border:"none",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"});

  const totalCA = factures.reduce((s,f)=>s+parseFloat(f.montant_paye||0),0);
  const enAttente = factures.filter(f=>f.statut==="en_attente"||f.statut==="partielle").reduce((s,f)=>s+(parseFloat(f.montant_total||0)-parseFloat(f.montant_paye||0)),0);

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>Facturation & Paiements</div>
      <div style={{fontSize:13,color:"#7a90a0",marginBottom:20}}>{factures.length} factures · {factures.filter(f=>f.statut==="payee").length} payées</div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[
          {label:"Chiffre encaissé",val:`${totalCA.toLocaleString("fr-FR")} F CFA`,color:"#0f6e56",bg:"#e6f7f2"},
          {label:"Solde restant dû",val:`${enAttente.toLocaleString("fr-FR")} F CFA`,color:"#854f0b",bg:"#fef3e2"},
          {label:"Factures en attente",val:factures.filter(f=>f.statut==="en_attente").length,color:"#0a5c8a",bg:"#eef6fb"},
        ].map(k=>(
          <div key={k.label} style={{background:k.bg,borderRadius:12,padding:20}}>
            <div style={{fontSize:11,fontWeight:600,color:k.color,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.color,fontFamily:"'Playfair Display',serif"}}>{k.val}</div>
          </div>
        ))}
      </div>

      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:16,fontSize:13}}>{msg.text}</div>}

      {/* Modal paiement */}
      {paiementModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:28,width:400}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>Enregistrer un paiement</div>
            <div style={{fontSize:12,color:"#7a90a0",marginBottom:16}}>Facture #{paiementModal.id} · Restant: {(parseFloat(paiementModal.montant_total)-parseFloat(paiementModal.montant_paye)).toLocaleString("fr-FR")} F CFA</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Montant</label>
                <input type="number" style={inp} value={pForm.montant} onChange={e=>setPForm({...pForm,montant:e.target.value})}/></div>
              <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Mode</label>
                <select style={inp} value={pForm.mode} onChange={e=>setPForm({...pForm,mode:e.target.value})}>
                  {MODES.map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select></div>
              <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date</label>
                <input type="datetime-local" style={inp} value={pForm.date_paiement} onChange={e=>setPForm({...pForm,date_paiement:e.target.value})}/></div>
              <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Référence</label>
                <input type="text" style={inp} value={pForm.reference} onChange={e=>setPForm({...pForm,reference:e.target.value})}/></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={btn("#1a2332","#fff")} onClick={doPaiement}>Confirmer</button>
              <button style={btn("#f0f4f8","#1a2332")} onClick={()=>setPaiementModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <button style={btn("#0a5c8a","#fff")} onClick={()=>{ setShowAuto(true); setShowForm(false); }}>
          ⚡ Générer depuis prestations
        </button>
        <button style={btn("#1a2332","#fff")} onClick={()=>{ setShowForm(!showForm); setShowAuto(false); }}>+ Nouvelle facture manuelle</button>
      </div>

      {/* Modal génération auto */}
      {showAuto && (() => {
        const { consultations: cs, hospitalisations: hs } = prestationsPatient();
        const total = totalAuto();
        return (
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",padding:20,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,color:"#0d1f2d"}}>⚡ Générer une facture depuis les prestations</div>
              <button onClick={()=>{setShowAuto(false);setAutoPatient("");setSelectedItems({});}} style={{background:"transparent",border:"none",fontSize:18,color:"#7a90a0",cursor:"pointer"}}>×</button>
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Patient</label>
              <select style={inp} value={autoPatient} onChange={e=>{setAutoPatient(e.target.value);setSelectedItems({});}}>
                <option value="">-- Choisir un patient --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select>
            </div>

            {autoPatient && cs.length === 0 && hs.length === 0 && (
              <div style={{padding:20,textAlign:"center",color:"#7a90a0",fontSize:13,background:"#fafbfc",borderRadius:8}}>
                Aucune prestation facturable (consultations réalisées ou hospitalisations terminées) pour ce patient.
              </div>
            )}

            {autoPatient && cs.length > 0 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0a5c8a",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>
                  🩺 Consultations ({cs.length})
                </div>
                {cs.map(c=>(
                  <label key={`c-${c.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:selectedItems[`c-${c.id}`]?"#eef6fb":"#fafbfc",borderRadius:6,marginBottom:5,cursor:"pointer",border:"1px solid "+(selectedItems[`c-${c.id}`]?"#0a5c8a":"#f0f4f8")}}>
                    <input type="checkbox" checked={!!selectedItems[`c-${c.id}`]} onChange={e=>setSelectedItems({...selectedItems,[`c-${c.id}`]:e.target.checked})}/>
                    <div style={{flex:1,fontSize:12}}>
                      <div style={{fontWeight:600,color:"#0d1f2d"}}>{c.date_consultation?new Date(c.date_consultation).toLocaleDateString("fr-FR"):"—"} · {c.motif||"Sans motif"}</div>
                      {c.diagnostic && <div style={{color:"#7a90a0",fontSize:11,marginTop:2}}>{c.diagnostic.slice(0,80)}{c.diagnostic.length>80?"…":""}</div>}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:"#0a5c8a"}}>{tarifConsultation(c).toLocaleString("fr-FR")} F</div>
                  </label>
                ))}
              </div>
            )}

            {autoPatient && hs.length > 0 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7c3aed",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>
                  🏥 Hospitalisations ({hs.length})
                </div>
                {hs.map(h=>{
                  const jours = h.date_entree && h.date_sortie_reelle
                    ? Math.max(1, Math.ceil((new Date(h.date_sortie_reelle) - new Date(h.date_entree)) / (1000 * 60 * 60 * 24)))
                    : 1;
                  return (
                    <label key={`h-${h.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:selectedItems[`h-${h.id}`]?"#f3efff":"#fafbfc",borderRadius:6,marginBottom:5,cursor:"pointer",border:"1px solid "+(selectedItems[`h-${h.id}`]?"#7c3aed":"#f0f4f8")}}>
                      <input type="checkbox" checked={!!selectedItems[`h-${h.id}`]} onChange={e=>setSelectedItems({...selectedItems,[`h-${h.id}`]:e.target.checked})}/>
                      <div style={{flex:1,fontSize:12}}>
                        <div style={{fontWeight:600,color:"#0d1f2d"}}>Chambre {h.chambre} {h.lit?`· ${h.lit}`:""} · {jours} jour(s)</div>
                        <div style={{color:"#7a90a0",fontSize:11,marginTop:2}}>{h.motif||"Sans motif"} · {h.date_entree?new Date(h.date_entree).toLocaleDateString("fr-FR"):""} → {h.date_sortie_reelle?new Date(h.date_sortie_reelle).toLocaleDateString("fr-FR"):""}</div>
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:"#7c3aed"}}>{tarifHospitalisation(h).toLocaleString("fr-FR")} F</div>
                    </label>
                  );
                })}
              </div>
            )}

            {autoPatient && total > 0 && (
              <div style={{borderTop:"2px solid #f0f4f8",paddingTop:14,marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase"}}>Total facture</div>
                  <div style={{fontSize:24,fontWeight:700,color:"#0d1f2d",fontFamily:"'Playfair Display',serif"}}>{total.toLocaleString("fr-FR")} F CFA</div>
                </div>
                <button style={btn("#0f6e56","#fff")} onClick={genererFacture}>
                  Créer la facture
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {showForm && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#0d1f2d",marginBottom:16}}>Nouvelle facture</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Patient</label>
              <select style={inp} value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Montant total (F CFA)</label>
              <input type="number" style={inp} value={form.montant_total} onChange={e=>setForm({...form,montant_total:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date d'émission</label>
              <input type="date" style={inp} value={form.date_emission} onChange={e=>setForm({...form,date_emission:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date d'échéance</label>
              <input type="date" style={inp} value={form.date_echeance} onChange={e=>setForm({...form,date_echeance:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Description</label>
              <input type="text" style={inp} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={btn("#1a2332","#fff")} onClick={save}>Créer la facture</button>
            <button style={btn("#f0f4f8","#1a2332")} onClick={()=>setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",overflow:"hidden"}}>
        {loading ? <div style={{padding:40,textAlign:"center",color:"#7a90a0"}}>Chargement...</div> : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["#","Patient","Description","Total","Payé","Statut","Émission","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase",borderBottom:"1px solid #f0f4f8"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {factures.length===0 ? (
                <tr><td colSpan={8} style={{padding:32,textAlign:"center",color:"#7a90a0"}}>Aucune facture</td></tr>
              ) : factures.map(f=>(
                <tr key={f.id} style={{borderBottom:"1px solid #f0f4f8"}}>
                  <td style={{padding:"10px 14px",color:"#7a90a0",fontSize:11}}>#{f.id}</td>
                  <td style={{padding:"10px 14px",fontWeight:600}}>{f.patient?`${f.patient.nom} ${f.patient.prenom}`:"—"}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.description||"—"}</td>
                  <td style={{padding:"10px 14px",fontWeight:700,color:"#0d1f2d"}}>{parseFloat(f.montant_total).toLocaleString("fr-FR")} F</td>
                  <td style={{padding:"10px 14px",color:"#0f6e56",fontWeight:600}}>{parseFloat(f.montant_paye||0).toLocaleString("fr-FR")} F</td>
                  <td style={{padding:"10px 14px"}}><Badge s={f.statut}/></td>
                  <td style={{padding:"10px 14px",color:"#7a90a0"}}>{f.date_emission?new Date(f.date_emission).toLocaleDateString("fr-FR"):"—"}</td>
                  <td style={{padding:"10px 14px",display:"flex",gap:5}}>
                    {f.statut!=="payee" && f.statut!=="annulee" && (
                      <button onClick={()=>{setPaiementModal(f);setPForm({montant:"",mode:"especes",date_paiement:new Date().toISOString().slice(0,16),reference:""});}} style={{background:"#e6f7f2",color:"#0f6e56",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Payer</button>
                    )}
                    <button
                      onClick={() => printFacture({ facture: f, patient: f.patient })}
                      title="Imprimer / Exporter en PDF"
                      style={{background:"#eef6fb",color:"#0a5c8a",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}
                    >
                      🖨 PDF
                    </button>
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
