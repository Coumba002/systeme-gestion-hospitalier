import React from "react";

/**
 * Logo KDG Health — composant unifié
 *
 * Variantes :
 *   <Logo size={36} />                                icône carrée seule (SVG)
 *   <Logo size={36} withText />                       icône + "KDG Health" (texte en ligne)
 *   <Logo size={64} withText stacked />               icône + "KDG" / "Health" empilés (style logo officiel)
 *   <Logo size={64} withText stacked subtitle />      idem + sous-titre "Système de Gestion Hospitalière"
 *   <Logo variant="image" height={70} />              image officielle JPG (fond blanc)
 */

// Couleurs officielles
const NAVY = "#0d2a4d";       // KDG (navy foncé)
const BLUE_LIGHT = "#1d8cf0"; // Health (bleu clair)
const BLUE_GRAD_TOP = "#1a8cbf";
const BLUE_GRAD_BOTTOM = "#0a5c8a";

export function LogoIcon({ size = 36 }) {
  const radius = Math.round(size * 0.2);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="kdgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BLUE_GRAD_TOP} />
          <stop offset="100%" stopColor={BLUE_GRAD_BOTTOM} />
        </linearGradient>
      </defs>
      {/* Carré arrondi avec dégradé bleu */}
      <rect x="0" y="0" width="64" height="64" rx={radius} fill="url(#kdgGrad)" />
      {/* Reflet en haut à gauche (léger) */}
      <path d="M 0 0 L 32 0 L 12 30 L 0 30 Z" fill="rgba(255,255,255,0.08)" rx={radius} />
      {/* Cercle blanc autour de la croix */}
      <circle cx="32" cy="28" r="17" stroke="#fff" strokeWidth="2" fill="none" />
      {/* Croix médicale (style décalé comme dans le logo officiel) */}
      <rect x="28" y="16" width="10" height="22" fill="#fff" rx="1.5" />
      <rect x="22" y="22" width="22" height="10" fill="#fff" rx="1.5" />
      {/* Heartbeat — ligne ECG traversant le bas du cercle */}
      <path
        d="M 8 44 L 18 44 L 22 36 L 26 50 L 30 40 L 34 44 L 56 44"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({
  size = 36,
  withText = false,
  stacked = false,         // KDG / Health empilés (vs en ligne)
  subtitle = false,        // sous-titre "Système de Gestion Hospitalière"
  textColor,               // override couleur KDG (sinon navy par défaut)
  healthColor,             // override couleur Health
  subtitleColor,
  variant = "svg",         // "svg" | "image"
  height = 70,             // pour variant image
  gap = 12,
  className,
}) {
  if (variant === "image") {
    return (
      <img
        src={process.env.PUBLIC_URL + "/logo-kdg.jpg"}
        alt="KDG Health — Système de Gestion Hospitalière"
        className={className}
        style={{ height, display: "block", objectFit: "contain" }}
      />
    );
  }

  const navy = textColor || NAVY;
  const blue = healthColor || BLUE_LIGHT;

  if (!withText) {
    return <LogoIcon size={size} />;
  }

  // Texte empilé (style logo officiel : KDG / Health)
  if (stacked) {
    const kdgSize = Math.round(size * 0.45);
    const healthSize = Math.round(size * 0.34);
    const subSize = Math.max(8, Math.round(size * 0.11));
    return (
      <div className={className} style={{ display: "flex", alignItems: "center", gap }}>
        <LogoIcon size={size} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: kdgSize,
            fontWeight: 800,
            color: navy,
            letterSpacing: "-0.02em",
          }}>
            KDG
          </span>
          <span style={{
            fontSize: healthSize,
            fontWeight: 600,
            color: blue,
            marginTop: 2,
            letterSpacing: "-0.01em",
          }}>
            Health
          </span>
          {subtitle && (
            <span style={{
              fontSize: subSize,
              fontWeight: 700,
              color: subtitleColor || navy,
              opacity: subtitleColor ? 1 : 0.7,
              marginTop: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              Système de Gestion Hospitalière
            </span>
          )}
        </div>
      </div>
    );
  }

  // Texte en ligne compact (pour navbar, sidebar)
  const textSize = Math.round(size * 0.5);
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap }}>
      <LogoIcon size={size} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: textSize,
          fontWeight: 800,
          color: navy,
          letterSpacing: "-0.02em",
        }}>
          KDG
        </span>
        <span style={{
          fontSize: Math.round(textSize * 0.85),
          fontWeight: 600,
          color: blue,
          letterSpacing: "-0.01em",
        }}>
          Health
        </span>
      </div>
    </div>
  );
}
