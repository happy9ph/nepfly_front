// Contenu du chatbot — arbre de questions/réponses simple (pas d'IA
// générative côté client), avec des choix rapides plutôt qu'un champ libre
// pour rester prévisible et utile sans backend dédié.
export const CHATBOT = {
  fr: {
    greeting: "Bonjour 👋 Je m'appelle Avila, je peux vous aider à découvrir H-Company. Que cherchez-vous ?",
    fallback: "Je n'ai pas de réponse toute faite pour ça : le plus simple est de nous écrire directement via le formulaire « Rejoindre le réseau », on vous répond vite.",
    goToForm: "Aller au formulaire",
    restart: "Revenir au menu",
    typing: "en train d'écrire…",
    inputPlaceholder: "Tapez un mot-clé (services, prix, partenaires…)",
    menu: [
      { key: "services", label: "Vos services" },
      { key: "pricing", label: "Vos tarifs" },
      { key: "partners", label: "Vos partenaires" },
      { key: "learning", label: "H-learning" },
      { key: "contact", label: "Parler à quelqu'un" },
    ],
    answers: {
      services: "Nous couvrons cinq métiers : cybersécurité, développement web & mobile, design, infrastructure IT et maintenance. Vous pouvez tout voir dans la section Services plus haut sur la page.",
      pricing: "Trois formules mensuelles : Starter à 150 $, Pro à 450 $ (la plus choisie), et Entreprise à 1200 $. Sans engagement de durée.",
      partners: "Notre réseau compte aujourd'hui Lukondo (transport, colis, lodge, argent), Confismila (restaurant), H-learning (formation) et U-Study (app mobile). Chacun a son propre espace.",
      learning: "H-learning propose des parcours courts et pratiques en cybersécurité, développement et design, avec des formateurs internes et partenaires.",
      contact: "Le plus rapide : remplissez le formulaire « Rejoindre le réseau » en bas de page, un membre de l'équipe revient vers vous rapidement.",
    },
  },
  en: {
    greeting: "Hi 👋 I'm Avila, I can help you learn about H-Company. What are you looking for?",
    fallback: "I don't have a ready answer for that : the quickest way is to write to us directly via the \"Join the network\" form, we reply fast.",
    goToForm: "Go to the form",
    restart: "Back to menu",
    typing: "typing…",
    inputPlaceholder: "Type a keyword (services, pricing, partners…)",
    menu: [
      { key: "services", label: "Your services" },
      { key: "pricing", label: "Your pricing" },
      { key: "partners", label: "Your partners" },
      { key: "learning", label: "H-learning" },
      { key: "contact", label: "Talk to someone" },
    ],
    answers: {
      services: "We cover five trades: cybersecurity, web & mobile development, design, IT infrastructure and maintenance. You can see everything in the Services section above.",
      pricing: "Three monthly plans: Starter at $150, Pro at $450 (most popular), and Enterprise at $1200. No long-term commitment.",
      partners: "Our network currently includes Lukondo (transport, parcels, lodging, money transfer), Confismila (restaurant), H-learning (training) and U-Study (mobile app). Each has its own space.",
      learning: "H-learning offers short, practical courses in cybersecurity, development and design, led by in-house and partner trainers.",
      contact: "Fastest way: fill in the \"Join the network\" form at the bottom of the page, a team member will get back to you quickly.",
    },
  },
};

export function matchKeyword(text, lang) {
  const t = text.toLowerCase();
  const dict = {
    fr: {
      services: ["service", "métier", "cybersécurité", "développement", "design", "infrastructure", "maintenance"],
      pricing: ["prix", "tarif", "formule", "abonnement", "coût"],
      partners: ["partenaire", "lukondo", "confismila", "réseau"],
      learning: ["formation", "apprendre", "cours", "h-learning", "learning"],
      contact: ["contact", "parler", "appeler", "email", "rejoindre"],
    },
    en: {
      services: ["service", "trade", "cybersecurity", "development", "design", "infrastructure", "maintenance"],
      pricing: ["price", "pricing", "plan", "subscription", "cost"],
      partners: ["partner", "lukondo", "confismila", "network"],
      learning: ["training", "learn", "course", "h-learning", "learning"],
      contact: ["contact", "talk", "call", "email", "join"],
    },
  };
  const map = dict[lang] || dict.fr;
  for (const key of Object.keys(map)) {
    if (map[key].some((kw) => t.includes(kw))) return key;
  }
  return null;
}
