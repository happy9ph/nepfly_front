import { Link } from "react-router-dom";
import { Users, ClipboardList, LogOut } from "lucide-react";

export default function AdminSidebar({ user, onSignOut, view, onViewChange }) {
  const displayName = user?.full_name || user?.email || "";
  const initial = displayName ? displayName[0].toUpperCase() : "";

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-line bg-surface h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-line">
        <Link to="/" className="font-display text-xl text-ink">H-Company</Link>
        <p className="text-xs text-ink-soft mt-1">Espace admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          onClick={() => onViewChange("applications")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            view === "applications" ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream"
          }`}
        >
          <Users size={18} strokeWidth={1.8} />
          Candidatures
        </button>
        <button
          onClick={() => onViewChange("requests")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            view === "requests" ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream"
          }`}
        >
          <ClipboardList size={18} strokeWidth={1.8} />
          Toutes les demandes
        </button>
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <span className="w-8 h-8 rounded-full bg-[#C89A3D] text-ink flex items-center justify-center text-xs font-semibold shrink-0">
            {initial}
          </span>
          <span className="text-sm text-ink truncate">{displayName}</span>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream hover:text-ink transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
