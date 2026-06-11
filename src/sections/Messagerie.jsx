import React, { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, getUsers, getUser } from "../api";

const ROLE_COLOR = {
  admin:     ["#1a2332", "#fff"],
  medecin:   ["#0a5c8a", "#fff"],
  infirmier: ["#0f6e56", "#fff"],
  patient:   ["#854f0b", "#fff"],
};

function Avatar({ initiales, role }) {
  const [bg, col] = ROLE_COLOR[role] || ["#7a90a0", "#fff"];
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      {initiales || "?"}
    </div>
  );
}

export default function Messagerie({ accentColor = "#0a5c8a" }) {
  const me = getUser();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const [m, u] = await Promise.all([getMessages(), getUsers().catch(() => [])]);
      const msgs = Array.isArray(m) ? m : m.data || [];
      const allUsers = Array.isArray(u) ? u : u.data || [];
      setMessages(msgs);
      setUsers(allUsers.filter(usr => usr.id !== me?.id));

      // Auto-select first conversation
      if (!selectedUserId && msgs.length) {
        const partners = new Set();
        msgs.forEach(msg => {
          if (msg.sender_id === me?.id) partners.add(msg.receiver_id);
          else partners.add(msg.sender_id);
        });
        const first = [...partners][0];
        if (first) setSelectedUserId(first);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

  // Conversations grouped by partner
  const conversations = React.useMemo(() => {
    const map = new Map();
    messages.forEach(msg => {
      const partnerId = msg.sender_id === me?.id ? msg.receiver_id : msg.sender_id;
      if (!partnerId) return;
      const existing = map.get(partnerId) || { partnerId, lastMsg: msg, unread: 0 };
      if (new Date(msg.created_at) > new Date(existing.lastMsg.created_at)) {
        existing.lastMsg = msg;
      }
      if (msg.receiver_id === me?.id && !msg.lu) existing.unread++;
      map.set(partnerId, existing);
    });
    return [...map.values()].sort((a, b) => new Date(b.lastMsg.created_at) - new Date(a.lastMsg.created_at));
  }, [messages, me?.id]);

  const partnerUser = (id) => {
    if (!id) return null;
    const found = users.find(u => u.id === id);
    if (found) return found;
    // Try to find from messages
    const msg = messages.find(m => m.sender_id === id || m.receiver_id === id);
    if (msg && msg.sender_id === id) return msg.sender;
    if (msg && msg.receiver_id === id) return msg.receiver;
    return null;
  };

  const visibleMessages = messages.filter(m =>
    selectedUserId && ((m.sender_id === me?.id && m.receiver_id === selectedUserId) ||
                       (m.sender_id === selectedUserId && m.receiver_id === me?.id))
  );

  const send = async () => {
    if (!text.trim() || !selectedUserId) return;
    setSending(true);
    try {
      const newMsg = await sendMessage({ receiver_id: selectedUserId, contenu: text.trim() });
      setMessages([...messages, newMsg]);
      setText("");
    } catch (e) { setError(e.message); }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const initiales = (u) => {
    if (!u) return "?";
    return ((u.prenom || u.nom || "?")[0] + (u.nom || u.prenom || "?")[0]).toUpperCase();
  };

  const selectedPartner = partnerUser(selectedUserId);

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>Messagerie</div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>Échangez avec les autres utilisateurs du système</div>

      {error && (
        <div style={{ background: "#fdeaea", color: "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", height: 540, display: "grid", gridTemplateColumns: "280px 1fr", overflow: "hidden" }}>
        {/* Sidebar conversations */}
        <div style={{ borderRight: "1px solid #f0f4f8", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f4f8" }}>
            <select
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}
              value=""
              onChange={e => { if (e.target.value) setSelectedUserId(Number(e.target.value)); }}
            >
              <option value="">+ Nouvelle conversation</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.role})</option>
              ))}
            </select>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "#7a90a0", fontSize: 13 }}>Chargement...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#7a90a0", fontSize: 13 }}>Aucune conversation. Commencez par sélectionner un destinataire.</div>
            ) : (
              conversations.map(c => {
                const partner = partnerUser(c.partnerId);
                const isSelected = c.partnerId === selectedUserId;
                return (
                  <div
                    key={c.partnerId}
                    onClick={() => setSelectedUserId(c.partnerId)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f4f8",
                      background: isSelected ? "#eef6fb" : "transparent",
                      display: "flex", gap: 10, alignItems: "center",
                    }}
                  >
                    <Avatar initiales={initiales(partner)} role={partner?.role} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #0d1f2d)", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partner ? `${partner.prenom || ""} ${partner.nom || ""}`.trim() : `User #${c.partnerId}`}</span>
                        {c.unread > 0 && (
                          <span style={{ background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{c.unread}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.lastMsg.contenu || c.lastMsg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {selectedUserId ? (
            <>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initiales={initiales(selectedPartner)} role={selectedPartner?.role} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0d1f2d)" }}>
                    {selectedPartner ? `${selectedPartner.prenom || ""} ${selectedPartner.nom || ""}`.trim() : `User #${selectedUserId}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a90a0" }}>{selectedPartner?.role || "Utilisateur"}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", background: "#fafbfc", display: "flex", flexDirection: "column", gap: 10 }}>
                {visibleMessages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#7a90a0", fontSize: 13, marginTop: 60 }}>Pas encore de messages. Écrivez le premier !</div>
                ) : visibleMessages.map(m => {
                  const isOut = m.sender_id === me?.id;
                  return (
                    <div key={m.id} style={{ alignSelf: isOut ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <div style={{
                        padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                        background: isOut ? accentColor : "#fff",
                        color: isOut ? "#fff" : "#0d1f2d",
                        border: isOut ? "none" : "1px solid #e8edf2",
                        borderBottomRightRadius: isOut ? 3 : 12,
                        borderBottomLeftRadius: isOut ? 12 : 3,
                      }}>
                        {m.contenu || m.content}
                      </div>
                      <div style={{ fontSize: 10, color: "#a0b0bc", marginTop: 4, textAlign: isOut ? "right" : "left" }}>
                        {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "12px 18px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Écrivez votre message... (Entrée pour envoyer)"
                  rows={1}
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #e8edf2", borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", minHeight: 40, maxHeight: 100 }}
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  style={{ background: accentColor, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: text.trim() ? "pointer" : "not-allowed", opacity: text.trim() ? 1 : 0.5, fontFamily: "inherit" }}
                >
                  {sending ? "..." : "Envoyer"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#7a90a0", fontSize: 14, padding: 40, textAlign: "center" }}>
              Sélectionnez une conversation ou créez-en une avec le menu déroulant à gauche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
