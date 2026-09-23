import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { Sun, Moon, Monitor } from "lucide-react";

function NetworkGlyph() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" aria-hidden="true">
      <circle cx="9" cy="21" r="6" fill="var(--hc-coffee)" stroke="var(--hc-gold)" strokeWidth="1.3" />
      <path
        d="M15 21H40M40 21V6H60M40 21V34H60M63 6H90M63 34H90"
        fill="none"
        stroke="var(--hc-line-strong)"
        strokeWidth="1"
        strokeDasharray="1.4 4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="6" r="3" fill="var(--hc-surface)" stroke="var(--hc-gold)" strokeWidth="1.2" />
      <circle cx="60" cy="34" r="3" fill="var(--hc-surface)" stroke="var(--hc-gold)" strokeWidth="1.2" />
      <circle cx="90" cy="6" r="3" fill="var(--hc-surface)" stroke="var(--hc-gold)" strokeWidth="1.2" />
      <circle cx="90" cy="34" r="3" fill="var(--hc-surface)" stroke="var(--hc-gold)" strokeWidth="1.2" />
    </svg>
  );
}

const SOCIALS = [
  { label: "LinkedIn", initial: "in", href: "https://linkedin.com" },
  { label: "X", initial: "X", href: "https://x.com" },
  { label: "Instagram", initial: "IG", href: "https://instagram.com" },
  { label: "Facebook", initial: "f", href: "https://facebook.com" },
];

function SocialMark({ initial }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="16" fill="none" stroke="var(--hc-line-strong)" strokeWidth="1.2" />
      <text x="17" y="21.5" textAnchor="middle" style={{ font: "italic 500 12px 'Instrument Serif', serif", fill: "var(--hc-ink)" }}>
        {initial}
      </text>
    </svg>
  );
}

const COLUMNS = [
  {
    title: "réseau",
    links: [
      { label: "Découvrir", href: "#decouvrir" },
      { label: "Partenaires", href: "#partenaires" },
      { label: "Devenir partenaire", href: "#rejoindre" },
    ],
  },
  {
    title: "apprentissage",
    links: [
      { label: "H-learning", href: "#apprentissage" },
      { label: "Catalogue de cours", href: "#apprentissage" },
    ],
  },
  {
    title: "contact",
    links: [
      { label: "contact@h-company.com", href: "mailto:contact@h-company.com" },
      { label: "Lusaka, Zambie", href: "#" },
    ],
  },
];

function useColumns(t) {
  return [
    {
      title: t("footer.colNetwork"),
      links: [
        { label: t("footer.colDiscover"), href: "#a-propos" },
        { label: t("footer.colPartners"), href: "#partenaires" },
        { label: t("footer.colBecomePartner"), href: "#rejoindre" },
      ],
    },
    {
      title: t("footer.colLearning"),
      links: [
        { label: "H-learning", href: "#apprentissage" },
        { label: t("footer.colCatalog"), href: "#apprentissage" },
      ],
    },
    {
      title: t("footer.colContact"),
      links: [
        { label: "contact@h-company.com", href: "mailto:contact@h-company.com" },
        { label: t("footer.colLocation"), href: "#" },
      ],
    },
  ];
}

