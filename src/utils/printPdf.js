/**
 * Génération PDF via popup d'impression.
 *
 * Approche : ouvre une nouvelle fenêtre avec un HTML auto-portant et déclenche
 * window.print(). L'utilisateur peut alors "Enregistrer en PDF" depuis le
 * dialog du navigateur — résultat propre et vectoriel.
 *
 * Avantages : zéro dépendance, mise en page CSS, support print-color-adjust.
 */

const SHARED_STYLES = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Plus Jakarta Sans', -apple-system, 'Segoe UI', Arial, sans-serif; color: #1a2332; margin: 0; padding: 0; line-height: 1.5; }
  .pdf-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px solid #0a5c8a; margin-bottom: 24px; }
  .pdf-brand { display: flex; align-items: center; gap: 12px; }
  .pdf-brand-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #1a8cbf 0%, #0a5c8a 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff; }
  .pdf-brand-text h1 { font-size: 22px; font-weight: 800; color: #0d2a4d; margin: 0; letter-spacing: -0.02em; }
  .pdf-brand-text h1 .blue { color: #1d8cf0; }
  .pdf-brand-text .sub { font-size: 9px; font-weight: 700; color: #0d2a4d; opacity: 0.75; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
  .pdf-meta { text-align: right; font-size: 11px; color: #7a90a0; }
  .pdf-meta strong { color: #0d1f2d; font-size: 12px; }
  .pdf-section { margin-bottom: 22px; }
  .pdf-section-title { font-size: 11px; font-weight: 700; color: #0a5c8a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e8edf2; }
  .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; }
  .pdf-row { font-size: 12px; }
  .pdf-row .label { color: #7a90a0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .pdf-row .val { color: #0d1f2d; font-weight: 600; margin-top: 2px; }
  .pdf-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  .pdf-table th { text-align: left; padding: 10px 12px; background: #f4f7fa; color: #4a6070; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e8edf2; }
  .pdf-table td { padding: 10px 12px; border-bottom: 1px solid #f0f4f8; }
  .pdf-table tr.total td { font-weight: 700; background: #eef6fb; color: #0a5c8a; font-size: 14px; border-top: 2px solid #0a5c8a; }
  .pdf-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8edf2; display: flex; justify-content: space-between; font-size: 10px; color: #7a90a0; }
  .pdf-signature { margin-top: 36px; text-align: right; }
  .pdf-signature .line { display: inline-block; width: 220px; border-bottom: 1px solid #0d1f2d; padding-bottom: 4px; }
  .pdf-signature .name { font-size: 11px; color: #0d1f2d; font-weight: 600; margin-top: 6px; }
  .pdf-badge { display: inline-block; padding: 3px 10px; border-radius: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .pdf-stamp { float: right; padding: 8px 18px; border: 2px solid; border-radius: 6px; font-weight: 800; font-size: 16px; transform: rotate(-3deg); letter-spacing: 0.1em; }
  .pdf-medicament { background: #f9fbfc; border-left: 3px solid #7c3aed; padding: 12px 14px; border-radius: 5px; margin-bottom: 8px; }
  .pdf-medicament .nom { font-size: 13px; font-weight: 700; color: #0d1f2d; }
  .pdf-medicament .posologie { font-size: 11px; color: #4a6070; margin-top: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }
`;

const LOGO_SVG = `
  <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kdgG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1a8cbf"/>
        <stop offset="100%" stop-color="#0a5c8a"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="12" fill="url(#kdgG)"/>
    <circle cx="32" cy="28" r="17" stroke="#fff" stroke-width="2" fill="none"/>
    <rect x="28" y="16" width="10" height="22" fill="#fff" rx="1.5"/>
    <rect x="22" y="22" width="22" height="10" fill="#fff" rx="1.5"/>
    <path d="M 8 44 L 18 44 L 22 36 L 26 50 L 30 40 L 34 44 L 56 44" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>
`;

function brandHeader() {
  return `
    <div class="pdf-brand">
      <div>${LOGO_SVG}</div>
      <div class="pdf-brand-text">
        <h1>KDG <span class="blue">Health</span></h1>
        <div class="sub">Système de Gestion Hospitalière</div>
      </div>
    </div>
  `;
}

function openPrint(html, title = "Document KDG Health") {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) {
    alert("Veuillez autoriser les popups pour générer le PDF.");
    return;
  }
  win.document.write(`<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>${SHARED_STYLES}</style>
    </head>
    <body>
      ${html}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 350);
        };
      </script>
    </body>
    </html>`);
  win.document.close();
}

// ─── Export ORDONNANCE ──────────────────────────────────────────────────────
export function printOrdonnance({ prescription, patient, medecin }) {
  const dateEmission = prescription.date_prescription
    ? new Date(prescription.date_prescription).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : new Date().toLocaleDateString("fr-FR", { dateStyle: "long" });

  const medicaments = (prescription.medicaments || "").split(/\n|;/).map(m => m.trim()).filter(Boolean);

  const html = `
    <div class="pdf-header">
      ${brandHeader()}
      <div class="pdf-meta">
        <strong>ORDONNANCE MÉDICALE</strong><br>
        N° ${String(prescription.id || "—").padStart(6, "0")}<br>
        ${dateEmission}
      </div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Médecin prescripteur</div>
      <div class="pdf-grid">
        <div class="pdf-row"><div class="label">Nom</div><div class="val">Dr. ${medecin?.nom || "—"} ${medecin?.prenom || ""}</div></div>
        <div class="pdf-row"><div class="label">Spécialité</div><div class="val">${medecin?.specialite || "—"}</div></div>
        <div class="pdf-row"><div class="label">N° d'ordre</div><div class="val">${medecin?.numero_ordre || "—"}</div></div>
        <div class="pdf-row"><div class="label">Téléphone</div><div class="val">${medecin?.telephone || "—"}</div></div>
      </div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Patient</div>
      <div class="pdf-grid">
        <div class="pdf-row"><div class="label">Nom complet</div><div class="val">${patient?.nom || "—"} ${patient?.prenom || ""}</div></div>
        <div class="pdf-row"><div class="label">Date de naissance</div><div class="val">${patient?.date_naissance ? new Date(patient.date_naissance).toLocaleDateString("fr-FR") : "—"}</div></div>
        <div class="pdf-row"><div class="label">N° dossier</div><div class="val">${patient?.numero_securite_sociale || "P-" + (patient?.id || "—")}</div></div>
        <div class="pdf-row"><div class="label">Téléphone</div><div class="val">${patient?.telephone || "—"}</div></div>
      </div>
      ${patient?.allergies ? `<div style="margin-top:10px;padding:8px 12px;background:#fdeaea;border-left:3px solid #c0392b;border-radius:4px;font-size:11px;color:#c0392b;font-weight:600;">⚠ Allergies connues : ${patient.allergies}</div>` : ""}
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Prescription</div>
      ${medicaments.length > 0 ? medicaments.map(m => `
        <div class="pdf-medicament">
          <div class="nom">${m}</div>
          ${[prescription.dosage, prescription.frequence, prescription.duree].filter(Boolean).length > 0
            ? `<div class="posologie">${[prescription.dosage, prescription.frequence, prescription.duree].filter(Boolean).join(" · ")}</div>`
            : ""}
        </div>
      `).join("") : `
        <div class="pdf-medicament">
          <div class="nom">${prescription.medicaments || "—"}</div>
          <div class="posologie">${[prescription.dosage, prescription.frequence, prescription.duree].filter(Boolean).join(" · ") || ""}</div>
        </div>
      `}
      ${prescription.instructions ? `<div style="margin-top:12px;padding:10px 14px;background:#eef6fb;border-radius:5px;font-size:11px;color:#0a5c8a;"><strong>Instructions :</strong> ${prescription.instructions}</div>` : ""}
    </div>

    <div class="pdf-signature">
      <div class="line"></div>
      <div class="name">Dr. ${medecin?.nom || ""} ${medecin?.prenom || ""}</div>
      <div style="font-size:9px;color:#7a90a0;margin-top:2px;">Signature & cachet</div>
    </div>

    <div class="pdf-footer">
      <div>KDG Health — Hôpital de référence · Dakar, Sénégal</div>
      <div>Document généré le ${new Date().toLocaleString("fr-FR")}</div>
    </div>
  `;

  openPrint(html, `Ordonnance #${prescription.id}`);
}

// ─── Export FACTURE ─────────────────────────────────────────────────────────
export function printFacture({ facture, patient }) {
  const dateEmission = facture.date_emission
    ? new Date(facture.date_emission).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : new Date().toLocaleDateString("fr-FR", { dateStyle: "long" });
  const dateEcheance = facture.date_echeance
    ? new Date(facture.date_echeance).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : "—";

  const total = parseFloat(facture.montant_total || 0);
  const paye = parseFloat(facture.montant_paye || 0);
  const restant = Math.max(0, total - paye);

  const statutColors = {
    payee: { bg: "#e6f7f2", col: "#0f6e56", lbl: "PAYÉE" },
    en_attente: { bg: "#fef3e2", col: "#854f0b", lbl: "EN ATTENTE" },
    partielle: { bg: "#eef6fb", col: "#0a5c8a", lbl: "PARTIELLE" },
    annulee: { bg: "#fdeaea", col: "#c0392b", lbl: "ANNULÉE" },
  };
  const st = statutColors[facture.statut] || statutColors.en_attente;

  // Découpe la description en lignes (séparées par ·)
  const lignes = (facture.description || "Prestation").split(/\s·\s/).map(s => s.trim()).filter(Boolean);

  const html = `
    <div class="pdf-header">
      ${brandHeader()}
      <div class="pdf-meta">
        <strong>FACTURE</strong><br>
        N° KDG-${new Date(facture.date_emission || Date.now()).getFullYear()}-${String(facture.id || "—").padStart(6, "0")}<br>
        ${dateEmission}
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
      <div class="pdf-section" style="margin-bottom:0;flex:1;">
        <div class="pdf-section-title">Facturé à</div>
        <div style="font-size:14px;font-weight:700;color:#0d1f2d;margin-bottom:4px;">${patient?.nom || "—"} ${patient?.prenom || ""}</div>
        <div style="font-size:11px;color:#4a6070;line-height:1.6;">
          ${patient?.adresse || ""}<br>
          ${patient?.telephone ? `Tél : ${patient.telephone}<br>` : ""}
          ${patient?.email ? `${patient.email}<br>` : ""}
          ${patient?.mutuelle ? `Mutuelle : ${patient.mutuelle}` : ""}
        </div>
      </div>
      <div style="text-align:right;">
        <span class="pdf-badge" style="background:${st.bg};color:${st.col};">${st.lbl}</span>
        <div style="font-size:11px;color:#7a90a0;margin-top:8px;">Échéance : <strong style="color:#0d1f2d;">${dateEcheance}</strong></div>
      </div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Détails des prestations</div>
      <table class="pdf-table">
        <thead>
          <tr><th style="width:50px;">N°</th><th>Description</th><th style="text-align:right;width:120px;">Montant (F CFA)</th></tr>
        </thead>
        <tbody>
          ${lignes.length > 0 ? lignes.map((l, i) => {
            // Tente d'extraire un montant entre parenthèses ex: "(15 000 F)"
            const match = l.match(/\(([\d\s]+)\s*F?\s*\)/);
            const montantLigne = match ? parseInt(match[1].replace(/\s/g, "")) : (i === lignes.length - 1 ? total : 0);
            const desc = l.replace(/\s*\([^)]+\)\s*$/, "");
            return `<tr><td>${i + 1}</td><td>${desc}</td><td style="text-align:right;font-weight:600;">${montantLigne ? montantLigne.toLocaleString("fr-FR") : "—"}</td></tr>`;
          }).join("") : `<tr><td>1</td><td>${facture.description || "Prestation médicale"}</td><td style="text-align:right;font-weight:600;">${total.toLocaleString("fr-FR")}</td></tr>`}
          <tr><td colspan="2" style="text-align:right;color:#7a90a0;font-size:11px;padding-top:14px;">Sous-total</td><td style="text-align:right;font-weight:700;padding-top:14px;">${total.toLocaleString("fr-FR")} F</td></tr>
          ${paye > 0 ? `<tr><td colspan="2" style="text-align:right;color:#0f6e56;font-size:11px;">Déjà payé</td><td style="text-align:right;color:#0f6e56;font-weight:700;">- ${paye.toLocaleString("fr-FR")} F</td></tr>` : ""}
          <tr class="total"><td colspan="2" style="text-align:right;">${restant > 0 ? "Restant dû" : "Total"}</td><td style="text-align:right;">${(restant > 0 ? restant : total).toLocaleString("fr-FR")} F CFA</td></tr>
        </tbody>
      </table>
    </div>

    <div class="pdf-footer">
      <div>
        <strong style="color:#0d1f2d;">KDG Health</strong> · Hôpital de référence · Dakar, Sénégal<br>
        Tél : +221 33 800 00 00 · email : contact@kdghealth.sn
      </div>
      <div style="text-align:right;">
        Document généré le ${new Date().toLocaleString("fr-FR")}<br>
        Modes de paiement : Espèces, Carte, Mobile Money, Virement
      </div>
    </div>
  `;

  openPrint(html, `Facture #${facture.id}`);
}
