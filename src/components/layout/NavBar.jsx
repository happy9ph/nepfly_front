import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/Usercontext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NavBar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, isAuthenticated, isLoading, signOut } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu profil au clic en dehors.
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const displayName = user?.full_name || user?.email  || "";
  const initial = displayName ? displayName[0].toUpperCase() : "";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-cream/90 backdrop-blur-sm border-b border-line" : "bg-transparent"
        }`}
      >
        <div className="max-w-content mx-auto flex items-center justify-between px-6 py-5">
          <a href="#top" className="font-display text-xl tracking-tight text-ink">
            H-Company
          </a>

          {isLoading ? (
            <span className="w-9 h-9 rounded-full bg-ink/10 animate-pulse" aria-hidden="true" />
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center pl-1.5  py-1.5 rounded-full border border-ink/20 transition-colors duration-300 hover:bg-ink/[0.04]"
              >
                <span className="w-8 h-8 rounded-full bg-[#C89A3D] text-ink flex items-center justify-center text-xs font-semibold">
                  {initial}
                </span>
                
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-cream border border-line rounded-2xl shadow-lg overflow-hidden py-1"
                >
                  <Link
                    to="/dashboard"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left text-sm text-ink px-4 py-2.5 hover:bg-ink/[0.04] transition-colors"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left text-sm text-ink px-4 py-2.5 hover:bg-ink/[0.04] transition-colors"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/connexion"
              className="text-sm font-medium text-ink border border-ink/20 rounded-full px-5 py-2 transition-colors duration-300 hover:bg-ink hover:text-cream"
            >
              {t("nav.signin")}
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
