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

const STATUS_LABEL = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

export default function ApplicationsTable({ applications, filter, onFilterChange, selectedId, onSelect }) {
  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = STATUS_FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === "all" ? applications.length : applications.filter((a) => a.status === f.key).length;
    return acc;
  }, {});

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-line overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream"
            }`}
          >
            {f.label}
            <span className={`text-xs ${filter === f.key ? "text-cream/70" : "text-ink-faint"}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-soft p-6">Aucune candidature dans cette catégorie.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-soft border-b border-line">
              <th className="px-5 py-3 font-medium">Entreprise</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Catégorie</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Reçue le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelect(app.id)}
                className={`border-b border-line/60 last:border-0 cursor-pointer transition-colors ${
                  selectedId === app.id ? "bg-cream" : "hover:bg-cream/60"
                }`}
              >
                <td className="px-5 py-3.5">
                  <p className="text-ink font-medium">{app.company}</p>
                  <p className="text-ink-soft text-xs mt-0.5">{app.contact_name}</p>
                </td>
                <td className="px-5 py-3.5 text-ink-soft hidden sm:table-cell">{app.category}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[app.status]}`}>
                    {STATUS_LABEL[app.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-ink-soft whitespace-nowrap hidden md:table-cell">
                  {new Date(app.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
