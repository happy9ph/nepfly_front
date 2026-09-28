import { useId } from "react";

// Même dessin que le favicon (public/logo-icon.svg) — couleurs de marque
// H-Company en dur (chocolat / crème / café / or) pour rester identique
// partout où le logo apparaît, quel que soit le composant qui l'utilise.
const INK = "#10140F";
const GOLD = "#C89A3D";
const COFFEE = "#4A3020";

/** Marque "H" de H-Company, en SVG inline (footer, navbar…). */
export default function Logo({ size = 32, className = "" }) {
  // Identifiant de dégradé unique par instance : le logo apparaît à la fois
  // dans la navbar et le footer sur chaque page, deux <svg> avec le même id
  // "hc-logo-sheen" seraient invalides en HTML (et le second ne résoudrait
  // plus correctement son dégradé).
  const gradientId = `hc-logo-sheen-${useId()}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="H-Company"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="15" fill={INK} />
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#${gradientId})`} fillOpacity="0.5" />
      <path
        d="M20 14 L28 14 L28 28 L36 28 L36 14 L44 14 L44 50 L36 50 L36 36 L28 36 L28 50 L20 50 Z"
        fill={GOLD}
      />
      <circle cx="32" cy="32" r="4.5" fill={INK} stroke={GOLD} strokeWidth="1.6" />
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="62" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor={COFFEE} />
          <stop offset="1" stopColor={INK} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
