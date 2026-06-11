import React, { useState, createContext, useContext } from "react";

const ToastCtx = createContext({ push: () => {} });

export function useToast() { return useContext(ToastCtx); }

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = (text, type = "info", duration = 3500) => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const colors = {
    info:    { bg: "#eef6fb", border: "#0a5c8a", text: "#0a5c8a", icon: "ℹ️" },
    success: { bg: "#e6f7f2", border: "#0f6e56", text: "#0f6e56", icon: "✓" },
    error:   { bg: "#fdeaea", border: "#c0392b", text: "#c0392b", icon: "✕" },
    warn:    { bg: "#fef3e2", border: "#854f0b", text: "#854f0b", icon: "⚠" },
  };

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.border}`,
              color: c.text,
              padding: "12px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", gap: 10,
              minWidth: 280, maxWidth: 420,
              animation: "toastIn 0.25s ease",
              pointerEvents: "auto",
            }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              <span style={{ flex: 1 }}>{t.text}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
