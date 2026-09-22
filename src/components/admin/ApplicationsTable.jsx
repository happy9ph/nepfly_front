import { useMemo, useState } from "react";
import { Search, Inbox, ChevronRight, X } from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvées" },
  { key: "rejected", label: "Rejetées" },
];

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-[#F1EAE0] text-coffee-dark border-coffee-light",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_DOT = {
  pending: "bg-amber-500",
  approved: "bg-coffee",
  rejected: "bg-red-500",
};

const STATUS_LABEL = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApplicationsTable({ applications, filter, onFilterChange, selectedId, onSelect }) {
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () =>
      STATUS_FILTERS.reduce((acc, f) => {
        acc[f.key] = f.key === "all" ? applications.length : applications.filter((a) => a.status === f.key).length;
        return acc;
      }, {}),
    [applications]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => filter === "all" || a.status === filter)
      .filter(
        (a) =>
          !q ||
          [a.company, a.contact_name, a.category, a.email].some((v) => v?.toLowerCase().includes(q))
      );
  }, [applications, filter, query]);

  function handleKey(e, id) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Barre d'outils */}
      <div className="p-3 border-b border-line flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
        <div className="flex gap-1 p-1 bg-cream/70 rounded-xl overflow-x-auto" role="tablist">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  active ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                }`}
              >
                {f.key !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[f.key]}`} />}
                {f.label}
                <span
                  className={`text-[11px] min-w-[20px] px-1.5 py-0.5 rounded-full ${
                    active ? "bg-ink text-cream" : "bg-line/70 text-ink-faint"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative flex items-center xl:w-56">
          <Search size={15} className="absolute left-3 text-ink-faint pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full text-sm bg-cream/50 border border-line rounded-xl pl-9 pr-8 py-2 outline-none placeholder:text-ink-faint focus:border-coffee-light focus:bg-surface transition-colors [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 w-5 h-5 rounded-full flex items-center justify-center text-ink-faint hover:bg-line hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-14">
          <span className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-ink-faint mb-3">
            <Inbox size={22} strokeWidth={1.6} />
          </span>
          <p className="text-sm font-medium text-ink">
            {query ? "Aucun résultat" : "Aucune candidature ici"}
          </p>
          <p className="text-xs text-ink-soft mt-1">
            {query ? `Rien ne correspond à « ${query} ».` : "Les nouvelles candidatures apparaîtront dans cette liste."}
          </p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-ink-faint bg-cream/30 border-b border-line">
              <th className="px-5 py-3 font-medium">Entreprise</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Catégorie</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Reçue le</th>
              <th className="w-8 hidden sm:table-cell" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => {
              const selected = selectedId === app.id;
              return (
                <tr
                  key={app.id}
                  tabIndex={0}
                  aria-selected={selected}
                  onClick={() => onSelect(app.id)}
                  onKeyDown={(e) => handleKey(e, app.id)}
                  className={`group border-b border-line/60 last:border-0 cursor-pointer transition-colors outline-none focus-visible:bg-cream/80 ${
                    selected ? "bg-cream" : "hover:bg-cream/50"
                  }`}
                >
                  <td className="relative px-5 py-3.5">
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-coffee transition-opacity ${
                        selected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-display text-base shrink-0 transition-colors ${
                          selected ? "bg-coffee text-white" : "bg-cream text-coffee-dark"
                        }`}
                      >
                        {app.company?.[0]?.toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-ink font-medium truncate">{app.company}</p>
                        <p className="text-ink-soft text-xs mt-0.5 truncate">
                          {app.contact_name}
                          <span className="sm:hidden"> · {app.category}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="inline-block text-xs text-ink-soft bg-cream/80 border border-line rounded-lg px-2 py-1 max-w-[160px] truncate align-middle">
                      {app.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_BADGE[app.status]}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[app.status]}`} />
                      {STATUS_LABEL[app.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft text-xs whitespace-nowrap hidden md:table-cell">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="pr-4 hidden sm:table-cell">
                    <ChevronRight
                      size={16}
                      className={`text-ink-faint transition-all ${
                        selected ? "opacity-100 text-coffee" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}