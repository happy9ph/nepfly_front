import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { SERVICES_META, UNIT_LABEL, findServiceBySlug } from "../data/services.js";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const meta = findServiceBySlug(slug);

  if (!meta) return <Navigate to="/#services" replace />;

  const name = t(`services.${meta.key}n`);
  const text = t(`services.${meta.key}t`);
  const category = t(`services.categories.${meta.categoryKey}`);
  const unit = UNIT_LABEL[lang][meta.unitKey];
  const features = t(`services.${meta.key}features`);
  const featureList = Array.isArray(features) ? features : [];

  const otherServices = SERVICES_META.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      <NavBar />

      <section className="relative h-[46vh] min-h-[360px] overflow-hidden pt-16">
        <img
          src={`https://loremflickr.com/1600/900/${encodeURIComponent(meta.image)}`}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-fixed via-ink-fixed/50 to-ink-fixed/20" />
        <div className="relative h-full max-w-content mx-auto px-6 flex flex-col justify-end pb-12">
          <Link to="/#services" className="inline-flex items-center gap-1.5 text-cream-fixed/70 text-sm hover:text-cream-fixed transition-colors mb-4 w-fit">
            <ArrowLeft size={14} />
            {t("services.heading")}
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-medium uppercase tracking-wide bg-white/15 text-cream-fixed px-3 py-1 rounded-full mb-4">
              {category}
            </span>
            <h1 className="font-display italic text-3xl sm:text-5xl text-cream-fixed max-w-2xl">{name}</h1>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-content mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-12">
        <div>
          <p className="text-lg text-stone leading-relaxed mb-10">{text}</p>

          {featureList.length > 0 && (
            <>
              <h2 className="font-display text-xl text-ink mb-5">
                {lang === "fr" ? "Ce qui est inclus" : "What's included"}
              </h2>
              <ul className="space-y-3 mb-10">
                {featureList.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-stone">
                    <span className="w-5 h-5 rounded-full bg-[#C89A3D]/15 flex items-center justify-center text-coffee-dark shrink-0 mt-0.5">
                      <Check size={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-line bg-surface p-7">
            <span className="text-xs text-ink-faint uppercase tracking-wide">{t("services.priceFrom")}</span>
            <p className="font-display text-3xl text-ink mb-6">
              {meta.priceFrom} $<span className="text-sm text-ink-soft font-sans"> /{unit}</span>
            </p>
            <a
              href="/#rejoindre"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium py-3.5 hover:bg-coffee-dark transition-colors"
            >
              {t("services.request")}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-line max-w-content mx-auto">
        <h2 className="font-display text-xl text-ink mb-8">
          {lang === "fr" ? "Autres services" : "Other services"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {otherServices.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="group rounded-2xl border border-line overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 overflow-hidden">
                <img
                  src={`https://loremflickr.com/400/240/${encodeURIComponent(s.image)}`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <p className="font-display text-ink group-hover:text-coffee-dark transition-colors">
                  {t(`services.${s.key}n`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
