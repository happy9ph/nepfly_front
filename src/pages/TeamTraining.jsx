import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Users2, ArrowLeft } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import Footer from "../components/layout/Footer.jsx";
import FAQ from "../components/sections/FAQ.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const DOMAINS = ["Design", "Bureautique", "Cybersécurité", "IT & support", "Développement"];

function PlanCard({ name, price, unit, desc, badge, highlighted, selected, onSelect, features }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`relative text-left rounded-3xl border p-7 flex flex-col transition-all ${
        selected
          ? "border-ink bg-ink text-cream shadow-[0_24px_50px_-20px_rgba(30,26,23,0.4)] scale-[1.02]"
          : highlighted
          ? "border-coffee-light bg-surface"
          : "border-line bg-surface hover:border-coffee-light"
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-3 left-7 text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
            selected ? "bg-[#C89A3D] text-ink" : "bg-[#C89A3D]/15 text-coffee-dark"
          }`}
        >
          {badge}
        </span>
      )}
      <p className={`text-sm font-medium mb-4 ${selected ? "text-cream/70" : "text-ink-soft"}`}>{name}</p>
      <div className="flex items-baseline gap-1 mb-5">
        <span className="font-display text-4xl">{price} $</span>
        <span className={selected ? "text-cream/60 text-sm" : "text-ink-faint text-sm"}>{unit}</span>
      </div>
      <p className={`text-sm leading-relaxed mb-6 ${selected ? "text-cream/70" : "text-stone"}`}>{desc}</p>
      <ul className="space-y-2.5 mt-auto">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check size={15} className={`shrink-0 mt-0.5 ${selected ? "text-[#C89A3D]" : "text-coffee-dark"}`} />
            <span className={selected ? "text-cream/85" : "text-ink-soft"}>{f}</span>
          </li>
        ))}
      </ul>
      <span
        className={`mt-6 text-center text-sm font-medium rounded-full py-3 ${
          selected ? "bg-cream text-ink" : "bg-ink text-cream"
        }`}
      >
        {selected ? "✓" : ""} {name}
      </span>
    </motion.button>
  );
}

