import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "annual", label: "Annuel" },
  { value: "one_time", label: "Paiement unique" },
];

const STATUS_LABEL = { proposed: "Envoyée", accepted: "Acceptée", declined: "Déclinée" };

const EMPTY_FORM = { title: "", price: "", duration_months: "12", payment_mode: "monthly", description: "" };

export default function OffersPanel({ offers, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(offers.length === 0);

  const canAddMore = offers.length < 3;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.price) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate({
        title: form.title.trim(),
        price: parseFloat(form.price),
        duration_months: parseInt(form.duration_months, 10),
        payment_mode: form.payment_mode,
        description: form.description.trim() || null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err?.data?.detail || "Impossible d'envoyer cette offre.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-ink-faint text-xs uppercase tracking-wide">Offres ({offers.length}/3)</p>
        {canAddMore && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-medium text-coffee hover:text-coffee-dark"
          >
            <Plus size={14} /> Ajouter
          </button>
        )}
      </div>

      {offers.length > 0 && (
        <div className="space-y-2 mb-4">
          {offers.map((o) => (
            <div key={o.id} className="flex items-center justify-between bg-cream/60 rounded-xl px-4 py-3 text-sm">
              <div>
                <p className="text-ink font-medium">{o.title} : {o.price.toFixed(0)} $</p>
                <p className="text-ink-soft text-xs">{o.duration_months} mois · {PAYMENT_OPTIONS.find(p => p.value === o.payment_mode)?.label}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                o.status === "accepted" ? "bg-coffee/10 text-coffee-dark" : o.status === "declined" ? "bg-line text-ink-faint" : "bg-amber-50 text-amber-700"
              }`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && canAddMore && (
        <form onSubmit={handleSubmit} className="bg-cream/60 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom de l'offre (ex: Pro)"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="col-span-2 text-sm rounded-lg border border-line px-3 py-2 outline-none focus:border-coffee-light"
              required
            />
            <input
              type="number"
              placeholder="Prix ($)"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="text-sm rounded-lg border border-line px-3 py-2 outline-none focus:border-coffee-light"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="Durée (mois)"
              value={form.duration_months}
              onChange={(e) => update("duration_months", e.target.value)}
              className="text-sm rounded-lg border border-line px-3 py-2 outline-none focus:border-coffee-light"
              required
              min="1"
            />
            <select
              value={form.payment_mode}
              onChange={(e) => update("payment_mode", e.target.value)}
              className="col-span-2 text-sm rounded-lg border border-line px-3 py-2 outline-none focus:border-coffee-light bg-surface"
            >
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <textarea
              placeholder="Description (optionnel)"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className="col-span-2 text-sm rounded-lg border border-line px-3 py-2 outline-none focus:border-coffee-light resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-ink text-cream text-xs font-medium px-4 py-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Envoyer l'offre
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-medium text-ink-soft px-4 py-2"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
