import React, { useState, useEffect } from "react";
import { getConsultations, createConsultation, updateConsultation, getPatients } from "../api";

const STATUTS = { planifiee:["#fef3e2","#854f0b","Planifiée"], realisee:["#e6f7f2","#0f6e56","Réalisée"], annulee:["#fdeaea","#c0392b","Annulée"] };
function Badge({s}) { const [bg,col,lbl]=STATUTS[s]||["#f0f4f8","#7a90a0",s]; return <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>{lbl}</span>; }

export default function MedecinConsultations({ medecinId }) {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ patient_id:"", medecin_id: medecinId||"", date_consultation:"", motif:"", diagnostic:"", notes:"", statut:"planifiee" });

  const load = async () => {
    try {
      const params = medecinId ? { medecin_id: medecinId } : {};
      const [c, p] = await Promise.all([getConsultations(params), getPatients()]);
      setList(Array.isArray(c)?c:c.data||[]);
      setPatients(Array.isArray(p)?p:p.data||[]);
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };
  useEffect(()=>{load();},[]);

  const save = async () => {
    try {
      const payload = { ...form, medecin_id: medecinId||form.medecin_id };
      if (editItem) await updateConsultation(editItem.id, payload);
      else await createConsultation(payload);
      setShowForm(false); setMsg({type:"ok",text:editItem?"Consultation modifiée":"Consultation créée"}); load();
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const inp = {padding:"9px 12px",border:"1px solid #e8edf2",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"};
  const btnP = {background:"#0a5c8a",color:"#fff",border:"none",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};
  const btnS = {background:"#fff",color:"#0a5c8a",border:"1px solid #0a5c8a",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>Mes consultations</div>
      <div style={{fontSize:13,color:"#7a90a0",marginBottom:20}}>{list.length} consultations enregistrées</div>
      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:16,fontSize:13}}>{msg.text}</div>}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button style={btnP} onClick={()=>{setEditItem(null);setForm({patient_id:"",medecin_id:medecinId||"",date_consultation:"",motif:"",diagnostic:"",notes:"",statut:"planifiee"});setShowForm(true);}}>+ Nouvelle consultation</button>
      </div>
      {showForm && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#0d1f2d",marginBottom:16}}>{editItem?"Modifier":"Nouvelle consultation"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Patient</label>
              <select style={inp} value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>{patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date</label>
              <input type="datetime-local" style={inp} value={form.date_consultation} onChange={e=>setForm({...form,date_consultation:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Motif</label>
              <input type="text" style={inp} value={form.motif} onChange={e=>setForm({...form,motif:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Statut</label>
              <select style={inp} value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                <option value="planifiee">Planifiée</option><option value="realisee">Réalisée</option><option value="annulee">Annulée</option>
              </select></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Diagnostic</label>
              <input type="text" style={inp} value={form.diagnostic} onChange={e=>setForm({...form,diagnostic:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Notes</label>
              <textarea style={{...inp,resize:"vertical"}} rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={btnP} onClick={save}>Enregistrer</button>
            <button style={btnS} onClick={()=>setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#f8fafc"}}>{["Date","Patient","Motif","Diagnostic","Statut","Actions"].map(h=>(
            <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase",borderBottom:"1px solid #f0f4f8"}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {list.length===0 ? <tr><td colSpan={6} style={{padding:32,textAlign:"center",color:"#7a90a0"}}>Aucune consultation</td></tr>
            : list.map(c=>(
              <tr key={c.id} style={{borderBottom:"1px solid #f0f4f8"}}>
                <td style={{padding:"10px 14px",color:"#7a90a0"}}>{c.date_consultation?new Date(c.date_consultation).toLocaleDateString("fr-FR"):"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:600}}>{c.patient?`${c.patient.nom} ${c.patient.prenom}`:"—"}</td>
                <td style={{padding:"10px 14px",color:"#4a6070"}}>{c.motif||"—"}</td>
                <td style={{padding:"10px 14px",color:"#4a6070"}}>{c.diagnostic||"—"}</td>
                <td style={{padding:"10px 14px"}}><Badge s={c.statut}/></td>
                <td style={{padding:"10px 14px"}}>
                  <button onClick={()=>{setEditItem(c);setForm({patient_id:c.patient_id,medecin_id:c.medecin_id,date_consultation:c.date_consultation?.slice(0,16)||"",motif:c.motif||"",diagnostic:c.diagnostic||"",notes:c.notes||"",statut:c.statut});setShowForm(true);}} style={{background:"#eef6fb",color:"#0a5c8a",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
