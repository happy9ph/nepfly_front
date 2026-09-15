import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export const LEVEL_TONE = {
  "initiation": "gold",
  "intermédiaire": "clay",
  "tous niveaux": "coffee",
};

// Identifiants négatifs pour ne jamais entrer en conflit avec de vrais
// identifiants venant du backend (autoincrement positif).
export const STATIC_FALLBACK_COURSES = [
  { id: -1, title: "Cybersécurité pour débutants", level: "initiation", description: "Reconnaître les menaces courantes et adopter les bons réflexes pour protéger un poste de travail." },
  { id: -2, title: "Développement mobile avec Flutter", level: "intermédiaire", description: "Construire une application mobile complète, de la première interface jusqu'à la mise en ligne." },
  { id: -3, title: "Design d'interfaces", level: "initiation", description: "Concevoir des écrans clairs et agréables à utiliser, sans expérience préalable requise." },
  { id: -4, title: "Gestion de projet IT", level: "intermédiaire", description: "Cadrer, planifier et livrer un projet informatique dans les délais annoncés." },
  { id: -5, title: "Entrepreneuriat numérique", level: "tous niveaux", description: "Structurer une idée d'entreprise digitale, du modèle économique jusqu'au lancement." },
];

// Association par MOTS-CLÉS détectés dans le titre — plutôt que par
// position — pour que la photo corresponde au vrai contenu du cours, même
// si le backend renvoie des cours dans un ordre ou avec un contenu
// différent des exemples de repli ci-dessus.
const KEYWORD_PHOTOS = [
  { keywords: ["cyber", "sécurité", "securite"], photo: "cybersecurity,code", alt: "Écran affichant du code, illustrant un poste de travail en cybersécurité" },
  { keywords: ["mobile", "flutter", "app"], photo: "mobileapp,coding", alt: "Développement d'une application mobile sur un écran d'ordinateur" },
  { keywords: ["design", "interface", "ui", "ux"], photo: "uidesign,workspace", alt: "Poste de travail de design d'interface avec maquettes à l'écran" },
  { keywords: ["gestion", "projet", "management"], photo: "teammeeting,office", alt: "Équipe en réunion de planification de projet" },
  { keywords: ["entrepreneur", "startup", "business"], photo: "startup,laptop", alt: "Personne travaillant sur un projet entrepreneurial depuis un ordinateur portable" },
  { keywords: ["bureautique", "office", "excel", "word"], photo: "office,computer,work", alt: "Poste de travail bureautique avec ordinateur" },
  { keywords: ["développement", "developpement", "web", "code", "program"], photo: "webdeveloper,code", alt: "Écran de développement web avec du code" },
  { keywords: ["marketing", "communication", "vente"], photo: "marketing,meeting", alt: "Équipe travaillant sur une stratégie marketing" },
  { keywords: ["formation", "formateur", "enseign"], photo: "teacher,classroom,training", alt: "Formateur animant une session de formation" },
];

const GENERIC_FALLBACK = { photo: "training,professional,africa", alt: "Séance de formation professionnelle" };

/** Choisit une photo dont les mots-clés apparaissent dans le titre du
 * cours — un vrai rapprochement par contenu, pas par position dans la
 * liste. */
function photoForCourse(title) {
  const normalized = (title || "").toLowerCase();
  const match = KEYWORD_PHOTOS.find((entry) => entry.keywords.some((k) => normalized.includes(k)));
  const chosen = match || GENERIC_FALLBACK;
  return { photo: `https://loremflickr.com/640/480/${chosen.photo}`, alt: chosen.alt };
}

/** Charge le catalogue de cours (avec repli local si l'API échoue), et
 * enrichit chaque cours avec une photo choisie selon son titre — utilisé
 * à la fois par la section catalogue (Learning.jsx) et par la page de
 * détail d'un cours. */
export function useCourses() {
  const [state, setState] = useState({ status: "loading", courses: [] });

  useEffect(() => {
    let cancelled = false;
    api.learning
      .courses()
      .then((data) => {
        if (cancelled) return;
        const source = data?.length ? data : STATIC_FALLBACK_COURSES;
        const courses = source.map((c) => ({
          ...c,
          text: c.description || c.text,
          ...photoForCourse(c.title),
        }));
        setState({ status: "ready", courses });
      })
      .catch(() => {
        if (cancelled) return;
        const courses = STATIC_FALLBACK_COURSES.map((c) => ({ ...c, ...photoForCourse(c.title) }));
        setState({ status: "ready", courses });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
