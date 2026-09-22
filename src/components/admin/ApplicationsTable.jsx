import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, ChevronDown, Eye, Clock, Check, X, MoreHorizontal, Inbox } from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "Tous les statuts" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvées" },
  { key: "rejected", label: "Rejetées" },
];

const SORTS = [
  { key: "pending_first", label: "En attente d'abord" },
  { key: "recent", label: "Plus récentes" },
  { key: "oldest", label: "Plus anciennes" },
  { key: "name", label: "Nom A → Z" },
];

const STATUS = {
  pending: { label: "En attente", icon: Clock, halo: "bg-amber-100", dot: "bg-amber-500", text: "text-amber-700", bar: "bg-amber-400", filled: 6, step: "Reçue" },
  approved: { label: "Approuvée", icon: Check, halo: "bg-[#F1EAE0]", dot: "bg-coffee", text: "text-coffee-dark", bar: "bg-coffee", filled: 12, step: "Contrat" },
  rejected: { label: "Rejetée", icon: X, halo: "bg-red-100", dot: "bg-red-500", text: "text-red-600", bar: "bg-red-400", filled: 18, step: "Rejetée" },
};

const BAR_COUNT = 18;

export function timeAgo(value) {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${Math.max(min, 1)} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} j`;
  return `${Math.floor(d / 30)} mois`;
}

/** Petit sélecteur façon "pill" basé sur un <select> natif (accessible et léger). */
function PillSelect({ icon: Icon, value, onChange, options, className = "" }) {
  return (
    <label className={`relative flex items-center ${className}`}>
      <Icon size={14} className="absolute left-3 text-ink-soft pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-surface border border-line rounded-xl pl-8 pr-8 py-2.5 text-sm text-ink outline-none cursor-pointer hover:border-coffee-light focus:border-coffee-light transition-colors"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 text-ink-soft pointer-events-none" />
    </label>
  );
}

export default function ApplicationsTable({ applications, filter, onFilterChange, selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("pending_first");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = applications
      .filter((a) => filter === "all" || a.status === filter)
      .filter((a) => !q || [a.company, a.contact_name, a.category, a.email].some((v) => v?.toLowerCase().includes(q)));

    const byDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
    return [...list].sort((a, b) => {
      if (sort === "recent") return byDate(a, b);
      if (sort === "oldest") return -byDate(a, b);
      if (sort === "name") return (a.company || "").localeCompare(b.company || "", "fr");
      // pending_first
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return byDate(a, b);
    });
  }, [applications, filter, query, sort]);

  function handleKey(e, id) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  }

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="flex items-center gap-2 bg-surface border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink">
          <span className="w-3.5 h-3.5 rounded border border-line bg-cream" />
          <span className="tabular-nums">
            {rows.length}<span className="text-ink-faint"> / {applications.length}</span>
          </span>
        </span>
        <PillSelect icon={Filter} value={filter} onChange={onFilterChange} options={STATUS_FILTERS} />

        <div className="flex-1 min-w-[12px]" />

        <label className="relative flex items-center w-full sm:w-60 order-last sm:order-none">
          <Search size={14} className="absolute left-3 text-ink-faint pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un partenaire…"
            className="w-full bg-surface border border-line rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-coffee-light transition-colors"
          />
        </label>
        <PillSelect icon={ArrowUpDown} value={sort} onChange={setSort} options={SORTS} className="sm:w-52" />
      </div>

      {/* Liste */}
      {rows.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl px-6 py-14 text-center">
          <Inbox size={22} className="mx-auto text-ink-faint mb-3" strokeWidth={1.6} />
          <p className="text-sm font-medium text-ink">{query ? "Aucun résultat" : "Aucune candidature ici"}</p>
          <p className="text-xs text-ink-soft mt-1">
            {query ? `Rien ne correspond à « ${query} ».` : "Les nouvelles candidatures apparaîtront ici."}
          </p>
        </div>
      ) : (
        <ul className="bg-surface border border-line rounded-2xl overflow-hidden divide-y divide-line">
          {rows.map((app) => {
            const st = STATUS[app.status] || STATUS.pending;
            const Icon = st.icon;
            const selected = selectedId === app.id;
            return (
              <li
                key={app.id}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={() => onSelect(app.id)}
                onKeyDown={(e) => handleKey(e, app.id)}
                className={`group flex items-center gap-3 sm:gap-4 px-4 py-3.5 cursor-pointer outline-none transition-colors focus-visible:bg-cream ${
                  selected ? "bg-cream" : "hover:bg-cream/50"
                }`}
              >
                {/* Icône de statut avec halo */}
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${st.halo}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${st.dot}`}>
                    <Icon size={11} strokeWidth={3} />
                  </span>
                </span>

                {/* Nom + méta */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-ink font-medium truncate">{app.company}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-ink-soft min-w-0">
                    <span className="shrink-0 uppercase tracking-wide text-[10px] font-medium border border-line rounded px-1.5 py-px bg-cream/60 max-w-[120px] truncate">
                      {app.category}
                    </span>
                    <span className="truncate">
                      <span className={st.text}>{st.label}</span> · {app.contact_name}
                    </span>
                  </div>
                </div>

                {/* Action rapide */}
                {app.status === "pending" && (
                  <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-cream bg-ink rounded-full px-3 py-1.5 shrink-0">
                    <Eye size={13} /> À traiter
                  </span>
                )}

                {/* Ancienneté */}
                <span className="hidden lg:flex items-center gap-1.5 text-xs text-ink-faint w-16 shrink-0" title={new Date(app.created_at).toLocaleString("fr-FR")}>
                  <Clock size={12} />
                  {timeAgo(app.created_at)}
                </span>

                {/* Barre de progression façon "uptime" */}
                <div className="hidden sm:block shrink-0 text-right">
                  <div className="flex gap-[2px]">
                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                      <span key={i} className={`w-[4px] h-4 rounded-[1px] ${i < st.filled ? st.bar : "bg-line"}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-soft mt-1">{st.step}</p>
                </div>

                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint group-hover:text-ink group-hover:bg-surface shrink-0">
                  <MoreHorizontal size={16} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}