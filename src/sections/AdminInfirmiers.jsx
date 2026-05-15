import React, { useState, useEffect } from "react";
import { getInfirmiers, createInfirmier, updateInfirmier, deleteInfirmier } from "../api";

export default function AdminInfirmiers() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [compteInfo, setCompteInfo] = useState(null);
  const [form, setForm] = useState({ nom:"", prenom:"", service:"", telephone:"", email:"", numero_badge:"", email_compte:"", password:"" });

  const load = async () => {
    try { const d = await getInfirmiers(); setList(Array.isArray(d)?d:d.data||[]); }
    catch(e) { setMsg({type:"err",text:e.message}); }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const openCreate = () => { setEditItem(null); setForm({nom:"",prenom:"",service:"",telephone:"",email:"",numero_badge:"",email_compte:"",password:""}); setShowForm(true); };
  const openEdit = (i) => { setEditItem(i); setForm({nom:i.nom,prenom:i.prenom,service:i.service||"",telephone:i.telephone||"",email:i.email||"",numero_badge:i.numero_badge||"",email_compte:"",password:""}); setShowForm(true); };

  const save = async () => {
    try {
      let res;
      if (editItem) { res = await updateInfirmier(editItem.id, form); setMsg({type:"ok",text:"Infirmier(ère) modifié(e)"}); }
      else { res = await createInfirmier(form); if(res.compte_genere) setCompteInfo(res.compte_genere); setMsg({type:"ok",text:"Infirmier(ère) créé(e)"}); }
      setShowForm(false); load();
    } catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const remove = async (id) => {
    if(!window.confirm("Supprimer cet infirmier ?")) return;
    try { await deleteInfirmier(id); load(); setMsg({type:"ok",text:"Infirmier(ère) supprimé(e)"}); }
    catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const inp = {padding:"9px 12px",border:"1px solid #e8edf2",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"};
  const btn = (bg,col)=>({background:bg,color:col,border:"none",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"});

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>Gestion des infirmiers</div>
      <div style={{fontSize:13,color:"#7a90a0",marginBottom:20}}>{list.length} infirmiers enregistrés</div>

      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:12,fontSize:13}}>{msg.text}</div>}

      {compteInfo && (
        <div style={{background:"#fff9e6",border:"1px solid #f0c040",borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#854f0b",marginBottom:8}}>⚠️ Identifiants du compte créé — à communiquer à l'infirmier(ère)</div>
          <div style={{fontSize:13,color:"#1a2332"}}>Email : <strong>{compteInfo.email}</strong></div>
          <div style={{fontSize:13,color:"#1a2332"}}>Mot de passe : <strong style={{fontFamily:"monospace"}}>{compteInfo.password}</strong></div>
          <button style={{...btn("#854f0b","#fff"),marginTop:10,padding:"6px 14px",fontSize:11}} onClick={()=>setCompteInfo(null)}>J'ai noté les identifiants ✓</button>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button style={btn("#1a2332","#fff")} onClick={openCreate}>+ Ajouter un infirmier</button>
      </div>

      {showForm && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>{editItem?"Modifier l'infirmier(ère)":"Nouvel infirmier(ère)"}</div>
          {!editItem && <div style={{fontSize:12,color:"#7a90a0",marginBottom:16}}>Un compte de connexion sera créé automatiquement avec l'email renseigné.</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {[["Nom","nom","text"],["Prénom","prenom","text"],["Service","service","text"],["Téléphone","telephone","tel"],["Email professionnel","email","email"],["N° Badge","numero_badge","text"]].map(([lbl,key,type])=>(
              <div key={key}><label style={{fontSize:11,fontWeight:600,color:"#4a6070",display:"block",marginBottom:4}}>{lbl}</label>
                <input type={type} style={inp} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>
            ))}
            {!editItem && <>
              <div><label style={{fontSize:11,fontWeight:600,color:"#0a5c8a",display:"block",marginBottom:4}}>Email du compte (connexion)</label>
                <input type="email" style={{...inp,borderColor:"#0a5c8a"}} value={form.email_compte} onChange={e=>setForm({...form,email_compte:e.target.value})} placeholder="Laissez vide pour utiliser l'email pro"/></div>
              <div><label style={{fontSize:11,fontWeight:600,color:"#0a5c8a",display:"block",marginBottom:4}}>Mot de passe (optionnel)</label>
                <input type="text" style={{...inp,borderColor:"#0a5c8a"}} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Laissez vide pour générer automatiquement"/></div>
            </>}
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
              {["Infirmier(ère)","Service","Téléphone","Email","N° Badge","Compte","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase",borderBottom:"1px solid #f0f4f8"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.length===0 ? (
                <tr><td colSpan={7} style={{padding:32,textAlign:"center",color:"#7a90a0"}}>Aucun infirmier enregistré</td></tr>
              ) : list.map(i=>(
                <tr key={i.id} style={{borderBottom:"1px solid #f0f4f8"}}>
                  <td style={{padding:"10px 14px",fontWeight:600}}>{i.nom} {i.prenom}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{i.service||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{i.telephone||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{i.email||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{i.numero_badge||"—"}</td>
                  <td style={{padding:"10px 14px"}}>
                    {i.user ? <span style={{background:"#e6f7f2",color:"#0f6e56",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>✓ Actif</span>
                      : <span style={{background:"#f0f4f8",color:"#7a90a0",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>Sans compte</span>}
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>openEdit(i)} style={{background:"#eef6fb",color:"#0a5c8a",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Modifier</button>
                      <button onClick={()=>remove(i.id)} style={{background:"#fdeaea",color:"#c0392b",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Supprimer</button>
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
