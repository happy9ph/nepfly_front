import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext.jsx";

/**
 * "Vidéo" de 15 secondes en boucle illustrant chaque étape — en réalité
 * une animation construite (pas un fichier vidéo importé), présentée dans
 * un cadre de lecteur pour rester honnête sur ce que c'est : une
 * démonstration animée, pas une vraie capture d'écran filmée. Chaque
 * étape montre du vrai texte lisible, pas seulement des formes abstraites.
 */
const DURATION = 15;

function Chrome({ children }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(((Date.now() - start) / 1000) % DURATION);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const mm = "0";
  const ss = String(Math.floor(elapsed)).padStart(2, "0");

  return (
    <div className="relative w-full h-full">
      {children}

      {/* Vignette cinématographique : assombrit légèrement les coins pour
          donner de la profondeur, comme un vrai enregistrement d'écran. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 90px 20px rgba(0,0,0,0.35)" }}
      />

      {/* Indicateur "en direct" : touche personnelle, coin supérieur gauche */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#C89A3D]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <span className="text-[0.6rem] font-medium tracking-wider text-white/50 uppercase">H-Company</span>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-8 bg-gradient-to-t from-black/60 to-transparent">
        <div className="h-1 rounded-full bg-white/25 overflow-hidden mb-2">
          <div
            className="h-full bg-[#C89A3D]"
            style={{ width: `${(elapsed / DURATION) * 100}%`, transition: "width 0.1s linear" }}
          />
        </div>
        <div className="flex items-center justify-between text-[0.65rem] text-white/70 font-mono">
          <span>{mm}:{ss}</span>
          <div className="flex items-center gap-2">
            {/* Filigrane discret : signature de la marque */}
            <span className="flex items-center justify-center w-4 h-4 rounded-full border border-white/25 text-[0.55rem] font-display italic text-white/50">
              H
            </span>
            <span>0:{DURATION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchStep() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const full = lang === "fr" ? "Développement mobile" : "Mobile development";
  const results = lang === "fr"
    ? ["Développement web & mobile", "H-learning : Formation dev", "Lukondo : App transport"]
    : ["Web & mobile development", "H-learning : Dev training", "Lukondo : Transport app"];

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setQuery(full.slice(0, i));
      if (i >= full.length) clearInterval(timer);
    }, (900 / full.length) * 6);
    return () => clearInterval(timer);
  }, [full]);

  return (
    <div className="w-full h-full flex items-center justify-center p-10 relative">
      <div className="w-full max-w-[280px] relative">
        <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
          <svg width="14" height="14" viewBox="0 0 26 26" fill="none"><circle cx="11" cy="11" r="7" stroke="#C89A3D" strokeWidth="1.5" /><path d="M20 20L16 16" stroke="#C89A3D" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="text-sm text-white font-mono">{query}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span></span>
        </div>
        {results.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: query.length > 8 ? 1 : 0, y: query.length > 8 ? 0 : 8 }}
            transition={{ delay: i * 0.15 }}
            className="h-10 rounded-lg bg-white/[0.07] mb-2 flex items-center px-3"
          >
            <span className="text-xs text-white/85 truncate">{label}</span>
          </motion.div>
        ))}

        {/* Curseur simulé : se déplace vers la barre puis "clique" */}
        <motion.div
          className="absolute pointer-events-none"
          initial={{ top: 120, left: 200, opacity: 0 }}
          animate={{
            top: [120, 18, 18, 60],
            left: [200, 170, 170, 170],
            opacity: [0, 1, 1, 1],
            scale: [1, 1, 0.8, 1],
          }}
          transition={{ duration: 1.6, times: [0, 0.5, 0.6, 1], ease: "easeInOut" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 1L2 14L5.5 11L7.5 15L9.5 14L7.5 10L12 10L2 1Z" fill="white" stroke="#1E1A17" strokeWidth="0.6" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function MatchStep() {
  const { lang } = useLanguage();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-10">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-display">C</div>
          <span className="text-[0.65rem] text-white/60">{lang === "fr" ? "Client" : "Client"}</span>
        </div>
        <div className="relative flex-1 max-w-[80px] h-px bg-white/20">
          <motion.div
            className="absolute -top-1.5 w-3 h-3 rounded-full bg-[#C89A3D]"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[#C89A3D]/20 flex items-center justify-center text-[#C89A3D] font-display">H</div>
          <span className="text-[0.65rem] text-white/60">H-Company</span>
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="text-xs text-white/70"
      >
        {lang === "fr" ? "Mise en relation avec Lukondo…" : "Matching with Lukondo…"}
      </motion.p>
    </div>
  );
}

function ContractStep() {
  const { lang } = useLanguage();
  const lines = lang === "fr"
    ? [
        { label: "Offre", value: "Pro : 450 $/mois" },
        { label: "Durée", value: "12 mois" },
        { label: "Paiement", value: "Mensuel" },
      ]
    : [
        { label: "Offer", value: "Pro : $450/month" },
        { label: "Duration", value: "12 months" },
        { label: "Payment", value: "Monthly" },
      ];

  return (
    <div className="w-full h-full flex items-center justify-center p-10">
      <div className="w-48 bg-white/[0.08] rounded-lg p-4">
        {lines.map((line, i) => (
          <motion.div
            key={line.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.25 }}
            className="flex items-center justify-between mb-2.5 text-[0.65rem]"
          >
            <span className="text-white/50">{line.label}</span>
            <span className="text-white/90 font-medium">{line.value}</span>
          </motion.div>
        ))}
        <motion.svg
          viewBox="0 0 100 30"
          className="w-full h-8 mt-2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
        >
          <motion.path
            d="M5 20 Q 20 5, 35 18 T 65 15 T 95 10"
            fill="none"
            stroke="#C89A3D"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.svg>
        <p className="text-[0.6rem] text-white/40 text-center mt-1">
          {lang === "fr" ? "Signature électronique" : "Electronic signature"}
        </p>
      </div>
    </div>
  );
}

function TrackStep() {
  const { lang } = useLanguage();
  const items = lang === "fr"
    ? ["Demande reçue", "Prestataire assigné", "Livré"]
    : ["Request received", "Provider assigned", "Delivered"];

  return (
    <div className="w-full h-full flex items-center justify-center p-10">
      <div className="w-full max-w-[220px] space-y-3">
        {items.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-[#C89A3D] flex items-center justify-center shrink-0"
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{ backgroundColor: ["rgba(0,0,0,0)", "#C89A3D", "#C89A3D"] }}
              transition={{ duration: 3, delay: i * 1, repeat: Infinity, repeatDelay: 6 }}
            >
              <motion.svg
                width="10" height="8" viewBox="0 0 10 8"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1] }}
                transition={{ duration: 3, delay: i * 1, repeat: Infinity, repeatDelay: 6 }}
              >
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" fill="none" />
              </motion.svg>
            </motion.div>
            <span className="text-xs text-white/80">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VARIANTS = [SearchStep, MatchStep, ContractStep, TrackStep];

export default function StepVideo({ step }) {
  const Content = VARIANTS[step] || SearchStep;
  return (
    <Chrome>
      <Content />
    </Chrome>
  );
}
