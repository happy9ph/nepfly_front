import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router ne remet jamais le défilement en haut de page tout seul lors
 * d'un changement de route (comportement volontaire, pensé pour les cas où
 * on veut garder la position — mais pas ce qu'on veut ici) : sans ce
 * correctif, cliquer sur un partenaire ou un cours depuis le bas de la page
 * d'accueil ouvre la page détail... à la même hauteur de défilement,
 * donnant l'impression que rien ne s'est passé.
 *
 * Exception volontaire : si l'URL contient une ancre (#section), on laisse
 * faire — Home.jsx gère déjà ce cas séparément (voir son effet de
 * défilement vers l'ancre après connexion).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
