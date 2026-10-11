import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Reveal from "../ui/Reveal.jsx";
import ServiceLogo from "../services/ServiceLogo.jsx";
import ServiceRequestPanel from "../services/ServiceRequestPanel.jsx";
import { HServiceArt, H_SERVICE_THEME } from "../art/ServiceArt.jsx";
import { servicePath, SERVICE_PAGES } from "../../data/hServicePages.js";
import { useServiceCatalog, resolveServices } from "../../hooks/useServiceCatalog.js";
import { SERVICE_UI } from "../../i18n/servicePageUi.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

/**
 * "Explorez nos services" — une carte illustrée par service. Un clic ouvre la
 * page dédiée du service (/h/:slug) : plus de pop-up. La liste s'affiche tout
 * de suite (ordre et états par défaut) puis s'ajuste quand le catalogue du
 * backend répond ; un service créé depuis l'admin et inconnu du site ouvre le
 * panneau de demande à la place.
 */
export default function ExploreServices() {
  const { lang, t } = useLanguage();
  const ui = SERVICE_UI[lang] || SERVICE_UI.fr;
  const catalog = useServiceCatalog();
  const { list } = resolveServices(catalog);
  const [panel, setPanel] = useState(null);

  function labelsFor(item) {
    const tr = t(`exploreServices.catalog.${item.key}`);
    if (tr && typeof tr === "object") return { label: tr.label, description: tr.description };
    const c = item.catalog || {};
    return {
      label: (lang === "fr" ? c.label_fr : c.label_en) || c.label_fr || item.key,
      description: (lang === "fr" ? c.description_fr : c.description_en) || c.description_fr || "",
    };
  }

  return (
    <section id="explorer" className="px-6 py-24 bg-cream">
      <div className="max-w-content mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee mb-3">{t("exploreServices.eyebrow")}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-3">{t("exploreServices.heading")}</h2>
          <p className="text-ink-soft max-w-xl mb-12 leading-relaxed">{t("exploreServices.lead")}</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item, i) => {
            const { label, description } = labelsFor(item);
            const hasPage = Boolean(SERVICE_PAGES[item.key]);
            const hasArt = Boolean(H_SERVICE_THEME[item.key]);
            const body = (
              <>
                <div className="relative h-36 overflow-hidden bg-ink-fixed">
                  {hasArt ? (
                    <HServiceArt
                      name={item.key}
                      className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-cream-fixed/80">
                      <Sparkles size={34} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-cream/90 backdrop-blur flex items-center justify-center text-coffee-dark overflow-hidden">
                    <ServiceLogo logoUrl={item.logo_url} serviceKey={item.key} size={19} />
                  </span>
                  <span
                    className={`absolute top-3 right-3 text-[0.62rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      item.disabled ? "bg-ink-fixed/70 text-cream-fixed" : "bg-[#E4B968] text-ink-fixed"
                    }`}
                  >
                    {item.disabled ? ui.soon : ui.available}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="font-display text-xl text-ink leading-tight">{label}</p>
                    <ArrowUpRight
                      size={18}
                      className="text-ink-faint shrink-0 mt-1 transition-all group-hover:text-coffee-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <p className="text-sm text-ink-soft leading-snug">{description}</p>
                </div>
              </>
            );
            const cls =
              "group flex flex-col h-full overflow-hidden rounded-2xl border border-line bg-surface text-left transition-all hover:border-coffee-light hover:-translate-y-1 hover:shadow-lg";
            return (
              <Reveal key={item.key} delay={Math.min(i, 5) * 0.05}>
                {hasPage ? (
                  <Link to={servicePath(item.key)} className={cls} aria-label={label}>
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPanel({ key: item.key, name: label, description, soon: item.disabled })}
                    className={cls}
                  >
                    {body}
                  </button>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      <ServiceRequestPanel
        open={Boolean(panel)}
        onClose={() => setPanel(null)}
        serviceKey={panel?.key}
        name={panel?.name}
        description={panel?.description}
        soon={panel?.soon}
      />
    </section>
  );
}
