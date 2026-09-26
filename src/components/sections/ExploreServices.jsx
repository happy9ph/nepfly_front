import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../lib/api.js";
import Reveal from "../ui/Reveal.jsx";
import { presentationFor } from "../../data/hServices.js";
import SubscribeServiceModal from "../services/SubscribeServiceModal.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

/** Grille de services façon "Explore our services" — un service par carte,
 * flèche en haut à droite, description sous le titre. Cliquer ouvre le
 * formulaire d'abonnement (SubscribeServiceModal) ; le service marqué
 * indisponible (H-Money, pour l'instant) est affiché mais désactivé. */
export default function ExploreServices() {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | ready | error
  const [openService, setOpenService] = useState(null);

  // Le backend fournit la clé et la disponibilité (source de vérité pour
  // l'activation de H-Money, etc.) ; le libellé/la description affichés
  // viennent du dictionnaire de traduction pour rester bilingues FR/EN.
  function localize(service) {
    const tr = t(`exploreServices.catalog.${service.key}`);
    if (typeof tr === "object" && tr) {
      return { ...service, label: tr.label, description: tr.description };
    }
    return service;
  }

  useEffect(() => {
    api.services
      .catalog()
      .then((data) => {
        setCatalog(Array.isArray(data) ? data : []);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  }, []);

  return (
    <section id="explorer" className="px-6 py-24 bg-cream">
      <div className="max-w-content mx-auto">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-10">{t("exploreServices.heading")}</h2>
        </Reveal>

        {loadStatus === "loading" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface border border-line animate-pulse" />
            ))}
          </div>
        )}

        {loadStatus === "error" && (
          <p className="text-sm text-ink-soft">{t("exploreServices.loadError")}</p>
        )}

        {loadStatus === "ready" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((raw, i) => {
              const service = localize(raw);
              const { Icon } = presentationFor(service.key);
              return (
                <Reveal key={service.key} delay={i * 0.05}>
                  <button
                    type="button"
                    disabled={service.disabled}
                    onClick={() => setOpenService(service)}
                    className={`group w-full h-full text-left rounded-2xl border p-5 transition-colors ${
                      service.disabled
                        ? "border-line bg-surface/60 opacity-60 cursor-not-allowed"
                        : "border-line bg-surface hover:border-coffee-light hover:-translate-y-0.5 transition-transform"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee shrink-0">
                        <Icon size={19} />
                      </span>
                      {service.disabled ? (
                        <span className="text-[0.6rem] font-medium uppercase tracking-wide bg-line text-ink-faint px-2 py-0.5 rounded-full h-fit">
                          {t("exploreServices.comingSoon")}
                        </span>
                      ) : (
                        <ArrowRight
                          size={18}
                          className="text-ink-faint group-hover:text-coffee-dark group-hover:translate-x-0.5 transition-all"
                        />
                      )}
                    </div>
                    <p className="font-display text-lg text-ink mb-1">{service.label}</p>
                    <p className="text-sm text-ink-soft leading-snug">{service.description}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {openService && (
        <SubscribeServiceModal service={openService} onClose={() => setOpenService(null)} />
      )}
    </section>
  );
}
