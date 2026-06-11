import React, { useState, useEffect, useMemo } from "react";
import { getAuditLogs, getAuditStats } from "../api";

const ACTION_META = {
  login:         { icon: "🔓", color: "#0a5c8a", bg: "#eef6fb", label: "Connexion" },
  login_failed:  { icon: "⚠️", color: "#c0392b", bg: "#fdeaea", label: "Échec connexion" },
  logout:        { icon: "🚪", color: "#7a90a0", bg: "#f0f4f8", label: "Déconnexion" },
  created:       { icon: "➕", color: "#0f6e56", bg: "#e6f7f2", label: "Création" },
  updated:       { icon: "✏️", color: "#854f0b", bg: "#fef3e2", label: "Modification" },
  deleted:       { icon: "🗑", color: "#c0392b", bg: "#fdeaea", label: "Suppression" },
};

function ActionBadge({ action }) {
  const m = ACTION_META[action] || { icon: "•", color: "#7a90a0", bg: "#f0f4f8", label: action };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: m.bg, color: m.color,
      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
      textTransform: "uppercase", letterSpacing: 0.3,
    }}>
      <span style={{ fontSize: 11 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function formatChanges(changes) {
  if (!changes || typeof changes !== "object") return null;
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;
  return entries.slice(0, 5).map(([field, vals]) => {
    const before = vals?.before ?? "—";
    const after = vals?.after ?? "—";
    return (
      <div key={field} style={{ fontSize: 11, marginBottom: 4 }}>
        <strong style={{ color: "var(--text-secondary, #4a6070)" }}>{field}</strong>{" "}
        <span style={{ color: "#c0392b", textDecoration: "line-through" }}>{String(before).slice(0, 40)}</span>{" "}
        <span style={{ color: "#7a90a0" }}>→</span>{" "}
        <span style={{ color: "#0f6e56", fontWeight: 600 }}>{String(after).slice(0, 40)}</span>
      </div>
    );
  });
}

function formatTime(s) {
  const d = new Date(s);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const params = {};
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entity_type = filterEntity;
      if (search) params.search = search;
      params.limit = 200;
      const [l, s] = await Promise.all([getAuditLogs(params), getAuditStats()]);
      setLogs(Array.isArray(l) ? l : []);
      setStats(s);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [filterAction, filterEntity, search]);

  const entityTypes = useMemo(() => {
    const set = new Set();
    logs.forEach(l => l.entity_type && set.add(l.entity_type));
    return Array.from(set).sort();
  }, [logs]);

  const inp = { padding: "9px 12px", border: "1px solid #e8edf2", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" };

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary, #0d1f2d)", marginBottom: 4 }}>
        Journal d'audit
      </div>
      <div style={{ fontSize: 13, color: "#7a90a0", marginBottom: 20 }}>
        Historique de toutes les actions effectuées sur le système · Réservé aux administrateurs
      </div>

      {err && <div style={{ background: "#fdeaea", color: "#c0392b", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}

      {/* Stats cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            ["Total", stats.total, "#0a5c8a"],
            ["24 dernières h", stats.derniere_24h, "#7c3aed"],
            ["Connexions", stats.logins, "#0f6e56"],
            ["Échecs login", stats.logins_failed, "#c0392b"],
            ["Créations", stats.creations, "#0f6e56"],
            ["Suppressions", stats.suppressions, "#c0392b"],
          ].map(([lbl, val, col]) => (
            <div key={lbl} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8edf2", padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: col, fontFamily: "'Playfair Display',serif", marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top users */}
      {stats?.top_users?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8edf2", padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#7a90a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            👑 Top utilisateurs (par nombre d'actions)
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {stats.top_users.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fafbfc", border: "1px solid #f0f4f8", borderRadius: 8, padding: "6px 10px" }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary, #4a6070)", fontWeight: 600 }}>{u.user_name || `#${u.user_id}`}</span>
                <span style={{ background: "#0a5c8a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{u.actions}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Rechercher utilisateur ou entité..."
          style={{ ...inp, flex: 1, minWidth: 220 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inp, width: "auto" }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="">Toutes actions</option>
          {Object.keys(ACTION_META).map(k => <option key={k} value={k}>{ACTION_META[k].label}</option>)}
        </select>
        <select style={{ ...inp, width: "auto" }} value={filterEntity} onChange={e => setFilterEntity(e.target.value)}>
          <option value="">Toutes entités</option>
          {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={load} style={{ ...inp, cursor: "pointer", background: "#1a2332", color: "#fff", border: "none", padding: "9px 18px", fontWeight: 600 }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Logs list */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Chargement...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#7a90a0" }}>Aucun log correspondant aux filtres</div>
        ) : (
          logs.map(log => {
            const isOpen = expanded === log.id;
            const hasChanges = log.changes && Object.keys(log.changes).length > 0;
            return (
              <div key={log.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                <div
                  onClick={() => hasChanges && setExpanded(isOpen ? null : log.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 18px",
                    cursor: hasChanges ? "pointer" : "default",
                    background: isOpen ? "#fafbfc" : "transparent",
                  }}
                >
                  <ActionBadge action={log.action} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary, #0d1f2d)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.entity_type && <span style={{ color: "#0a5c8a", marginRight: 6 }}>[{log.entity_type}]</span>}
                      {log.entity_label || `#${log.entity_id || "—"}`}
                    </div>
                    <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                      Par <strong style={{ color: "var(--text-secondary, #4a6070)" }}>{log.user_name || "—"}</strong>
                      {log.user_role && <span style={{ marginLeft: 4, fontSize: 9, background: "#f0f4f8", padding: "1px 5px", borderRadius: 3, color: "var(--text-secondary, #4a6070)" }}>{log.user_role}</span>}
                      {" · "}{formatTime(log.created_at)}
                      {log.ip_address && <span style={{ marginLeft: 8, color: "#a0b0bc" }}>· IP {log.ip_address}</span>}
                    </div>
                  </div>
                  {hasChanges && (
                    <span style={{ fontSize: 11, color: "#0a5c8a", fontWeight: 600 }}>
                      {isOpen ? "▼" : "▶"} {Object.keys(log.changes).length} champ(s)
                    </span>
                  )}
                </div>
                {isOpen && hasChanges && (
                  <div style={{ padding: "10px 18px 14px 18px", background: "#fafbfc", borderTop: "1px solid #f0f4f8" }}>
                    <div style={{ fontSize: 10, color: "#7a90a0", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
                      Modifications détaillées
                    </div>
                    {formatChanges(log.changes)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
