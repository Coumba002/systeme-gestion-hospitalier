import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  getPatients, getConsultations, getHospitalisations,
  getFactures, getRendezVous, getMedecins,
} from "../api";

const COLORS = {
  navy: "#0a5c8a",
  green: "#0f6e56",
  purple: "#7c3aed",
  orange: "#854f0b",
  red: "#c0392b",
  blue: "#1a8cbf",
  pink: "#e91e63",
};

const PIE_PALETTE = [COLORS.navy, COLORS.green, COLORS.purple, COLORS.orange, COLORS.red, COLORS.blue, COLORS.pink];

// Carte conteneur uniforme
function ChartCard({ title, subtitle, children, height = 260 }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="chart-title" style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#7a90a0", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ width: "100%", height }}>
        {children}
      </div>
    </div>
  );
}

// Tooltip custom uniforme
const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip" style={{ borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 16px rgba(10,92,138,0.1)", fontSize: 12 }}>
      {label && <div className="chart-tooltip-label" style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name} : {typeof p.value === "number" ? p.value.toLocaleString("fr-FR") : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AdminCharts() {
  const [data, setData] = useState({
    patients: [], consultations: [], hospitalisations: [],
    factures: [], rdvs: [], medecins: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, h, f, r, m] = await Promise.all([
          getPatients(), getConsultations(), getHospitalisations(),
          getFactures(), getRendezVous(), getMedecins(),
        ]);
        const norm = (x) => Array.isArray(x) ? x : x.data || [];
        setData({
          patients: norm(p), consultations: norm(c), hospitalisations: norm(h),
          factures: norm(f), rdvs: norm(r), medecins: norm(m),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // ─── Evolution patients sur 6 derniers mois ──────────────────────────────
  const evolutionPatients = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      months.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleString("fr-FR", { month: "short" }),
      });
    }
    return months.map(m => {
      const count = data.patients.filter(p => {
        const created = p.created_at ? p.created_at.slice(0, 7) : null;
        return created && created <= m.key;
      }).length;
      return { mois: m.label, patients: count };
    });
  }, [data.patients]);

  // ─── Consultations par jour sur 14 derniers jours ────────────────────────
  const consultationsParJour = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        key,
        jour: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      });
    }
    return days.map(d => ({
      jour: d.jour,
      consultations: data.consultations.filter(c =>
        c.date_consultation && c.date_consultation.slice(0, 10) === d.key
      ).length,
    }));
  }, [data.consultations]);

  // ─── Répartition par spécialité (médecins) ───────────────────────────────
  const repartitionSpecialites = useMemo(() => {
    const counts = {};
    data.medecins.forEach(m => {
      const s = m.specialite || "Non spécifié";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.medecins]);

  // ─── Statut des hospitalisations ─────────────────────────────────────────
  const statutHospi = useMemo(() => {
    const map = { en_cours: 0, sortie: 0, transfere: 0 };
    data.hospitalisations.forEach(h => { map[h.statut] = (map[h.statut] || 0) + 1; });
    return [
      { name: "En cours", value: map.en_cours, color: COLORS.navy },
      { name: "Sortie",   value: map.sortie,   color: COLORS.green },
      { name: "Transféré", value: map.transfere, color: COLORS.orange },
    ].filter(x => x.value > 0);
  }, [data.hospitalisations]);

  // ─── Revenus mensuels (encaissements) ────────────────────────────────────
  const revenusMensuels = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      months.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleString("fr-FR", { month: "short" }),
      });
    }
    return months.map(m => {
      const total = data.factures
        .filter(f => f.date_emission && f.date_emission.slice(0, 7) === m.key)
        .reduce((s, f) => s + parseFloat(f.montant_paye || 0), 0);
      return { mois: m.label, revenus: Math.round(total) };
    });
  }, [data.factures]);

  // ─── Statut des factures ─────────────────────────────────────────────────
  const statutFactures = useMemo(() => {
    const map = { en_attente: 0, payee: 0, partielle: 0, annulee: 0 };
    data.factures.forEach(f => { map[f.statut] = (map[f.statut] || 0) + 1; });
    return [
      { name: "Payées", value: map.payee, color: COLORS.green },
      { name: "En attente", value: map.en_attente, color: COLORS.orange },
      { name: "Partielles", value: map.partielle, color: COLORS.navy },
      { name: "Annulées", value: map.annulee, color: COLORS.red },
    ].filter(x => x.value > 0);
  }, [data.factures]);

  if (loading) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "#7a90a0" }}>
        Chargement des graphiques…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <ChartCard title="📈 Évolution des patients enregistrés" subtitle="Sur les 6 derniers mois">
          <ResponsiveContainer>
            <AreaChart data={evolutionPatients} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.navy} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} />
              <Tooltip content={<TooltipBox />} />
              <Area type="monotone" dataKey="patients" stroke={COLORS.navy} strokeWidth={2.5} fill="url(#patGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🏥 Hospitalisations" subtitle="Répartition par statut" height={260}>
          {statutHospi.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#7a90a0", fontSize: 13 }}>
              Aucune hospitalisation
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statutHospi}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                  labelLine={false}
                >
                  {statutHospi.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="🩺 Consultations par jour" subtitle="Sur les 14 derniers jours" height={240}>
        <ResponsiveContainer>
          <BarChart data={consultationsParJour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="jour" tick={{ fontSize: 10, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} />
            <YAxis tick={{ fontSize: 11, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} />
            <Tooltip content={<TooltipBox />} />
            <Bar dataKey="consultations" fill={COLORS.purple} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <ChartCard title="💰 Revenus mensuels" subtitle="6 derniers mois (F CFA)" height={220}>
          <ResponsiveContainer>
            <LineChart data={revenusMensuels} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} />
              <YAxis tick={{ fontSize: 10, fill: "#7a90a0" }} axisLine={{ stroke: "#e8edf2" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<TooltipBox />} />
              <Line type="monotone" dataKey="revenus" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.green }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="👨‍⚕️ Médecins par spécialité" subtitle={`${data.medecins.length} médecins`} height={220}>
          {repartitionSpecialites.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#7a90a0", fontSize: 13 }}>
              Aucun médecin
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={repartitionSpecialites}
                  cx="50%" cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                  style={{ fontSize: 10 }}
                >
                  {repartitionSpecialites.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="🧾 Statut factures" subtitle={`${data.factures.length} factures`} height={220}>
          {statutFactures.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#7a90a0", fontSize: 13 }}>
              Aucune facture
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statutFactures}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ value }) => value}
                  labelLine={false}
                >
                  {statutFactures.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
