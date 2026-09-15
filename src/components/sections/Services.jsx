import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { SERVICES_META, UNIT_LABEL } from "../../data/services.js";

export default function Services() {
  const { t, lang } = useLanguage();
  const [hovered, setHovered] = useState(0);

  const services = SERVICES_META.map((m) => ({
    ...m,
    name: t(`services.${m.key}n`),
    text: t(`services.${m.key}t`),
    category: t(`services.categories.${m.categoryKey}`),
    unit: UNIT_LABEL[lang][m.unitKey],
    tag: m.tagKey ? t(`services.${m.tagKey}`) : null,
  }));

  const active = services[hovered];

  return (
    <section id="services" className="px-6 py-28 md:py-32 border-t border-line bg-cream">
      <div className="max-w-content mx-auto">
        <Reveal className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-coffee mb-4">{t("services.eyebrow")}</p>
          <h2 className="font-display italic text-4xl sm:text-5xl leading-[1.08] text-ink mb-5">
            {t("services.heading")}
          </h2>
          <p className="text-stone leading-relaxed max-w-lg">{t("services.lead")}</p>
        </Reveal>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-start">
          {/* --- Liste --- */}
          <div onMouseLeave={() => setHovered(0)}>
            {services.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onMouseEnter={() => setHovered(i)}
                className="border-t border-line last:border-b"
              >
                <Link
                  to={`/services/${s.slug}`}
                  className="group flex items-center gap-5 py-6 sm:py-7"
                >
                  <span className="font-mono text-xs text-ink-faint w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className={`font-display italic transition-all duration-300 ${
                          hovered === i ? "text-3xl sm:text-4xl text-ink" : "text-2xl sm:text-3xl text-ink-soft"
                        }`}
                      >
                        {s.name}
                      </h3>
                      {s.tag && (
                        <span className="hidden sm:inline-block text-[0.6rem] font-semibold uppercase tracking-wider bg-[#C89A3D]/25 text-coffee-dark px-2 py-1 rounded-full shrink-0">
                          {s.tag}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm text-stone max-w-md transition-all duration-300 overflow-hidden ${
                        hovered === i ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                      }`}
                    >
                      {s.text}
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <span className="text-xs text-ink-faint">{s.category}</span>
                    <span className="font-display text-lg text-ink">
                      {s.priceFrom} $<span className="text-xs text-ink-soft font-sans">/{s.unit}</span>
                    </span>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className={`shrink-0 transition-all duration-300 ${
                      hovered === i ? "text-ink translate-x-0.5 -translate-y-0.5" : "text-ink-faint"
                    }`}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* --- Aperçu photo, change selon le survol --- */}
          <div className="hidden lg:block sticky top-24 h-[420px] rounded-[28px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={`https://loremflickr.com/700/900/${encodeURIComponent(active.image)}`}
                  alt={active.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[0.7rem] font-medium uppercase tracking-wider text-[#C89A3D] mb-1">
                    {active.category}
                  </p>
                  <p className="font-display italic text-2xl text-cream">{active.name}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
