import React, { useState, useEffect } from "react";
import { getFactures, createFacture, enregistrerPaiement, getPatients } from "../api";

const S_FACT = { en_attente:["#fef3e2","#854f0b","En attente"], payee:["#e6f7f2","#0f6e56","Payée"], partielle:["#eef6fb","#0a5c8a","Partielle"], annulee:["#fdeaea","#c0392b","Annulée"] };
const MODES = ["especes","carte","assurance","mobile","virement"];

function Badge({s}) {
  const [bg,col,lbl]=S_FACT[s]||["#f0f4f8","#7a90a0",s];
  return <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>{lbl}</span>;
}

export default function AdminFacturation() {
  const [factures, setFactures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [paiementModal, setPaiementModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ patient_id:"", montant_total:"", description:"", date_emission:new Date().toISOString().slice(0,10), date_echeance:"" });
  const [pForm, setPForm] = useState({ montant:"", mode:"especes", date_paiement:new Date().toISOString().slice(0,16), reference:"" });

  const load = async () => {
    try {
      const [f,p] = await Promise.all([getFactures(), getPatients()]);
      setFactures(Array.isArray(f)?f:f.data||[]);
      setPatients(Array.isArray(p)?p:p.data||[]);
    } catch(e) { setMsg({type:"err",text:e.message}); }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

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

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button style={btn("#1a2332","#fff")} onClick={()=>setShowForm(!showForm)}>+ Nouvelle facture</button>
      </div>

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
                  <td style={{padding:"10px 14px"}}>
                    {f.statut!=="payee" && f.statut!=="annulee" && (
                      <button onClick={()=>{setPaiementModal(f);setPForm({montant:"",mode:"especes",date_paiement:new Date().toISOString().slice(0,16),reference:""});}} style={{background:"#e6f7f2",color:"#0f6e56",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Payer</button>
                    )}
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