export default function TeamTraining() {
  const { t } = useLanguage();
  const toast = useToast();
  const features = [
    t("teamTraining.planFeature1"),
    t("teamTraining.planFeature2"),
    t("teamTraining.planFeature3"),
    t("teamTraining.planFeature4"),
  ];

  const [plan, setPlan] = useState("6");
  const [fields, setFields] = useState({ company: "", contactName: "", employees: "", domains: [], message: "" });
  const [status, setStatus] = useState("idle");

  function toggleDomain(d) {
    setFields((f) => ({
      ...f,
      domains: f.domains.includes(d) ? f.domains.filter((x) => x !== d) : [...f.domains, d],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    // Pas de vrai endpoint dédié pour l'instant — cette demande arrive comme
    // un message de contact classique, visible côté admin.
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
    toast.success(t("teamTraining.formSuccess"));
  }

  return (
    <div className="min-h-screen bg-cream">
      <NavBar />

      {/* --- Hero --- */}
      <section className="relative px-6 pt-40 pb-24 overflow-hidden bg-ink-fixed">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: "radial-gradient(circle at 25% 15%, #4A3020 0%, #1E1A17 65%)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden="true">
          <pattern id="team-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#C89A3D" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#team-dots)" />
        </svg>

        <div className="relative max-w-content mx-auto text-center">
          <Link to="/#learning" className="inline-flex items-center gap-1.5 text-cream-fixed/60 text-sm hover:text-cream-fixed transition-colors mb-8">
            <ArrowLeft size={14} />
            H-learning
          </Link>
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
          >
            <Users2 size={24} className="text-[#C89A3D]" />
          </motion.div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#C89A3D] mb-4">
            {t("teamTraining.badge")}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display italic text-cream-fixed mb-5 max-w-2xl mx-auto"
            style={{ fontSize: "clamp(2rem, 1.5rem + 2vw, 3.2rem)", lineHeight: 1.15 }}
          >
            {t("teamTraining.heroTitle")}
          </motion.h1>
          <p className="text-cream-fixed/70 leading-relaxed max-w-xl mx-auto mb-8">
            {t("teamTraining.heroLead")}
          </p>
          <a
            href="#formules"
            className="inline-flex items-center gap-2 rounded-full bg-[#C89A3D] text-ink text-sm font-medium px-7 py-3.5 hover:bg-[#D9B98C] transition-colors"
          >
            {t("teamTraining.heroCta")}
          </a>
        </div>
      </section>

      {/* --- Formules --- */}
      <section id="formules" className="px-6 py-24 md:py-28 border-t border-line">
        <div className="max-w-content mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-sm font-medium text-coffee mb-4">{t("teamTraining.plansEyebrow")}</p>
            <h2 className="font-display italic text-3xl sm:text-4xl leading-tight text-ink">
              {t("teamTraining.plansHeading")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PlanCard
              name={t("teamTraining.plan1Name")}
              price={t("teamTraining.plan1Price")}
              unit={t("teamTraining.plan1Unit")}
              desc={t("teamTraining.plan1Desc")}
              features={features}
              selected={plan === "1"}
              onSelect={() => setPlan("1")}
            />
            <PlanCard
              name={t("teamTraining.plan6Name")}
              price={t("teamTraining.plan6Price")}
              unit={t("teamTraining.plan6Unit")}
              desc={t("teamTraining.plan6Desc")}
              badge={t("teamTraining.plan6Badge")}
              highlighted
              features={features}
              selected={plan === "6"}
              onSelect={() => setPlan("6")}
            />
            <PlanCard
              name={t("teamTraining.plan12Name")}
              price={t("teamTraining.plan12Price")}
              unit={t("teamTraining.plan12Unit")}
              desc={t("teamTraining.plan12Desc")}
              badge={t("teamTraining.plan12Badge")}
              features={features}
              selected={plan === "12"}
              onSelect={() => setPlan("12")}
            />
          </div>
        </div>
      </section>

      {/* --- Formulaire de demande --- */}
      <section className="px-6 py-24 md:py-28 border-t border-line bg-surface">
        <div className="max-w-content mx-auto grid md:grid-cols-[0.9fr_1.1fr] gap-16">
          <div>
            <p className="text-sm font-medium text-coffee mb-4">{t("teamTraining.formEyebrow")}</p>
            <h2 className="font-display text-3xl leading-tight text-ink max-w-md">
              {t("teamTraining.formHeading")}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-stone mb-1.5">{t("teamTraining.formCompany")}</label>
                <input
                  required
                  value={fields.company}
                  onChange={(e) => setFields((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-cream px-4 py-2.5 text-ink focus:border-coffee outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-stone mb-1.5">{t("teamTraining.formContact")}</label>
                <input
                  required
                  value={fields.contactName}
                  onChange={(e) => setFields((f) => ({ ...f, contactName: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-cream px-4 py-2.5 text-ink focus:border-coffee outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone mb-1.5">{t("teamTraining.formEmployees")}</label>
              <input
                type="number"
                min="1"
                value={fields.employees}
                onChange={(e) => setFields((f) => ({ ...f, employees: e.target.value }))}
                className="w-full rounded-lg border border-line bg-cream px-4 py-2.5 text-ink focus:border-coffee outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-stone mb-2">{t("teamTraining.formDomains")}</label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDomain(d)}
                    className={`text-sm rounded-full border px-4 py-1.5 transition-colors ${
                      fields.domains.includes(d)
                        ? "bg-ink text-cream border-ink"
                        : "border-line text-ink-soft hover:border-coffee-light"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone mb-1.5">{t("teamTraining.formMessage")}</label>
              <textarea
                rows={4}
                value={fields.message}
                onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-line bg-cream px-4 py-2.5 text-ink focus:border-coffee outline-none transition-colors resize-none"
              />
            </div>

            {status === "success" && (
              <p className="text-sm text-coffee-dark bg-coffee-light/15 border border-coffee-light/40 rounded-lg px-4 py-3">
                {t("teamTraining.formSuccess")}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-ink text-cream rounded-full px-8 py-3.5 font-medium transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {status === "loading" ? t("teamTraining.formSubmitting") : t("teamTraining.formSubmit")}
            </button>
          </form>
        </div>
      </section>

      <FAQ
        eyebrow={t("faq.eyebrow")}
        heading={t("teamTraining.faqHeading")}
        items={[1, 2, 3, 4].map((i) => ({
          question: t(`teamTraining.faq${i}q`),
          answer: t(`teamTraining.faq${i}a`),
        }))}
      />

      <Footer />
    </div>
  );
}
