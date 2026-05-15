import React, { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "../api";

const ROLES = { admin:"Admin", medecin:"Médecin", infirmier:"Infirmier", patient:"Patient" };
const ROLE_COLORS = { admin:["#f3efff","#7c3aed"], medecin:["#eef6fb","#0a5c8a"], infirmier:["#e6f7f2","#0f6e56"], patient:["#fef3e2","#854f0b"] };

function RoleBadge({role}) {
  const [bg,col]=ROLE_COLORS[role]||["#f0f4f8","#7a90a0"];
  return <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>{ROLES[role]||role}</span>;
}

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [filtreRole, setFiltreRole] = useState("tous");

  const load = async () => {
    try { const d = await getUsers(); setUsers(Array.isArray(d)?d:d.data||[]); }
    catch(e) { setMsg({type:"err",text:e.message}); }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const toggleStatut = async (u) => {
    const newStatut = u.statut==="actif"?"inactif":"actif";
    try { await updateUser(u.id, {statut: newStatut}); load(); setMsg({type:"ok",text:`Compte ${newStatut==="actif"?"activé":"désactivé"}`}); }
    catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const remove = async (id) => {
    if(!window.confirm("Supprimer cet utilisateur ?")) return;
    try { await deleteUser(id); load(); setMsg({type:"ok",text:"Utilisateur supprimé"}); }
    catch(e) { setMsg({type:"err",text:e.message}); }
  };

  const displayed = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filtreRole==="tous" || u.role===filtreRole;
    return matchSearch && matchRole;
  });

  const inp = {padding:"9px 12px",border:"1px solid #e8edf2",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none"};

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0d1f2d",marginBottom:4}}>Gestion des utilisateurs</div>
      <div style={{fontSize:13,color:"#7a90a0",marginBottom:20}}>{users.length} comptes · {users.filter(u=>u.statut==="actif").length} actifs</div>

      {/* Stats par rôle */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {Object.entries(ROLES).map(([key,lbl])=>{
          const count=users.filter(u=>u.role===key).length;
          const [bg,col]=ROLE_COLORS[key]||["#f0f4f8","#7a90a0"];
          return (
            <div key={key} style={{background:bg,borderRadius:10,padding:16,cursor:"pointer"}} onClick={()=>setFiltreRole(filtreRole===key?"tous":key)}>
              <div style={{fontSize:11,fontWeight:600,color:col,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{lbl}s</div>
              <div style={{fontSize:28,fontWeight:700,color:col,fontFamily:"'Playfair Display',serif"}}>{count}</div>
            </div>
          );
        })}
      </div>

      {msg && <div style={{background:msg.type==="ok"?"#e6f7f2":"#fdeaea",color:msg.type==="ok"?"#0f6e56":"#c0392b",padding:"10px 16px",borderRadius:8,marginBottom:16,fontSize:13}}>{msg.text}</div>}

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <input type="text" style={{...inp,flex:1}} placeholder="Rechercher par nom, prénom ou email..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={inp} value={filtreRole} onChange={e=>setFiltreRole(e.target.value)}>
          <option value="tous">Tous les rôles</option>
          {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8edf2",overflow:"hidden"}}>
        {loading ? <div style={{padding:40,textAlign:"center",color:"#7a90a0"}}>Chargement...</div> : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["Utilisateur","Email","Téléphone","Rôle","Statut","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:600,color:"#7a90a0",textTransform:"uppercase",borderBottom:"1px solid #f0f4f8"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {displayed.length===0 ? (
                <tr><td colSpan={6} style={{padding:32,textAlign:"center",color:"#7a90a0"}}>Aucun utilisateur trouvé</td></tr>
              ) : displayed.map(u=>(
                <tr key={u.id} style={{borderBottom:"1px solid #f0f4f8",opacity:u.statut==="inactif"?0.6:1}}>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:"#1a2332",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                        {(u.nom||"?")[0]}{(u.prenom||"?")[0]}
                      </div>
                      <span style={{fontWeight:600}}>{u.nom} {u.prenom}</span>
                    </div>
                  </td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{u.email}</td>
                  <td style={{padding:"10px 14px",color:"#4a6070"}}>{u.telephone||"—"}</td>
                  <td style={{padding:"10px 14px"}}><RoleBadge role={u.role}/></td>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{background:u.statut==="actif"?"#e6f7f2":"#f0f4f8",color:u.statut==="actif"?"#0f6e56":"#7a90a0",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5}}>
                      {u.statut==="actif"?"Actif":"Inactif"}
                    </span>
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>toggleStatut(u)} style={{background:u.statut==="actif"?"#fdeaea":"#e6f7f2",color:u.statut==="actif"?"#c0392b":"#0f6e56",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                        {u.statut==="actif"?"Désactiver":"Activer"}
                      </button>
                      {u.role==="patient" && (
                        <button onClick={()=>remove(u.id)} style={{background:"#fdeaea",color:"#c0392b",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Supprimer</button>
                      )}
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
