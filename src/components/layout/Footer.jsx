
import { Link } from "react-router-dom";
import {
  ArrowUp,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Sun,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import Logo from "../ui/Logo.jsx";

const SOCIALS = [
  { label: "LinkedIn", mark: "in", href: "https://linkedin.com" },
{ label: "X", mark: "X", href: "https://x.com" },
{ label: "Instagram", mark: "IG", href: "https://instagram.com" },
{ label: "Facebook", mark: "f", href: "https://facebook.com" },
{ label: "TikTok", mark: "TT", href: "https://tiktok.com/@hcompany" },
{ label: "WhatsApp", mark: "WA", href: "https://wa.me/260770381780" },
];

const COPY = {
  fr: {
    tagline:
    "Le réseau qui relie entreprises, partenaires et talents autour de la technologie.",
    services: "Services",
    network: "Réseau",
    account: "Votre espace",
    help: "Ressources",
    svc: {
      bus: "H-Transport · Bus",
      parcel: "H-Transport · Colis",
      lodge: "H-Logement",
      food: "H-Restaurant",
      learn: "H-Learning",
      shop: "H-Shopping",
    },
    net: {
      about: "À propos",
      partners: "Partenaires",
      join: "Devenir partenaire",
      interp: "Interprétation",
    },
    acc: {
      signin: "Se connecter",
      signup: "Créer un compte",
      space: "Mon espace",
      trips: "Mes séjours",
      orders: "Mes commandes",
      host: "Devenir hôte",
      sell: "Vendre en ligne",
    },
    res: {
      track: "Suivre un colis",
      courses: "Cours gratuits",
      privacy: "Confidentialité",
      terms: "Conditions d'utilisation",
    },
    location: "Lusaka, Zambie",
    whatsapp: "WhatsApp",
    rights: "Tous droits réservés.",
    madeIn: "Fait à Lusaka, pour tout le réseau.",
    top: "Haut de page",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
  },

  en: {
    tagline:
    "The network connecting companies, partners and talent around technology.",
    services: "Services",
    network: "Network",
    account: "Your space",
    help: "Resources",
    svc: {
      bus: "H-Transport · Bus",
      parcel: "H-Transport · Parcels",
      lodge: "H-Lodging",
      food: "H-Restaurant",
      learn: "H-Learning",
      shop: "H-Shopping",
    },
    net: {
      about: "About",
      partners: "Partners",
      join: "Become a partner",
      interp: "Interpretation",
    },
    acc: {
      signin: "Sign in",
      signup: "Create an account",
      space: "My space",
      trips: "My trips",
      orders: "My orders",
      host: "Become a host",
      sell: "Sell online",
    },
    res: {
      track: "Track a parcel",
      courses: "Free courses",
      privacy: "Privacy",
      terms: "Terms of service",
    },
    location: "Lusaka, Zambia",
    whatsapp: "WhatsApp",
    rights: "All rights reserved.",
    madeIn: "Made in Lusaka, for the whole network.",
    top: "Back to top",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
  },
};

function FootLink({ to, children, external = false }) {
  const className =
  "group inline-flex items-center gap-1 rounded py-1.5 text-sm " +
  "text-cream-fixed/70 transition-colors hover:text-cream-fixed " +
  "focus-visible:outline-2 focus-visible:outline-latte " +
  "focus-visible:outline-offset-2";

    const isExternal =
    external ||
    to.startsWith("mailto:") ||
    to.startsWith("https://");

    if (isExternal) {
      return (
        <a
        href={to}
        className={className}
        {...(to.startsWith("https://")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
          >
          {children}
          </a>
      );
    }

    return (
      <Link to={to} className={className}>
      {children}
      </Link>
    );
}

function Column({ title, children }) {
  return (
    <nav aria-label={title}>
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-latte">
    {title}
    </h3>
    <ul className="space-y-0.5">{children}</ul>
    </nav>
  );
}

function Segmented({ label, children }) {
  return (
    <div
    role="group"
    aria-label={label}
    className="inline-flex items-center gap-0.5 rounded-full border border-cream-fixed/20 p-0.5"
    >
    {children}
    </div>
  );
}

function SegBtn({ active, onClick, label, children }) {
  return (
    <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-latte ${
      active
      ? "bg-cream-fixed text-ink-fixed"
      : "text-cream-fixed/65 hover:text-cream-fixed"
    }`}
    >
    {children}
    </button>
  );
}

export default function Footer() {
  const { lang, switchLanguage } = useLanguage();
  const { mode, setMode } = useTheme();

  const c = COPY[lang] || COPY.fr;

  return (
    <footer
    className="bg-ink-fixed text-cream-fixed"
    aria-label="H-Company"
    >
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
    {/* Main footer */}
    <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-[minmax(0,1fr)_2fr] md:gap-10 lg:gap-16 lg:py-16">
    {/* Brand and contact information */}
    <div className="max-w-sm">
    <Link
    to="/"
    className="inline-flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-latte"
    aria-label="H-Company"
    >
    <Logo size={30} />
    <span className="font-display text-2xl italic">
    H-Company
    </span>
    </Link>

    <p className="mt-4 text-sm leading-7 text-cream-fixed/65">
    {c.tagline}
    </p>

    <ul className="mt-6 space-y-3 text-sm text-cream-fixed/75">
    <li>
    <a
    href="mailto:contact@h-company.com"
    className="inline-flex items-center gap-2.5 transition-colors hover:text-cream-fixed"
    >
    <Mail size={16} className="shrink-0 text-latte" />
    <span>contact@h-company.com</span>
    </a>
    </li>

    <li>
    <a
    href="https://wa.me/260770381780"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2.5 transition-colors hover:text-cream-fixed"
    >
    <MessageCircle
    size={16}
    className="shrink-0 text-latte"
    />
    <span>{c.whatsapp}</span>
    </a>
    </li>

    <li className="inline-flex items-center gap-2.5">
    <MapPin size={16} className="shrink-0 text-latte" />
    <span>{c.location}</span>
    </li>
    </ul>

    {/* Social networks */}
    <ul className="mt-7 flex flex-wrap gap-2">
    {SOCIALS.map((social) => (
      <li key={social.label}>
      <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      title={social.label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-fixed/20 font-display text-sm italic text-cream-fixed/80 transition-colors hover:border-latte hover:text-latte focus-visible:outline-2 focus-visible:outline-latte"
      >
      {social.mark}
      </a>
      </li>
    ))}
    </ul>
    </div>

    {/* Navigation columns */}
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
    <Column title={c.services}>
    <li>
    <FootLink to="/h/transport-bus">{c.svc.bus}</FootLink>
    </li>
    <li>
    <FootLink to="/h/transport-colis">{c.svc.parcel}</FootLink>
    </li>
    <li>
    <FootLink to="/logement">{c.svc.lodge}</FootLink>
    </li>
    <li>
    <FootLink to="/h/restaurant">{c.svc.food}</FootLink>
    </li>
    <li>
    <FootLink to="/formations">{c.svc.learn}</FootLink>
    </li>
    <li>
    <FootLink to="/shopping">{c.svc.shop}</FootLink>
    </li>
    </Column>

    <Column title={c.network}>
    <li>
    <FootLink to="/#about">{c.net.about}</FootLink>
    </li>
    <li>
    <FootLink to="/#explorer">{c.net.partners}</FootLink>
    </li>
    <li>
    <FootLink to="/#rejoindre">{c.net.join}</FootLink>
    </li>
    <li>
    <FootLink to="/interpretation">{c.net.interp}</FootLink>
    </li>
    </Column>

    <Column title={c.account}>
    <li>
    <FootLink to="/connexion">{c.acc.signin}</FootLink>
    </li>
    <li>
    <FootLink to="/creer-un-compte">{c.acc.signup}</FootLink>
    </li>
    <li>
    <FootLink to="/dashboard">{c.acc.space}</FootLink>
    </li>
    <li>
    <FootLink to="/logement/mes-sejours">{c.acc.trips}</FootLink>
    </li>
    <li>
    <FootLink to="/shopping/mes-commandes">
    {c.acc.orders}
    </FootLink>
    </li>
    <li>
    <FootLink to="/logement/hote">{c.acc.host}</FootLink>
    </li>
    <li>
    <FootLink to="/shopping/vendre">{c.acc.sell}</FootLink>
    </li>
    </Column>

    <Column title={c.help}>
    <li>
    <FootLink to="/shopping/suivi">{c.res.track}</FootLink>
    </li>
    <li>
    <FootLink to="/formations#catalogue">
    {c.res.courses}
    </FootLink>
    </li>
    <li>
    <FootLink to="/confidentialite">{c.res.privacy}</FootLink>
    </li>
    <li>
    <FootLink to="/conditions">{c.res.terms}</FootLink>
    </li>
    </Column>
    </div>
    </div>

    {/* Bottom bar */}
    <div className="flex flex-col gap-5 border-t border-cream-fixed/15 py-7 text-xs text-cream-fixed/60 md:flex-row md:items-center md:justify-between">
    <p className="leading-relaxed">
    © {new Date().getFullYear()} H-Company. {c.rights}
    <span className="hidden sm:inline"> · {c.madeIn}</span>
    </p>

    <div className="flex flex-wrap items-center gap-3">
    {/* Theme selector */}
    <Segmented label={c.theme}>
    <SegBtn
    active={mode === "light"}
    onClick={() => setMode("light")}
    label={c.light}
    >
    <Sun size={13} />
    </SegBtn>

    <SegBtn
    active={mode === "dark"}
    onClick={() => setMode("dark")}
    label={c.dark}
    >
    <Moon size={13} />
    </SegBtn>
    </Segmented>

    {/* Language selector */}
    <Segmented label={c.language}>
    <SegBtn
    active={lang === "fr"}
    onClick={() => switchLanguage("fr")}
    label="Français"
    >
    FR
    </SegBtn>

    <SegBtn
    active={lang === "en"}
    onClick={() => switchLanguage("en")}
    label="English"
    >
    EN
    </SegBtn>
    </Segmented>

    {/* Back to top */}
    <button
    type="button"
    onClick={() =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    className="inline-flex items-center gap-1.5 rounded-full border border-cream-fixed/20 px-3.5 py-2 font-medium text-cream-fixed/75 transition-colors hover:border-cream-fixed/40 hover:text-cream-fixed focus-visible:outline-2 focus-visible:outline-latte"
    >
    <ArrowUp size={13} />
    {c.top}
    </button>
    </div>
    </div>
    </div>
    </footer>
  );
}
