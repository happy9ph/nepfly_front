import { Link } from "react-router-dom";
import { Users, ClipboardList, LogOut, ExternalLink } from "lucide-react";

const NAV_ITEMS = [
  { key: "applications", label: "Candidatures", icon: Users },
  { key: "requests", label: "Toutes les demandes", icon: ClipboardList },
];

const GOLD = "#C89A3D";

/**
 * Sidebar admin sombre (style "UptimeRobot") aux couleurs H-Company.
 * `counts` (optionnel) : { applications: 3, requests: 2 } → pastilles.
 */
export default function AdminSidebar({ user, onSignOut, view, onViewChange, counts = {} }) {
  const displayName = user?.full_name || user?.email || "Administrateur";
  const initial = displayName ? displayName[0].toUpperCase() : "A";

  return (
    <>
      {/* ───────── Desktop ───────── */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-ink text-cream h-screen sticky top-0">
        {/* Logo */}
        <div className="px-6 pt-7 pb-8">
          <Link to="/" className="flex items-center gap-2 font-display text-[22px] leading-none tracking-tight">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
            H-Company
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1" aria-label="Navigation admin">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => onViewChange(key)}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-colors ${
                  active ? "bg-white/[0.08] text-cream font-medium" : "text-cream/60 hover:bg-white/[0.04] hover:text-cream"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    active ? "ring-2 ring-offset-2 ring-offset-ink" : ""
                  }`}
                  style={active ? { color: GOLD, "--tw-ring-color": GOLD } : undefined}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className="flex-1 text-left truncate">{label}</span>
                {count > 0 && (
                  <span
                    className="min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center text-ink"
                    style={{ backgroundColor: GOLD }}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Utilisateur */}
        <div className="px-4 pb-6 pt-4 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <span className="relative w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center font-display text-lg shrink-0">
              {initial}
              <span className="absolute right-2.5 bottom-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-cream/50">Administrateur</p>
            </div>
            <button
              onClick={onSignOut}
              title="Se déconnecter"
              aria-label="Se déconnecter"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-cream/50 hover:bg-white/[0.06] hover:text-red-300 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-coffee hover:bg-coffee-dark text-white text-sm font-medium py-3 transition-colors"
          >
            Voir le site
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* ───────── Mobile : barre du bas ───────── */}
      <nav
        aria-label="Navigation admin"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink text-cream grid grid-cols-2 border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-cream" : "text-cream/50"
              }`}
            >
              <span
                className={`absolute top-0 h-[2px] w-10 rounded-full ${active ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundColor: GOLD }}
              />
              <span className="relative" style={active ? { color: GOLD } : undefined}>
                <Icon size={20} strokeWidth={1.8} />
                {count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-ink text-[10px] font-semibold flex items-center justify-center"
                    style={{ backgroundColor: GOLD }}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}