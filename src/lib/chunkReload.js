/**
 * Après une mise en ligne, un onglet resté ouvert réclame d'anciens fichiers (noms à empreinte) qui n'existent
 * plus : la page « se fige » ou affiche une erreur. On recharge UNE fois (garde anti-boucle de 30 s).
 */
const KEY = "hc_chunk_reload_at";
export const isChunkError = (err) =>
  /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch dynamically/i.test(String(err?.message || err || ""));

export function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* stockage indisponible : on recharge quand même une fois */ }
  window.location.reload();
  return true;
}
