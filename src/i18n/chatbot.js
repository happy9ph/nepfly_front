// Contenu du chatbot Avila.
// - Les raccourcis du menu répondent instantanément avec les textes ci-dessous.
// - Les questions libres partent vers le backend (/chat), qui répond avec
//   l'IA à partir de la fiche H-Company. Si le backend ne répond pas, on
//   retombe sur la recherche par mots-clés, puis sur `fallback`.
export const CHATBOT = {
  fr: {
    greeting: "Bonjour 👋 Je m'appelle Avila. Posez-moi n'importe quelle question sur H-Company, nos services, nos tarifs ou nos partenaires, ou choisissez un sujet dans le menu ☰.",
    fallback: "Je n'arrive pas à répondre pour le moment. Le plus simple est de nous écrire via le formulaire « Rejoindre le réseau », on vous répond vite.",
    error: "Petit souci de connexion de mon côté. Voici ce que je peux vous dire :",
    rateLimited: "Vous m'avez envoyé beaucoup de messages d'un coup 😅 Réessayez dans quelques minutes.",
    goToForm: "Aller au formulaire",
    restart: "Nouvelle conversation",
    typing: "Avila écrit…",
    inputPlaceholder: "Posez votre question…",
    menu: [
      { key: "services", label: "Vos services" },
      { key: "pricing", label: "Vos tarifs" },
      { key: "partners", label: "Vos partenaires" },
      { key: "join", label: "Devenir partenaire" },
      { key: "learning", label: "H-learning" },
      { key: "contact", label: "Parler à quelqu'un" },
    ],
    answers: {
      services: "Nous couvrons cinq métiers : cybersécurité, développement web & mobile, design, infrastructure IT et maintenance. Vous pouvez tout voir dans la section Services plus haut sur la page.",
      pricing: "Trois formules mensuelles : Starter à 150 $, Pro à 450 $ (la plus choisie), et Entreprise à 1200 $. Sans engagement de durée.",
      partners: "Notre réseau compte aujourd'hui Lukondo (transport, colis, lodge, argent), Confismila (restaurant), H-learning (formation) et U-Study (app mobile). Chacun a son propre espace.",
      join: "Pour une agence, l'outil est gratuit : nous prenons seulement une commission sur les nouveaux clients que nous vous apportons, sans coût ni engagement. Remplissez le formulaire « Rejoindre le réseau » pour candidater.",
      learning: "H-learning propose des parcours courts et pratiques en cybersécurité, développement et design, avec des formateurs internes et partenaires.",
      contact: "Le plus rapide : remplissez le formulaire « Rejoindre le réseau » en bas de page, un membre de l'équipe revient vers vous rapidement.",
    },
    ctaKeys: ["contact", "join"],
  },
  en: {
    greeting: "Hi 👋 I'm Avila. Ask me anything about H-Company, our services, pricing or partners, or pick a topic from the ☰ menu.",
    fallback: "I can't answer right now. The quickest way is to write to us via the \"Join the network\" form, we reply fast.",
    error: "I'm having a small connection issue. Here's what I can tell you:",
    rateLimited: "That's a lot of messages at once 😅 Please try again in a few minutes.",
    goToForm: "Go to the form",
    restart: "New conversation",
    typing: "Avila is typing…",
    inputPlaceholder: "Ask your question…",
    menu: [
      { key: "services", label: "Your services" },
      { key: "pricing", label: "Your pricing" },
      { key: "partners", label: "Your partners" },
      { key: "join", label: "Become a partner" },
      { key: "learning", label: "H-learning" },
      { key: "contact", label: "Talk to someone" },
    ],
    answers: {
      services: "We cover five trades: cybersecurity, web & mobile development, design, IT infrastructure and maintenance. You can see everything in the Services section above.",
      pricing: "Three monthly plans: Starter at $150, Pro at $450 (most popular), and Enterprise at $1200. No long-term commitment.",
      partners: "Our network currently includes Lukondo (transport, parcels, lodging, money transfer), Confismila (restaurant), H-learning (training) and U-Study (mobile app). Each has its own space.",
      join: "For agencies the tool is free: we only take a commission on new clients we bring you, with no cost or commitment. Fill in the \"Join the network\" form to apply.",
      learning: "H-learning offers short, practical courses in cybersecurity, development and design, led by in-house and partner trainers.",
      contact: "Fastest way: fill in the \"Join the network\" form at the bottom of the page, a team member will get back to you quickly.",
    },
    ctaKeys: ["contact", "join"],
  },
};

// Adresse du backend FastAPI (Render). Mets la même variable que dans lib/api.js.
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Envoie la conversation au backend et renvoie { reply, showForm }.
 * history : [{ from: "user" | "bot", text }]
 */
export async function askAvila(history, lang, { signal } = {}) {
  const messages = history
    .filter((m) => m.text)
    .slice(-20)
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text.slice(0, 2000) }));

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, lang: lang === "en" ? "en" : "fr" }),
    signal,
  });
  if (!res.ok) {
    const err = new Error(`chat ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return { reply: data.reply, showForm: !!data.show_form };
}

/** Secours hors ligne : trouve un sujet par mots-clés. */
export function matchKeyword(text, lang) {
  const t = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // ignore les accents
  const dict = {
    fr: {
      pricing: ["prix", "tarif", "formule", "abonnement", "cout", "combien", "payer"],
      join: ["devenir partenaire", "agence", "commission", "candidat", "inscrire", "adherer"],
      partners: ["partenaire", "lukondo", "confismila", "u-study", "ustudy", "reseau", "colis", "bus", "lodge", "restaurant", "transfert"],
      learning: ["formation", "apprendre", "cours", "h-learning", "learning"],
      services: ["service", "metier", "cybersecurite", "developpement", "design", "infrastructure", "maintenance", "site", "application"],
      contact: ["contact", "parler", "appeler", "email", "rejoindre", "joindre", "telephone"],
    },
    en: {
      pricing: ["price", "pricing", "plan", "subscription", "cost", "how much", "pay"],
      join: ["become a partner", "agency", "commission", "apply", "sign up"],
      partners: ["partner", "lukondo", "confismila", "u-study", "ustudy", "network", "parcel", "bus", "lodge", "restaurant", "transfer"],
      learning: ["training", "learn", "course", "h-learning", "learning"],
      services: ["service", "trade", "cybersecurity", "development", "design", "infrastructure", "maintenance", "website", "app"],
      contact: ["contact", "talk", "call", "email", "join", "phone"],
    },
  };
  const map = dict[lang] || dict.fr;
  for (const key of Object.keys(map)) {
    if (map[key].some((kw) => t.includes(kw))) return key;
  }
  return null;
}