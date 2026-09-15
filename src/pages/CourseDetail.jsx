import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, GraduationCap, CheckCircle2 } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useCourses, LEVEL_TONE } from "../data/courses.js";

const LEVEL_HOURS = { "initiation": 6, "intermédiaire": 12, "tous niveaux": 8 };

const TONE_BG = { gold: "#C89A3D", clay: "#A94B32", coffee: "#4A3020" };

// Programme générique par niveau — le backend ne stocke pas encore de
// syllabus détaillé par cours, ce contenu illustre la structure type
// d'un parcours pendant qu'un vrai programme n'est pas encore branché.
const CURRICULUM_BY_LEVEL = {
  "initiation": [
    "Poser les bases et le vocabulaire du domaine",
    "Manipuler les outils essentiels avec un formateur",
    "Mettre en pratique sur un cas concret",
    "Évaluation et certificat de complétion",
  ],
  "intermédiaire": [
    "Rappel des fondamentaux, à votre rythme",
    "Approfondissement technique guidé par un formateur",
    "Projet complet du cahier des charges à la livraison",
    "Retours individuels et certificat de complétion",
  ],
  "tous niveaux": [
    "Diagnostic de votre niveau de départ",
    "Parcours adapté selon votre profil",
    "Mise en pratique sur votre propre projet",
    "Certificat de complétion",
  ],
};

export default function CourseDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { status, courses } = useCourses();

  if (status === "loading") {
    return <div className="min-h-screen bg-cream" />;
  }

  const course = courses.find((c) => String(c.id) === String(id));
  if (!course) return <Navigate to="/#learning" replace />;

  const tone = LEVEL_TONE[course.level] || "coffee";
  const hours = LEVEL_HOURS[course.level] || 8;
  const curriculum = CURRICULUM_BY_LEVEL[course.level] || CURRICULUM_BY_LEVEL["tous niveaux"];

  return (
    <div className="min-h-screen bg-cream">
      <NavBar />

      <section className="relative h-[46vh] min-h-[360px] overflow-hidden pt-16">
        <img src={course.photo} alt={course.alt} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(0deg, ${TONE_BG[tone]}ee 10%, rgba(30,26,23,0.35) 100%)` }}
        />
        <div className="relative h-full max-w-content mx-auto px-6 flex flex-col justify-end pb-12">
          <Link to="/#learning" className="inline-flex items-center gap-1.5 text-cream-fixed/70 text-sm hover:text-cream-fixed transition-colors mb-4 w-fit">
            <ArrowLeft size={14} />
            {t("learning.heading")}
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-medium uppercase tracking-wide bg-white/15 text-cream-fixed px-3 py-1 rounded-full mb-4">
              {course.level}
            </span>
            <h1 className="font-display italic text-3xl sm:text-5xl text-cream-fixed max-w-2xl">{course.title}</h1>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-content mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-12">
        <div>
          <p className="text-lg text-stone leading-relaxed mb-10">{course.text || course.description}</p>

          <h2 className="font-display text-xl text-ink mb-5">{t("learning.curriculum")}</h2>
          <ul className="space-y-4">
            {curriculum.map((step, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-3 text-stone"
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: TONE_BG[tone] }} />
                {step}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-line bg-surface p-7">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line">
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Clock size={15} />
                {hours}h
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <GraduationCap size={15} />
                {course.level}
              </div>
            </div>
            <a
              href="/#rejoindre"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium py-3.5 hover:bg-coffee-dark transition-colors"
            >
              {t("learning.discover")}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