function LanguageToggle() {
  const { lang, switchLanguage, t } = useLanguage();
  return (
    <div className="hc-lang-toggle" role="group" aria-label={t("footer.language")}>
      <button
        type="button"
        onClick={() => switchLanguage("fr")}
        aria-pressed={lang === "fr"}
        className="hc-lang-btn"
        data-active={lang === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        aria-pressed={lang === "en"}
        className="hc-lang-btn"
        data-active={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}

const THEME_OPTIONS = [
  { mode: "light", Icon: Sun, label: "Clair" },
  { mode: "dark", Icon: Moon, label: "Sombre" },
  { mode: "system", Icon: Monitor, label: "Auto" },
];

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div className="hc-lang-toggle" role="group" aria-label="Thème">
      {THEME_OPTIONS.map(({ mode: m, Icon, label }) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          aria-label={label}
          title={label}
          className="hc-lang-btn"
          data-active={mode === m}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const COLUMNS = useColumns(t);
  return (
    <footer className="hc-footer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');

        .hc-footer {
          --hc-ink: #10140F;
          --hc-canvas: #F3EEDF;
          --hc-surface: #FFFFFF;
          --hc-coffee: #4A3020;
          --hc-gold: #C89A3D;
          --hc-clay: #A94B32;
          --hc-mist: #656B58;
          --hc-line: #DAD4C2;
          --hc-line-strong: #B9B29B;
          background: var(--hc-surface);
          color: var(--hc-ink);
          font-family: 'Inter', sans-serif;
          padding: 4.5rem 1.5rem 2.5rem;
        }
        .hc-footer-inner { max-width: 68rem; margin: 0 auto; }
        .hc-footer-top {
          display: flex; flex-wrap: wrap; justify-content: space-between;
          gap: 3rem; padding-bottom: 3.5rem;
        }
        .hc-footer-brand { display: flex; flex-direction: column; gap: 1.1rem; }
        .hc-footer-name { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 1.35rem; }
        .hc-footer-tag { font-size: 0.9rem; color: #5C6357; max-width: 22ch; line-height: 1.65; }

        .hc-footer-cols { display: flex; flex-wrap: wrap; gap: 3.5rem; }
        .hc-footer-col-title {
          font-size: 0.8rem; font-weight: 600; color: var(--hc-clay);
          margin-bottom: 1rem;
        }
        .hc-footer-col a {
          display: block; font-size: 0.92rem; color: var(--hc-ink);
          text-decoration: none; margin-bottom: 0.65rem;
        }
        .hc-footer-col a:hover { color: var(--hc-clay); }
        .hc-footer-col a:focus-visible { outline: 2px solid var(--hc-gold); outline-offset: 2px; }

        .hc-footer-socials { display: flex; gap: 0.6rem; margin-top: 0.4rem; }
        .hc-footer-socials a { display: block; transition: transform 0.15s ease; }
        .hc-footer-socials a:hover circle { stroke: var(--hc-gold); }
        .hc-footer-socials a:hover text { fill: var(--hc-clay); }
        .hc-footer-socials a:focus-visible { outline: 2px solid var(--hc-gold); outline-offset: 2px; }

        .hc-footer-bottom {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 1rem; padding-top: 1.75rem; border-top: 1px solid var(--hc-line);
          font-size: 0.82rem; color: var(--hc-mist);
        }

        .hc-lang-toggle {
          display: inline-flex; border: 1px solid var(--hc-line-strong); border-radius: 100px;
          padding: 3px; gap: 2px;
        }
        .hc-lang-btn {
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 600;
          padding: 0.3rem 0.7rem; border-radius: 100px; color: var(--hc-mist);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .hc-lang-btn[data-active="true"] { background: var(--hc-ink); color: var(--hc-canvas); }
        .hc-lang-btn:hover:not([data-active="true"]) { color: var(--hc-ink); }
        .hc-lang-btn:focus-visible { outline: 2px solid var(--hc-gold); outline-offset: 2px; }
      `}</style>

      <div className="hc-footer-inner">
        <div className="hc-footer-top">
          <div className="hc-footer-brand">
            <span className="hc-footer-name">H-Company</span>
            <p className="hc-footer-tag">
              {t("footer.tagline")}
            </p>
            <NetworkGlyph />
            <div className="hc-footer-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <SocialMark initial={s.initial} />
                </a>
              ))}
            </div>
          </div>

          <div className="hc-footer-cols">
            {COLUMNS.map((col) => (
              <div className="hc-footer-col" key={col.title}>
                <p className="hc-footer-col-title">{col.title}</p>
                {col.links.map((l) => (
                  <a key={l.label} href={l.href}>{l.label}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="hc-footer-bottom">
          <span>
            © {new Date().getFullYear()} H-Company. {t("footer.rights")}
            {" · "}
            <Link to="/confidentialite" className="hover:text-ink transition-colors">Confidentialité</Link>
            {" · "}
            <Link to="/conditions" className="hover:text-ink transition-colors">Conditions</Link>
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <span>{t("footer.designedAs")}</span>
        </div>
      </div>
    </footer>
  );
}
