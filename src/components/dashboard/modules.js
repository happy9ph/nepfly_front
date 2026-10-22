import { Bus, GraduationCap, Home, ShoppingBag } from "lucide-react";

/** Modules que le partenaire débloque depuis son dashboard. */
export const MODULES = [
  {
    key: "lodging", icon: Home, route: "/logement/hote",
    fr: { name: "H-Logement", short: "Logement", desc: "Publiez vos logements, gérez calendrier, réservations et revenus.", links: [["Tableau de bord hôte", "/logement/hote"], ["Réservations", "/logement/hote?tab=bookings"], ["Mes logements", "/logement/hote?tab=properties"], ["Revenus", "/logement/hote?tab=earnings"]] },
    en: { name: "H-Lodging", short: "Lodging", desc: "List your properties, manage calendar, bookings and earnings.", links: [["Host dashboard", "/logement/hote"], ["Bookings", "/logement/hote?tab=bookings"], ["My properties", "/logement/hote?tab=properties"], ["Earnings", "/logement/hote?tab=earnings"]] },
  },
  {
    key: "transport", icon: Bus, route: "/transport/agence",
    fr: { name: "H-Transport", short: "Transport", desc: "Programmez vos départs de bus, embarquez par QR et suivez vos revenus.", links: [["Espace agence", "/transport/agence"]] },
    en: { name: "H-Transport", short: "Transport", desc: "Schedule bus departures, board by QR and track earnings.", links: [["Agency space", "/transport/agence"]] },
  },
  {
    key: "shopping", icon: ShoppingBag, route: "/shopping/vendeur",
    fr: { name: "H-Shopping", short: "Boutique", desc: "Ouvrez votre boutique : produits, commandes, promotions et portefeuille.", links: [["Tableau de bord vendeur", "/shopping/vendeur"], ["Commandes", "/shopping/vendeur?onglet=orders"], ["Produits", "/shopping/vendeur?onglet=products"], ["Portefeuille", "/shopping/vendeur?onglet=wallet"]] },
    en: { name: "H-Shopping", short: "Shop", desc: "Open your shop: products, orders, promotions and wallet.", links: [["Seller dashboard", "/shopping/vendeur"], ["Orders", "/shopping/vendeur?onglet=orders"], ["Products", "/shopping/vendeur?onglet=products"], ["Wallet", "/shopping/vendeur?onglet=wallet"]] },
  },
  {
    key: "learning", icon: GraduationCap, route: "/formations/mon-bouquet",
    fr: { name: "H-Learning", short: "Formation", desc: "Formez-vous seul ou formez votre équipe : bouquet individuel ou équipe, membres et accès.", links: [["Voir les bouquets", "/formations/bouquets"], ["Mon bouquet", "/formations/mon-bouquet"]] },
    en: { name: "H-Learning", short: "Learning", desc: "Learn on your own or train your team: individual or team plan, members and access.", links: [["See plans", "/formations/bouquets"], ["My plan", "/formations/mon-bouquet"]] },
  },
];
export const moduleByKey = (k) => MODULES.find((m) => m.key === k);
