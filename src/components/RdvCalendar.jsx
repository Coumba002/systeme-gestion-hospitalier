import React, { useState, useMemo } from "react";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUT_COLOR = {
  confirme:   { bg: "#e6f7f2", fg: "#0f6e56", border: "#0f6e56", label: "Confirmé" },
  en_attente: { bg: "#fef3e2", fg: "#854f0b", border: "#854f0b", label: "En attente" },
  annule:     { bg: "#fdeaea", fg: "#c0392b", border: "#c0392b", label: "Annulé" },
  realise:    { bg: "#eef6fb", fg: "#0a5c8a", border: "#0a5c8a", label: "Réalisé" },
};

/**
 * Calendrier mensuel pour visualiser les rendez-vous.
 *
 * Props :
 *   rdvs            — Array<RDV> avec date_heure, statut, patient, medecin
 *   onRdvClick      — callback(rdv) lorsqu'un RDV est cliqué
 *   onDayClick      — callback(date, rdvsDuJour) lorsqu'un jour est cliqué
 *   showLegend      — boolean
 *   compactMode     — mode liste compacte vs grille
 */
export default function RdvCalendar({ rdvs = [], onRdvClick, onDayClick, showLegend = true }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(null);

  // Lundi = 0, ..., Dimanche = 6
  const dayOfWeekMon = (date) => (date.getDay() + 6) % 7;

  const calendarDays = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = dayOfWeekMon(firstDay); // décalage avant le 1er du mois
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      const date = new Date(year, month, dayNum);
      cells.push({
        date,
        inMonth: date.getMonth() === month,
        isToday: isSameDay(date, new Date()),
      });
    }
    return cells;
  }, [current]);

  const rdvsByDay = useMemo(() => {
    const map = {};
    rdvs.forEach(r => {
      if (!r.date_heure) return;
      const d = new Date(r.date_heure);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [rdvs]);

  const getRdvsForDate = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return (rdvsByDay[key] || []).sort((a, b) =>
      new Date(a.date_heure) - new Date(b.date_heure)
    );
  };

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  const today = () => setCurrent(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const handleDayClick = (date) => {
    const dayRdvs = getRdvsForDate(date);
    setSelectedDay({ date, rdvs: dayRdvs });
    if (onDayClick) onDayClick(date, dayRdvs);
  };

  const totalMois = useMemo(() =>
    rdvs.filter(r => {
      const d = new Date(r.date_heure);
      return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear();
    }).length,
    [rdvs, current]
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f4f8" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0d1f2d", fontFamily: "'Playfair Display',serif" }}>
            {MOIS[current.getMonth()]} {current.getFullYear()}
          </div>
          <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{totalMois} rendez-vous ce mois</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <button onClick={today} style={{ ...navBtn, padding: "6px 14px", fontSize: 11, fontWeight: 600 }}>Aujourd'hui</button>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>
      </div>

      {/* En-tête jours de semaine */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #f0f4f8", background: "#fafbfc" }}>
        {JOURS.map(j => (
          <div key={j} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#7a90a0", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {j}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {calendarDays.map((cell, i) => {
          const rdvsDuJour = getRdvsForDate(cell.date);
          const isSelected = selectedDay && isSameDay(cell.date, selectedDay.date);
          return (
            <div
              key={i}
              onClick={() => handleDayClick(cell.date)}
              style={{
                minHeight: 92,
                padding: 6,
                borderRight: (i + 1) % 7 !== 0 ? "1px solid #f0f4f8" : "none",
                borderBottom: i < calendarDays.length - 7 ? "1px solid #f0f4f8" : "none",
                background: isSelected ? "#eef6fb" : cell.isToday ? "#f9fbfc" : "#fff",
                opacity: cell.inMonth ? 1 : 0.35,
                cursor: "pointer",
                transition: "background 0.12s",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: cell.isToday ? 700 : 500,
                  color: cell.isToday ? "#fff" : "#0d1f2d",
                  background: cell.isToday ? "#0a5c8a" : "transparent",
                  width: cell.isToday ? 22 : "auto",
                  height: cell.isToday ? 22 : "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}>
                  {cell.date.getDate()}
                </span>
                {rdvsDuJour.length > 3 && (
                  <span style={{ fontSize: 9, color: "#7a90a0", fontWeight: 600 }}>+{rdvsDuJour.length - 3}</span>
                )}
              </div>

              {rdvsDuJour.slice(0, 3).map(r => {
                const col = STATUT_COLOR[r.statut] || STATUT_COLOR.en_attente;
                const heure = new Date(r.date_heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                const patient = r.patient ? `${r.patient.nom} ${r.patient.prenom}`.trim() : `P#${r.patient_id}`;
                return (
                  <div
                    key={r.id}
                    onClick={e => { e.stopPropagation(); onRdvClick && onRdvClick(r); }}
                    title={`${heure} · ${patient}${r.motif ? " · " + r.motif : ""}`}
                    style={{
                      background: col.bg,
                      color: col.fg,
                      borderLeft: `2.5px solid ${col.border}`,
                      borderRadius: 3,
                      padding: "2px 5px",
                      fontSize: 10,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <strong>{heure}</strong> {patient}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      {showLegend && (
        <div style={{ padding: "10px 20px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, background: "#fafbfc" }}>
          <span style={{ color: "#7a90a0", fontWeight: 600 }}>Légende :</span>
          {Object.entries(STATUT_COLOR).map(([key, c]) => (
            <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1.5px solid ${c.border}` }}></span>
              <span style={{ color: "#4a6070" }}>{c.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Modal détail jour */}
      {selectedDay && selectedDay.rdvs.length > 0 && (
        <div
          onClick={() => setSelectedDay(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 500, maxHeight: "80vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0d1f2d", fontFamily: "'Playfair Display',serif" }}>
                  {selectedDay.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ fontSize: 12, color: "#7a90a0", marginTop: 2 }}>{selectedDay.rdvs.length} rendez-vous</div>
              </div>
              <button onClick={() => setSelectedDay(null)} style={{ background: "transparent", border: "none", fontSize: 22, color: "#7a90a0", cursor: "pointer" }}>×</button>
            </div>

            {selectedDay.rdvs.map(r => {
              const col = STATUT_COLOR[r.statut] || STATUT_COLOR.en_attente;
              const heure = new Date(r.date_heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              return (
                <div
                  key={r.id}
                  onClick={() => { onRdvClick && onRdvClick(r); setSelectedDay(null); }}
                  style={{
                    background: "#fafbfc",
                    borderLeft: `3px solid ${col.border}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f2d" }}>{heure}</div>
                    <span style={{ background: col.bg, color: col.fg, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{col.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#0d1f2d", fontWeight: 600 }}>
                    {r.patient ? `${r.patient.nom} ${r.patient.prenom}` : `Patient #${r.patient_id}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>
                    Dr. {r.medecin?.nom || "—"} {r.medecin?.prenom || ""}
                    {r.motif && ` · ${r.motif}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const navBtn = {
  background: "#f0f4f8",
  border: "none",
  width: 30, height: 30,
  borderRadius: 6,
  cursor: "pointer",
  color: "#4a6070",
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
