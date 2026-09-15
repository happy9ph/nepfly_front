import { useEffect, useState } from "react";
import { Package, CreditCard, Smartphone, Loader2 } from "lucide-react";

const METHOD_ICON = { card: CreditCard, airtel_money: Smartphone, mtn_momo: Smartphone };
const METHOD_LABEL = { card: "Carte", airtel_money: "Airtel Money", mtn_momo: "MTN MoMo" };

const STATUS_TONE = {
  requested: "bg-amber-50 text-amber-700",
  active: "bg-[#F1EAE0] text-coffee-dark",
  suspended: "bg-red-50 text-red-700",
  rejected: "bg-line text-ink-faint",
  completed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
};

/** Vue agrégée, tous partenaires confondus : demandes d'apps en attente
 * et paiements récents — pour ne pas devoir ouvrir chaque candidature une
 * par une pour voir ce qui nécessite une action. */
export default function AllRequestsPanel({ withAuth, api }) {
  const [apps, setApps] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      withAuth((token) => api.admin.pendingApps(token)).catch(() => []),
      withAuth((token) => api.admin.listPayments(token)).catch(() => []),
    ])
      .then(([pendingApps, allPayments]) => {
        setApps(pendingApps);
        setPayments(allPayments);
      })
      .catch(() => setError("Impossible de charger les demandes."))
      .finally(() => setLoading(false));
  }, [withAuth, api]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={16} className="animate-spin" />
        Chargement des demandes…
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl text-ink mb-1">Demandes d'apps en attente</h2>
        <p className="text-sm text-ink-soft mb-5">
          {apps.length} demande{apps.length !== 1 ? "s" : ""} à traiter, tous partenaires confondus.
        </p>
        {apps.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-6">
            <p className="text-sm text-ink-soft">Aucune demande d'app en attente pour l'instant.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <div key={app.id} className="bg-surface border border-line rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="w-9 h-9 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee shrink-0">
                    <Package size={16} />
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_TONE[app.status]}`}>
                    En attente
                  </span>
                </div>
                <p className="font-display text-lg text-ink mb-1">{app.name}</p>
                {app.description && <p className="text-sm text-stone">{app.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl text-ink mb-1">Paiements récents</h2>
        <p className="text-sm text-ink-soft mb-5">
          {payments.length} paiement{payments.length !== 1 ? "s" : ""} enregistré{payments.length !== 1 ? "s" : ""}, tous partenaires confondus.
        </p>
        {payments.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-6">
            <p className="text-sm text-ink-soft">Aucun paiement enregistré pour l'instant.</p>
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-faint uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Référence</th>
                  <th className="px-5 py-3 font-medium">Méthode</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const Icon = METHOD_ICON[p.method] || CreditCard;
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 font-mono text-xs text-ink">{p.reference}</td>
                      <td className="px-5 py-3 text-ink-soft">
                        <span className="flex items-center gap-1.5">
                          <Icon size={13} />
                          {METHOD_LABEL[p.method] || p.method}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink font-medium">{p.amount.toFixed(0)} $</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_TONE[p.status]}`}>
                          {p.status === "completed" ? "Complété" : p.status === "pending" ? "En attente" : "Échoué"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-faint text-xs">
                        {new Date(p.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
