import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Skeleton } from "./Skeleton.jsx";

/** Squelette générique "centré" — pour les sections avec un titre centré
 * et un contenu qui suit (Marketplace, Interpretation, Impact, FAQ...). */
function CenterSkeleton({ minHeight }) {
  return (
    <div className="px-6 py-28" style={{ minHeight }}>
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4 mb-14">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="max-w-content mx-auto grid sm:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Squelette "grille de cartes" — pour Services, Learning, Partners. */
function GridSkeleton({ minHeight }) {
  return (
    <div className="px-6 py-28 max-w-content mx-auto" style={{ minHeight }}>
      <div className="flex flex-col items-center gap-4 mb-14">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full max-w-md" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 5].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Squelette "deux colonnes" — pour About, JoinForm. */
function SplitSkeleton({ minHeight }) {
  return (
    <div className="px-6 py-28 max-w-content mx-auto grid md:grid-cols-2 gap-12" style={{ minHeight }}>
      <div className="space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Squelette "hero" — bandeau + titre centré + panneaux flottants, pour
 * la toute première section vue au chargement. */
function HeroSkeleton({ minHeight }) {
  return (
    <div className="px-6 pt-36 pb-20 max-w-content mx-auto" style={{ minHeight }}>
      <div className="flex flex-col items-center gap-5 mb-16">
        <Skeleton className="h-6 w-56 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-12 w-3/4 max-w-lg" />
        <Skeleton className="h-4 w-2/3 max-w-md mt-2" />
        <Skeleton className="h-12 w-44 rounded-full mt-4" />
      </div>
      <div className="hidden md:flex justify-between px-8">
        <Skeleton className="h-40 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-64 rounded-2xl" />
      </div>
    </div>
  );
}

const ARCHETYPES = { center: CenterSkeleton, grid: GridSkeleton, split: SplitSkeleton, hero: HeroSkeleton };

/**
 * Enveloppe une section : affiche d'abord un squelette généré selon
 * `variant`, puis révèle le vrai contenu (`children`) une fois la section
 * entrée dans le viewport — avec un court délai volontaire pour que le
 * chargement "section par section" se voie réellement pendant le premier
 * défilement, plutôt qu'un unique écran de chargement avant tout le site.
 */
const SESSION_FLAG = "hc_home_seen";

export default function SectionReveal({ children, variant = "center", delay = 0.4 }) {
  const ref = useRef(null);
  const measureRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  // Si le site a déjà été visité pendant cette session (navigateur ouvert,
  // même onglet), on saute directement le squelette — il ne doit
  // apparaître qu'une fois, à la toute première entrée sur le site, pas
  // à chaque fois qu'on revient sur la page d'accueil (après une
  // connexion, ou depuis une autre page du site).
  const alreadySeen = (() => {
    try {
      return sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      return false;
    }
  })();
  const [revealed, setRevealed] = useState(alreadySeen);
  // Hauteur réelle du contenu, mesurée en arrière-plan (invisible) pendant
  // que le squelette est affiché — évite le "saut" de mise en page qui se
  // produisait avant, quand la hauteur du squelette (générique, estimée)
  // ne correspondait pas à la vraie hauteur du contenu final.
  const [measuredHeight, setMeasuredHeight] = useState(null);

  useLayoutEffect(() => {
    if (revealed || alreadySeen) return;
    if (measureRef.current) {
      setMeasuredHeight(measureRef.current.offsetHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (alreadySeen || !inView) return;
    const timer = setTimeout(() => setRevealed(true), delay * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, delay]);

  const SkeletonComponent = ARCHETYPES[variant] || CenterSkeleton;

  return (
    <div ref={ref} className="relative">
      {!revealed && (
        <div
          ref={measureRef}
          style={{ position: "absolute", top: 0, left: 0, right: 0, visibility: "hidden", pointerEvents: "none", zIndex: -1 }}
          aria-hidden="true"
        >
          {children}
        </div>
      )}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <SkeletonComponent minHeight={measuredHeight ? `${measuredHeight}px` : "auto"} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
