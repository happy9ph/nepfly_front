import { useEffect, useState } from "react";
import { Check, X, DollarSign, Loader2 } from "lucide-react";

const STATUS_TONE = {
  requested: "bg-amber-50 text-amber-700",
  active: "bg-[#F1EAE0] text-coffee-dark",
  suspended: "bg-red-50 text-red-700",
  rejected: "bg-line text-ink-faint",
};

const STATUS_LABEL = {
  requested: "En attente",
  active: "Active",
  suspended: "Suspendue",
  rejected: "Refusée",
};

export default function PartnerAppsPanel({ applicationId, withAuth, api }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueFormFor, setRevenueFormFor] = useState(null);
  const [amount, setAmount] = useState("");
  const [commission, setCommission] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await withAuth((token) => api.admin.listPartnerApps(token, applicationId));
      setApps(data);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function updateStatus(appId, status) {
    setBusyId(appId);
    try {
      await withAuth((token) => api.admin.updateAppStatus(token, appId, status));
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function submitRevenue(e, appId) {
    e.preventDefault();
    if (!amount) return;
    setBusyId(appId);
    try {
      await withAuth((token) =>
        api.admin.addRevenue(token, appId, {
          amount: parseFloat(amount),
          commission_amount: parseFloat(commission || 0),
          description: null,
        })
      );
      setAmount("");
      setCommission("");
      setRevenueFormFor(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-xs text-ink-faint">Chargement des apps…</p>;
  if (apps.length === 0) return <p className="text-xs text-ink-faint">Aucune app pour ce partenaire.</p>;

  return (
    <div className="space-y-2">
      {apps.map((app) => (
        <div key={app.id} className="border border-line rounded-xl p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-medium text-ink">{app.name}</p>
              <p className="text-xs text-ink-soft">
                {app.total_revenue.toFixed(0)} $ revenu · {app.total_owed.toFixed(0)} $ dû
              </p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_TONE[app.status]}`}>
              {STATUS_LABEL[app.status]}
            </span>
          </div>

          <div className="flex gap-2 mt-2">
            {app.status === "requested" && (
              <>
                <button
                  onClick={() => updateStatus(app.id, "active")}
                  disabled={busyId === app.id}
                  className="flex items-center gap-1 text-xs font-medium text-coffee-dark hover:underline disabled:opacity-50"
                >
                  {busyId === app.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Approuver
                </button>
                <button
                  onClick={() => updateStatus(app.id, "rejected")}
                  disabled={busyId === app.id}
                  className="flex items-center gap-1 text-xs font-medium text-ink-faint hover:underline disabled:opacity-50"
                >
                  <X size={12} />
                  Refuser
                </button>
              </>
            )}
            {app.status === "active" && (
              <button
                onClick={() => setRevenueFormFor(revenueFormFor === app.id ? null : app.id)}
                className="flex items-center gap-1 text-xs font-medium text-coffee-dark hover:underline"
              >
                <DollarSign size={12} />
                Ajouter un revenu
              </button>
            )}
          </div>

          {revenueFormFor === app.id && (
            <form onSubmit={(e) => submitRevenue(e, app.id)} className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Montant $"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 border border-line rounded-lg px-2 py-1 text-xs outline-none"
              />
              <input
                type="number"
                placeholder="Commission $"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-28 border border-line rounded-lg px-2 py-1 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={busyId === app.id}
                className="text-xs font-medium bg-ink text-cream rounded-lg px-3 py-1 disabled:opacity-50"
              >
                Ajouter
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
