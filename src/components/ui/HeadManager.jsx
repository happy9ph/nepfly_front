import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

// Associe chaque route à sa clé dans translations.js -> meta.<clé>. Les
// pages "détail" (service, cours, partenaire…) affichent d'abord ce
// libellé générique, puis le précisent avec le vrai nom de l'élément dès
// qu'il est chargé, via usePageMeta() ci-dessous.
const ROUTE_META = [
  { pattern: "/", key: "home" },
  { pattern: "/dashboard", key: "dashboard" },
  { pattern: "/settings", key: "settings" },
  { pattern: "/admin", key: "admin" },
  { pattern: "/agent", key: "agent" },
  { pattern: "/services/:slug", key: "services" },
  { pattern: "/cours/:id", key: "cours" },
  { pattern: "/partenaires/:slug", key: "partenaires" },
  { pattern: "/connexion", key: "connexion" },
  { pattern: "/creer-un-compte", key: "creerCompte" },
  { pattern: "/verifier", key: "verifier" },
  { pattern: "/mot-de-passe-oublie", key: "motDePasseOublie" },
  { pattern: "/nouveau-mot-de-passe", key: "nouveauMotDePasse" },
  { pattern: "/paiement/:offerId", key: "paiement" },
  { pattern: "/formation-equipe", key: "formationEquipe" },
  { pattern: "/interpretation", key: "interpretation" },
  { pattern: "/shopping", key: "shopping" },
  { pattern: "/bienvenue", key: "bienvenue" },
  { pattern: "/confidentialite", key: "confidentialite" },
  { pattern: "/conditions", key: "conditions" },
];

function routeKeyFor(pathname) {
  const hit = ROUTE_META.find((r) => matchPath({ path: r.pattern, end: true }, pathname));
  return hit?.key || "notFound";
}

function upsertMeta(attr, value, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const MetaOverrideContext = createContext(null);

/**
 * Fournit le contexte de surcharge du <head> et applique, à chaque
 * changement de route ou de langue, le titre / la description / les
 * balises Open Graph correspondant à la section visitée — voir
 * ROUTE_META et translations.js -> meta.*. À placer une fois, à
 * l'intérieur du <BrowserRouter> (voir App.jsx).
 */
export function HeadManager({ children }) {
  const location = useLocation();
  const { lang, t } = useLanguage();
  const [override, setOverrideState] = useState(null);

  // Une page détail (ServiceDetail, CourseDetail…) précise le titre une
  // fois ses données chargées ; on efface cette surcharge dès qu'on
  // change de route pour ne pas la laisser fuiter sur la page suivante.
  useEffect(() => {
    setOverrideState(null);
  }, [location.pathname]);

  const setOverride = useCallback((partial) => {
    setOverrideState((prev) => ({ ...prev, ...partial }));
  }, []);
  const clearOverride = useCallback(() => setOverrideState(null), []);

  useEffect(() => {
    const key = routeKeyFor(location.pathname);
    const fallback = t(`meta.${key}`);
    const base =
      fallback && typeof fallback === "object"
        ? fallback
        : { title: t("meta.home.title"), description: t("meta.home.description") };

    const title = override?.title || base.title;
    const description = override?.description || base.description;
    const suffix = t("meta.suffix");
    const fullTitle = key === "home" && !override?.title ? title : `${title}${suffix}`;

    document.title = fullTitle;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "H-Company");
    upsertMeta("property", "og:url", window.location.href);
    upsertMeta("property", "og:locale", lang === "fr" ? "fr_FR" : "en_US");
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, [location.pathname, lang, override, t]);

  return <MetaOverrideContext.Provider value={{ setOverride, clearOverride }}>{children}</MetaOverrideContext.Provider>;
}

/**
 * À appeler depuis une page "détail" une fois l'élément chargé, pour
 * remplacer le titre générique de la section par le vrai nom (ex : le
 * titre du cours plutôt que "Formation H-Learning"). Se nettoie tout
 * seul au démontage / changement de route.
 *
 * usePageMeta(item ? { title: item.name, description: item.description } : null)
 */
export function usePageMeta(meta) {
  const ctx = useContext(MetaOverrideContext);
  const title = meta?.title;
  const description = meta?.description;

  useEffect(() => {
    if (!ctx || (!title && !description)) return undefined;
    ctx.setOverride({ title, description });
    return () => ctx.clearOverride();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, title, description]);
}
