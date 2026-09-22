import { Link } from "react-router-dom";
import { Users, ClipboardList, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { key: "applications", label: "Candidatures", hint: "Partenaires", icon: Users },
  { key: "requests", label: "Toutes les demandes", hint: "Apps & paiements", icon: ClipboardList },
];

/**
 * Sidebar admin.
 * - Desktop : colonne fixe à gauche.
 * - Mobile  : barre de navigation fixée en bas (le header mobile du dashboard garde le logo).
 * `counts` est optionnel : { applications: 3, requests: 5 } affiche une pastille à côté de l'entrée.
 */
export default function AdminSidebar({ user, onSignOut, view, onViewChange, counts = {} }) {
  const displayName = user?.full_name || user?.email || "Administrateur";
  const initial = displayName ? displayName[0].toUpperCase() : "A";

  return (
    <>
      {/* ───────── Desktop ───────── */}
      <aside className="hidden md:flex md:w-72 shrink-0 flex-col border-r border-line bg-surface h-screen sticky top-0">
        {/* Marque */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="relative w-10 h-10 rounded-xl bg-ink text-cream flex items-center justify-center font-display text-lg shrink-0 transition-transform group-hover:-rotate-3">
              H
              <span className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-coffee ring-2 ring-surface" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl text-ink leading-tight">H-Company</span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-ink-faint mt-0.5">
                Espace admin
              </span>
            </span>
          </Link>
        </div>

        <div className="mx-6 h-px bg-line" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto" aria-label="Navigation admin">
          <p className="px-3 mb-3 text-[11px] uppercase tracking-[0.16em] text-ink-faint">Gestion</p>
          <ul className="space-y-1.5">
            {NAV_ITEMS.map(({ key, label, hint, icon: Icon }) => {
              const active = view === key;
              const count = counts[key];
              return (
                <li key={key}>
                  <button
                    onClick={() => onViewChange(key)}
                    aria-current={active ? "page" : undefined}
                    className={`group relative w-full flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-xl text-left transition-all ${
                      active ? "bg-cream" : "hover:bg-cream/60"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-coffee transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        active
                          ? "bg-coffee text-white shadow-sm"
                          : "bg-cream/70 text-ink-soft group-hover:text-ink"
                      }`}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-medium truncate ${active ? "text-ink" : "text-ink-soft group-hover:text-ink"}`}>
                        {label}
                      </span>
                      <span className="block text-xs text-ink-faint truncate">{hint}</span>
                    </span>
                    {count > 0 && (
                      <span
                        className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                          active ? "bg-ink text-cream" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Utilisateur */}
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream/50 p-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89A3D] to-coffee text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {initial}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{displayName}</p>
              <p className="text-xs text-ink-faint truncate">Administrateur</p>
            </div>
            <button
              onClick={onSignOut}
              title="Se déconnecter"
              aria-label="Se déconnecter"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:bg-surface hover:text-red-600 transition-colors shrink-0"
            >
              <LogOut size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────── Mobile : barre du bas ───────── */}
      <nav
        aria-label="Navigation admin"
        className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-surface/95 backdrop-blur-md border-t border-line grid grid-cols-2"
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
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-ink" : "text-ink-faint"
              }`}
            >
              <span className={`absolute top-0 h-[2px] w-10 rounded-full bg-coffee transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2 : 1.7} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-coffee text-white text-[10px] font-semibold flex items-center justify-center">
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