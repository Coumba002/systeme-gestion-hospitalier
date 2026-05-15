import React, { useState, useEffect } from "react";
import { getHospitalisations, createHospitalisation, enregistrerSortie, getPatients, getMedecins } from "../api";

const STATUTS = { en_cours:["#eef6fb","#0a5c8a","En cours"], sortie:["#f0f4f8","#7a90a0","Sortie"], transfere:["#fef3e2","#854f0b","Transféré"] };

function Badge({ s }) {
  const [bg,col,lbl] = STATUTS[s] || ["#f0f4f8","#7a90a0",s];
  return <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>{lbl}</span>;
}

export default function AdminHospitalisations() {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sortieModal, setSortieModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filtre, setFiltre] = useState("tous");
  const [form, setForm] = useState({ patient_id:"", medecin_id:"", chambre:"", lit:"", date_entree:"", date_sortie_prevue:"", motif:"", notes:"", statut:"en_cours" });
  const [sortieDate, setSortieDate] = useState("");

  const load = async () => {
    try {
      const [h, p, m] = await Promise.all([getHospitalisations(), getPatients(), getMedecins()]);
      setList(Array.isArray(h)?h:h.data||[]);
      setPatients(Array.isArray(p)?p:p.data||[]);
      setMedecins(Array.isArray(m)?m:m.data||[]);
    } catch(e) { setMsg({type:"err",text:e.message}); }
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const save = async () => {
    try {
      await createHospitalisation(form);
      setShowForm(false); setMsg({type:"ok",text:"Hospitalisation enregistrée"}); load();
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const doSortie = async () => {
    if (!sortieDate) return;
    try {
      await enregistrerSortie(sortieModal.id, { date_sortie_reelle: sortieDate });
      setSortieModal(null); setMsg({type:"ok",text:"Sortie enregistrée"}); load();
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const inp = {padding:"9px 12px",border:"1px solid #e8edf2",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"};
  const btn = (bg,col) => ({background:bg,color:col,border:"none",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"});
  const displayed = filtre==="tous" ? list : list.filter(h=>h.statut===filtre);

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>Gestion des hospitalisations</div>
      <div style={{fontSize:13,color:"#7a90a0",marginBottom:20}}>{list.filter(h=>h.statut==="en_cours").length} patients actuellement hospitalisés</div>

      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:16,fontSize:13}}>{msg.text}</div>}

      {/* Sortie modal */}
      {sortieModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:28,width:380}}>
            <div style={{fontSize:16,fontWeight:700,color:"#0d1f2d",marginBottom:16}}>Enregistrer la sortie</div>
            <div style={{fontSize:13,color:"#4a6070",marginBottom:16}}>Patient : <strong>{sortieModal.patient?.nom} {sortieModal.patient?.prenom}</strong></div>
            <div style={{marginBottom:16}}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date de sortie réelle</label>
              <input type="datetime-local" style={inp} value={sortieDate} onChange={e=>setSortieDate(e.target.value)}/></div>
            <div style={{display:"flex",gap:10}}>
              <button style={btn("#1a2332","#fff")} onClick={doSortie}>Confirmer la sortie</button>
              <button style={btn("#f0f4f8","#1a2332")} onClick={()=>setSortieModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
        <select style={{...inp,width:"auto"}} value={filtre} onChange={e=>setFiltre(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          <option value="en_cours">En cours</option>
          <option value="sortie">Sortie</option>
          <option value="transfere">Transféré</option>
        </select>
        <button style={btn("#1a2332","#fff")} onClick={()=>setShowForm(!showForm)}>+ Nouvelle hospitalisation</button>
      </div>

      {showForm && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#0d1f2d",marginBottom:16}}>Nouvelle hospitalisation</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Patient</label>
              <select style={inp} value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Médecin responsable</label>
              <select style={inp} value={form.medecin_id} onChange={e=>setForm({...form,medecin_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {medecins.map(m=><option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Chambre</label>
              <input type="text" style={inp} placeholder="Ex: 204-A" value={form.chambre} onChange={e=>setForm({...form,chambre:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Lit</label>
              <input type="text" style={inp} placeholder="Ex: Lit 2" value={form.lit} onChange={e=>setForm({...form,lit:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date d'entrée</label>
              <input type="datetime-local" style={inp} value={form.date_entree} onChange={e=>setForm({...form,date_entree:e.target.value})}/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Date de sortie prévue</label>
              <input type="datetime-local" style={inp} value={form.date_sortie_prevue} onChange={e=>setForm({...form,date_sortie_prevue:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>Motif d'hospitalisation</label>
              <input type="text" style={inp} value={form.motif} onChange={e=>setForm({...form,motif:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={btn("#1a2332","#fff")} onClick={save}>Enregistrer</button>
            <button style={btn("#f0f4f8","#1a2332")} onClick={()=>setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",overflow:"hidden"}}>
        {loading ? <div style={{padding:40,textAlign:"center",color:"#7a90a0"}}>Chargement...</div> : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["Patient","Médecin","Chambre / Lit","Entrée","Sortie prévue","Statut","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase",borderBottom:"1px solid #f0f4f8"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {displayed.length===0 ? (
                <tr><td colSpan={7} style={{padding:32,textAlign:"center",color:"#7a90a0"}}>Aucune hospitalisation</td></tr>
              ) : displayed.map(h=>(
                <tr key={h.id} style={{borderBottom:"1px solid #f0f4f8"}}>
                  <td style={{padding:"10px 14px",fontWeight:600}}>{h.patient?`${h.patient.nom} ${h.patient.prenom}`:"—"}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>Dr. {h.medecin?.nom||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#0a5c8a",fontWeight:600}}>{h.chambre||"—"} {h.lit?`/ ${h.lit}`:""}</td>
                  <td style={{padding:"10px 14px",color:"#7a90a0"}}>{h.date_entree?new Date(h.date_entree).toLocaleDateString("fr-FR"):"—"}</td>
                  <td style={{padding:"10px 14px",color:"#7a90a0"}}>{h.date_sortie_prevue?new Date(h.date_sortie_prevue).toLocaleDateString("fr-FR"):"—"}</td>
                  <td style={{padding:"10px 14px"}}><Badge s={h.statut}/></td>
                  <td style={{padding:"10px 14px"}}>
                    {h.statut==="en_cours" && (
                      <button onClick={()=>{setSortieModal(h);setSortieDate("");}} style={{background:"#e6f7f2",color:"#0f6e56",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Enregistrer sortie</button>
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
