/** Redirection après connexion : uniquement un chemin INTERNE (pas d'URL externe, pas de « //hote »). */
export const safeRedirect = (p, fallback = "/") =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\") ? p : fallback;

const KEY = "hc_after_login";
/** Mémorise la destination avant un aller-retour chez un tiers (Google) qui recharge tout le site. */
export const rememberRedirect = (p) => { try { sessionStorage.setItem(KEY, safeRedirect(p)); } catch { /* stockage indisponible */ } };
export const takeRedirect = () => {
  try { const v = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); return safeRedirect(v); } catch { return "/"; }
};
