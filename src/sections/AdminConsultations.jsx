import React, { useState, useEffect } from "react";
import { getConsultations, createConsultation, updateConsultation, deleteConsultation, getPatients, getMedecins } from "../api";

const STATUTS = { planifiee: ["#fef3e2","#854f0b","Planifiée"], realisee: ["#e6f7f2","#0f6e56","Réalisée"], annulee: ["#fdeaea","#c0392b","Annulée"] };

function Badge({ s }) {
  const [bg, col, lbl] = STATUTS[s] || ["#f0f4f8","#7a90a0", s];
  return <span style={{background:bg, color:col, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5}}>{lbl}</span>;
}

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ patient_id:"", medecin_id:"", date_consultation:"", motif:"", diagnostic:"", notes:"", statut:"planifiee" });

  const load = async () => {
    try {
      const [c, p, m] = await Promise.all([getConsultations(), getPatients(), getMedecins()]);
      setConsultations(Array.isArray(c) ? c : c.data || []);
      setPatients(Array.isArray(p) ? p : p.data || []);
      setMedecins(Array.isArray(m) ? m : m.data || []);
    } catch(e) { setMsg({type:"err", text:e.message}); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ patient_id:"", medecin_id:"", date_consultation:"", motif:"", diagnostic:"", notes:"", statut:"planifiee" }); setShowForm(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ patient_id:c.patient_id, medecin_id:c.medecin_id, date_consultation:c.date_consultation?.slice(0,16)||"", motif:c.motif||"", diagnostic:c.diagnostic||"", notes:c.notes||"", statut:c.statut }); setShowForm(true); };

  const save = async () => {
    try {
      if (editItem) await updateConsultation(editItem.id, form);
      else await createConsultation(form);
      setShowForm(false); setMsg({type:"ok", text: editItem ? "Consultation modifiée" : "Consultation créée"});
      load();
    } catch(e) { setMsg({type:"err", text:e.message}); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette consultation ?")) return;
    try { await deleteConsultation(id); load(); setMsg({type:"ok", text:"Consultation supprimée"}); }
    catch(e) { setMsg({type:"err", text:e.message}); }
  };

  const inp = {padding:"9px 12px", border:"1px solid #e8edf2", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%"};
  const btn = (bg,col) => ({background:bg, color:col, border:"none", padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit"});

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#0d1f2d", marginBottom:4}}>Gestion des consultations</div>
      <div style={{fontSize:13, color:"#7a90a0", marginBottom:20}}>{consultations.length} consultations enregistrées</div>

      {msg && <div style={{background: msg.type==="ok" ? "#e6f7f2":"#fdeaea", color: msg.type==="ok"?"#0f6e56":"#c0392b", padding:"10px 16px", borderRadius:8, marginBottom:16, fontSize:13}}>{msg.text}</div>}

      <div style={{display:"flex", gap:10, marginBottom:16}}>
        <button style={btn("#1a2332","#fff")} onClick={openCreate}>+ Nouvelle consultation</button>
      </div>

      {showForm && (
        <div style={{background:"#fff", borderRadius:12, border:"1px solid #e8edf2", padding:20, marginBottom:20}}>
          <div style={{fontSize:14, fontWeight:700, color:"#0d1f2d", marginBottom:16}}>{editItem ? "Modifier la consultation" : "Nouvelle consultation"}</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Patient</label>
              <select style={inp} value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Médecin</label>
              <select style={inp} value={form.medecin_id} onChange={e=>setForm({...form,medecin_id:e.target.value})}>
                <option value="">-- Sélectionner --</option>
                {medecins.map(m=><option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>)}
              </select></div>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Date</label>
              <input type="datetime-local" style={inp} value={form.date_consultation} onChange={e=>setForm({...form,date_consultation:e.target.value})}/></div>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Statut</label>
              <select style={inp} value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                <option value="planifiee">Planifiée</option><option value="realisee">Réalisée</option><option value="annulee">Annulée</option>
              </select></div>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Motif</label>
              <input type="text" style={inp} placeholder="Motif de la consultation" value={form.motif} onChange={e=>setForm({...form,motif:e.target.value})}/></div>
            <div><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Diagnostic</label>
              <input type="text" style={inp} placeholder="Diagnostic" value={form.diagnostic} onChange={e=>setForm({...form,diagnostic:e.target.value})}/></div>
          </div>
          <div style={{marginBottom:12}}><label style={{fontSize:11, fontWeight:600, color:"#4a6070", display:"block", marginBottom:4}}>Notes</label>
            <textarea style={{...inp, resize:"vertical"}} rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes complémentaires..."/></div>
          <div style={{display:"flex", gap:10}}>
            <button style={btn("#1a2332","#fff")} onClick={save}>Enregistrer</button>
            <button style={btn("#f0f4f8","#1a2332")} onClick={()=>setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{background:"#fff", borderRadius:12, border:"1px solid #e8edf2", overflow:"hidden"}}>
        {loading ? <div style={{padding:40, textAlign:"center", color:"#7a90a0"}}>Chargement...</div> : (
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["Date","Patient","Médecin","Motif","Diagnostic","Statut","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:600, color:"#7a90a0", textTransform:"uppercase", borderBottom:"1px solid #f0f4f8"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr><td colSpan={7} style={{padding:32, textAlign:"center", color:"#7a90a0"}}>Aucune consultation enregistrée</td></tr>
              ) : consultations.map(c=>(
                <tr key={c.id} style={{borderBottom:"1px solid #f0f4f8"}}>
                  <td style={{padding:"10px 14px", color:"#7a90a0"}}>{c.date_consultation ? new Date(c.date_consultation).toLocaleDateString("fr-FR") : "—"}</td>
                  <td style={{padding:"10px 14px", fontWeight:600}}>{c.patient ? `${c.patient.nom} ${c.patient.prenom}` : "—"}</td>
                  <td style={{padding:"10px 14px", color:"#4a6070"}}>Dr. {c.medecin ? `${c.medecin.nom}` : "—"}</td>
                  <td style={{padding:"10px 14px", color:"#4a6070"}}>{c.motif || "—"}</td>
                  <td style={{padding:"10px 14px", color:"#4a6070"}}>{c.diagnostic || "—"}</td>
                  <td style={{padding:"10px 14px"}}><Badge s={c.statut}/></td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex", gap:6}}>
                      <button onClick={()=>openEdit(c)} style={{background:"#eef6fb",color:"#0a5c8a",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Modifier</button>
                      <button onClick={()=>remove(c.id)} style={{background:"#fdeaea",color:"#c0392b",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Supprimer</button>
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
