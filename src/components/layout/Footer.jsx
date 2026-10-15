import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Sun,
  Music2,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import Logo from "../ui/Logo.jsx";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    Icon: Linkedin,
  },
{
  label: "Instagram",
  href: "https://instagram.com",
  Icon: Instagram,
},
{
  label: "Facebook",
  href: "https://facebook.com",
  Icon: Facebook,
},
{
  label: "TikTok",
  href: "https://tiktok.com/@hcompany",
  Icon: Music2,
},
{
  label: "WhatsApp",
  href: "https://wa.me/260770381780",
  Icon: MessageCircle,
},
];

function LanguageToggle() {
  const { lang, switchLanguage, t } = useLanguage();

  return (
    <div
    className="hc-footer-switch"
    role="group"
    aria-label={t("footer.language")}
    >
    {["en", "fr"].map((language) => (
      <button
      key={language}
      type="button"
      onClick={() => switchLanguage(language)}
      aria-pressed={lang === language}
      className="hc-footer-switch-btn"
      data-active={lang === language}
      >
      {language.toUpperCase()}
      </button>
    ))}
    </div>
  );
}

function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const options = [
    { value: "light", label: "Clair", Icon: Sun },
    { value: "dark", label: "Sombre", Icon: Moon },
  ];

  return (
    <div className="hc-footer-switch" role="group" aria-label="Thème">
    {options.map(({ value, label, Icon }) => (
      <button
      key={value}
      type="button"
      onClick={() => setMode(value)}
      aria-label={label}
      aria-pressed={mode === value}
      title={label}
      className="hc-footer-switch-btn hc-footer-theme-btn"
      data-active={mode === value}
      >
      <Icon size={15} strokeWidth={1.8} />
      </button>
    ))}
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="hc-footer-column">
    <h3 className="hc-footer-column-title">{title}</h3>

    <ul className="hc-footer-links">
    {links.map(({ label, href, external }) => (
      <li key={label}>
      <a
      href={href}
      {...(external
        ? {
          target: "_blank",
          rel: "noopener noreferrer",
        }
        : {})}
        >
        <span>{label}</span>
        {external && (
          <ArrowUpRight
          size={13}
          className="hc-footer-link-icon"
          aria-hidden="true"
          />
        )}
        </a>
        </li>
    ))}
    </ul>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const { mode } = useTheme();

  const columns = [
    {
      title: t("footer.colNetwork"),
      links: [
        { label: t("footer.colDiscover"), href: "#a-propos" },
        { label: t("footer.colPartners"), href: "#partenaires" },
        {
          label: t("footer.colBecomePartner"),
          href: "#rejoindre",
        },
      ],
    },
    {
      title: t("footer.colLearning"),
      links: [
        { label: "H-learning", href: "#apprentissage" },
        {
          label: t("footer.colCatalog"),
          href: "#apprentissage",
        },
      ],
    },
    {
      title: t("footer.colContact"),
      links: [
        {
          label: "contact@h-company.com",
          href: "mailto:contact@h-company.com",
        },
        {
          label: t("footer.colLocation"),
          href: "https://www.google.com/maps/search/?api=1&query=Lusaka%2C+Zambia",
          external: true,
        },
      ],
    },
  ];

  return (
    <footer
    className="hc-footer"
    data-theme={mode}
    >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

      .hc-footer {
        --f-bg: #f8f7f4;
        --f-panel: #ffffff;
        --f-ink: #20231f;
        --f-muted: #656960;
        --f-line: #e5e4de;
        --f-accent: #987342;
        --f-accent-hover: #76572e;
        --f-control: #eeede7;

        position: relative;
        overflow: hidden;
        padding: 0 24px;
        background: var(--f-bg);
        color: var(--f-ink);
        font-family: 'DM Sans', sans-serif;
        border-top: 1px solid var(--f-line);
        transition:
        background .25s ease,
        color .25s ease;
      }

      .hc-footer[data-theme="dark"] {
        --f-bg: #151714;
        --f-panel: #1c1f1b;
        --f-ink: #f2f0e9;
        --f-muted: #b3b7ac;
        --f-line: #343830;
        --f-accent: #d0ad76;
        --f-accent-hover: #e7c996;
        --f-control: #292d27;
      }

      .hc-footer *,
      .hc-footer *::before,
      .hc-footer *::after {
        box-sizing: border-box;
      }

      .hc-footer a {
        color: inherit;
        text-decoration: none;
      }

      .hc-footer button {
        font: inherit;
      }

      .hc-footer button:focus-visible,
      .hc-footer a:focus-visible {
        outline: 2px solid var(--f-accent);
        outline-offset: 4px;
        border-radius: 4px;
      }

      .hc-footer-inner {
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
      }

      /* Brand section */

      .hc-footer-main {
        display: grid;
        grid-template-columns: minmax(240px, 1.2fr) 2fr;
        gap: 76px;
        padding: 68px 0 54px;
      }

      .hc-footer-brand {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
      }

      .hc-footer-brandmark {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .hc-footer-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        flex-shrink: 0;
        border: 1px solid var(--f-line);
        border-radius: 13px;
        background: var(--f-panel);
      }

      .hc-footer-brand-name {
        font-family: 'Manrope', sans-serif;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -1.1px;
      }

      .hc-footer-brand-name span {
        color: var(--f-accent);
      }

      .hc-footer-description {
        max-width: 310px;
        margin: 22px 0 0;
        color: var(--f-muted);
        font-size: 14px;
        line-height: 1.85;
      }

      .hc-footer-social-label {
        margin: 29px 0 13px;
        color: var(--f-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.4px;
        text-transform: uppercase;
      }

      .hc-footer-socials {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .hc-footer-social {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 39px;
        height: 39px;
        border: 1px solid var(--f-line);
        border-radius: 11px;
        background: var(--f-panel);
        color: var(--f-muted);
        transition:
        transform .2s ease,
        color .2s ease,
        background .2s ease,
        border-color .2s ease;
      }

      .hc-footer-social:hover {
        transform: translateY(-3px);
        color: var(--f-accent);
        border-color: var(--f-accent);
      }

      /* Navigation columns */

      .hc-footer-columns {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 28px;
        padding-top: 8px;
      }

      .hc-footer-column-title {
        margin: 0 0 23px;
        font-family: 'Manrope', sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: -.2px;
      }

      .hc-footer-links {
        display: flex;
        flex-direction: column;
        gap: 17px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .hc-footer-links li {
        min-width: 0;
      }

      .hc-footer-links a {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        color: var(--f-muted);
        font-size: 13px;
        line-height: 1.65;
        overflow-wrap: anywhere;
        transition: color .18s ease;
      }

      .hc-footer-links a:hover {
        color: var(--f-accent);
      }

      .hc-footer-link-icon {
        flex-shrink: 0;
        opacity: 0;
        transform: translate(-3px, 3px);
        transition:
        opacity .18s ease,
        transform .18s ease;
      }

      .hc-footer-links a:hover .hc-footer-link-icon {
        opacity: 1;
        transform: translate(0, 0);
      }

      /* Bottom bar */

      .hc-footer-bottom {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 22px;
        min-height: 82px;
        padding: 19px 0;
        border-top: 1px solid var(--f-line);
      }

      .hc-footer-legal {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px 16px;
        color: var(--f-muted);
        font-size: 11px;
        line-height: 1.8;
      }

      .hc-footer-legal a {
        transition: color .18s ease;
      }

      .hc-footer-legal a:hover {
        color: var(--f-accent);
      }

      .hc-footer-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .hc-footer-switch {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border: 1px solid var(--f-line);
        border-radius: 10px;
        background: var(--f-panel);
      }

      .hc-footer-switch-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 29px;
        padding: 0 8px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--f-muted);
        cursor: pointer;
        font-size: 10px !important;
        font-weight: 700 !important;
        transition:
        color .18s ease,
        background .18s ease;
      }

      .hc-footer-switch-btn[data-active="true"] {
        background: var(--f-control);
        color: var(--f-ink);
      }

      .hc-footer-switch-btn:hover {
        color: var(--f-accent);
      }

      .hc-footer-credit {
        justify-self: end;
        color: var(--f-muted);
        font-size: 11px;
        text-align: right;
      }

      .hc-footer-credit strong {
        color: var(--f-ink);
        font-weight: 700;
      }

      /* Responsive */

      @media (min-width: 1440px) {
        .hc-footer {
          padding-right: 36px;
          padding-left: 36px;
        }
      }

      @media (max-width: 900px) {
        .hc-footer-main {
          grid-template-columns: 1fr;
          gap: 45px;
          padding-top: 52px;
        }

        .hc-footer-description {
          max-width: 430px;
        }

        .hc-footer-columns {
          gap: 32px;
        }

        .hc-footer-bottom {
          grid-template-columns: 1fr auto;
        }

        .hc-footer-controls {
          justify-content: flex-end;
        }

        .hc-footer-credit {
          grid-column: 1 / -1;
          justify-self: start;
          text-align: left;
        }
      }

      @media (max-width: 560px) {
        .hc-footer {
          padding: 0 19px;
        }

        .hc-footer-main {
          gap: 39px;
          padding: 42px 0 35px;
        }

        .hc-footer-brand-name {
          font-size: 20px;
        }

        .hc-footer-columns {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 34px 20px;
        }

        .hc-footer-column:last-child {
          grid-column: 1 / -1;
        }

        .hc-footer-column-title {
          margin-bottom: 17px;
        }

        .hc-footer-links {
          gap: 13px;
        }

        .hc-footer-bottom {
          grid-template-columns: 1fr;
          gap: 18px;
          padding: 23px 0;
        }

        .hc-footer-legal {
          gap: 8px 12px;
        }

        .hc-footer-controls {
          justify-content: flex-start;
        }

        .hc-footer-credit {
          grid-column: auto;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .hc-footer *,
        .hc-footer *::before,
        .hc-footer *::after {
          scroll-behavior: auto !important;
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
      `}</style>

      <div className="hc-footer-inner">
      <div className="hc-footer-main">
      <div className="hc-footer-brand">
      <Link
      to="/"
      className="hc-footer-brandmark"
      aria-label="Hcompany — Accueil"
      >
      <span className="hc-footer-logo">
      <Logo size={29} />
      </span>

      <span className="hc-footer-brand-name">
      H<span>company</span>
      </span>
      </Link>

      <p className="hc-footer-description">
      {t("footer.tagline")}
      </p>

      <p className="hc-footer-social-label">
      {t("footer.followUs") || "Suivez-nous"}
      </p>

      <div className="hc-footer-socials">
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="hc-footer-social"
        >
        <Icon size={17} strokeWidth={1.8} />
        </a>
      ))}
      </div>
      </div>

      <nav
      className="hc-footer-columns"
      aria-label="Navigation de pied de page"
      >
      {columns.map((column) => (
        <FooterColumn
        key={column.title}
        title={column.title}
        links={column.links}
        />
      ))}
      </nav>
      </div>

      <div className="hc-footer-bottom">
      <div className="hc-footer-legal">
      <span>
      © {new Date().getFullYear()} Hcompany.
      {" "}
      {t("footer.rights")}
      </span>

      <Link to="/confidentialite">
      Confidentialité
      </Link>

      <Link to="/conditions">
      Conditions
      </Link>
      </div>

      <div className="hc-footer-controls">
      <ThemeToggle />
      <LanguageToggle />
      </div>

      <div className="hc-footer-credit">
      {t("footer.designedAs")}
      {" "}
      <strong>Hcompany</strong>
      <ArrowRight
      size={12}
      style={{
        display: "inline",
        verticalAlign: "middle",
        marginLeft: 5,
      }}
      aria-hidden="true"
      />
      </div>
      </div>
      </div>
      </footer>
  );
}
