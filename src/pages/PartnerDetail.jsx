import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import Footer from "../components/layout/Footer.jsx";
import StoreBadges from "../components/ui/StoreBadges.jsx";
import FAQ from "../components/sections/FAQ.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { PARTNER_META, getPartnerContent, findPartnerBySlug } from "../data/partners.js";

export default function PartnerDetail() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const meta = findPartnerBySlug(slug);

  if (!meta) return <Navigate to="/#partenaires" replace />;

  const content = getPartnerContent(t, meta);
  const others = PARTNER_META.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      <NavBar />

      {/* --- Hero --- */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden pt-16">
        <img
          src={`https://loremflickr.com/1600/900/${encodeURIComponent(meta.heroImage)}`}
          alt={meta.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${meta.gradient.match(/#[0-9A-Fa-f]{6}/)[0]}ee 10%, rgba(30,26,23,0.35) 100%)` }} />
        <div className="relative h-full max-w-content mx-auto px-6 flex flex-col justify-end pb-12">
          <Link to="/#partenaires" className="inline-flex items-center gap-1.5 text-cream-fixed/70 text-sm hover:text-cream-fixed transition-colors mb-4 w-fit">
            <ArrowLeft size={14} />
            {t("partners.heading")}
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center font-display text-2xl text-cream-fixed">
                {meta.initial}
              </div>
              <div>
                <h1 className="font-display italic text-3xl sm:text-4xl text-cream-fixed">{meta.name}</h1>
                <p className="text-cream-fixed/70 text-sm">{content.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Description + schéma/visuel + stats --- */}
      <section className="px-6 py-16 max-w-content mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <div>
          <p className="text-lg text-stone leading-relaxed mb-10">{content.longText}</p>

          <h2 className="font-display text-xl text-ink mb-5">{t("partners.howItWorks")}</h2>
          <ul className="space-y-4 mb-10">
            {content.highlights.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 text-stone"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-cream text-xs font-medium shrink-0"
                  style={{ background: meta.gradient }}
                >
                  {i + 1}
                </span>
                <span className="pt-1">{h}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          {meta.Visual && (
            <div className="rounded-2xl p-6 text-cream" style={{ background: meta.gradient }}>
              <meta.Visual />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {content.stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-surface border border-line p-3 text-center">
                <p className="font-display text-lg text-ink leading-none">{s.value}</p>
                <p className="text-[0.65rem] text-ink-soft mt-1.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
          {meta.slug === "u-study" && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-medium text-ink">
                  {t("companies.ustudy.available")}
                </p>
              </div>
              <StoreBadges to="#" />
            </div>
          )}
          <a
            href="/#rejoindre"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium py-3.5 hover:bg-coffee-dark transition-colors"
          >
            {t("partners.workWith")} {meta.name}
            <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* --- FAQ spécifique à ce partenaire --- */}
      {t(`faq.partner.${meta.key}`) && Array.isArray(t(`faq.partner.${meta.key}`)) && (
        <FAQ
          eyebrow={t("faq.eyebrow")}
          heading={`${meta.name} : ${t("faq.heading").toLowerCase()}`}
          items={t(`faq.partner.${meta.key}`).map((item) => ({ question: item.q, answer: item.a }))}
        />
      )}

      {/* --- Autres partenaires --- */}
      <section className="px-6 py-16 border-t border-line max-w-content mx-auto">
        <h2 className="font-display text-xl text-ink mb-8">{t("partners.otherPartners")}</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {others.map((p) => (
            <Link
              key={p.slug}
              to={`/partenaires/${p.slug}`}
              className="group rounded-2xl border border-line p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-cream mb-4"
                style={{ background: p.gradient }}
              >
                {p.initial}
              </div>
              <p className="font-display text-ink group-hover:text-coffee-dark transition-colors">{p.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
