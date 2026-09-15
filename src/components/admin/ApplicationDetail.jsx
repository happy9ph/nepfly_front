import { useEffect, useState } from "react";
import { Check, X, Send, Loader2 } from "lucide-react";
import OffersPanel from "./OffersPanel.jsx";
import PartnerAppsPanel from "./PartnerAppsPanel.jsx";

const STATUS_LABEL = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

export default function ApplicationDetail({ application, contract, offers, onApprove, onReject, onSaveContract, onCreateOffer, withAuth, api }) {
  const [draft, setDraft] = useState(contract?.content || "");
  const [saving, setSaving] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setDraft(contract?.content || "");
    setFeedback(null);
  }, [contract?.id, application?.id]);

  if (!application) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-10 text-center text-sm text-ink-soft h-full flex items-center justify-center">
        Sélectionnez une candidature dans la liste pour voir le détail.
      </div>
    );
  }

  async function handleDecision(status) {
    setDeciding(true);
    setFeedback(null);
    try {
      await (status === "approved" ? onApprove() : onReject());
      setFeedback({ type: "success", text: status === "approved" ? "Candidature approuvée." : "Candidature rejetée." });
    } catch (err) {
      setFeedback({ type: "error", text: err?.data?.detail || "Une erreur est survenue." });
    } finally {
      setDeciding(false);
    }
  }

  async function handleSaveContract() {
    setSaving(true);
    setFeedback(null);
    try {
      await onSaveContract(draft);
      setFeedback({ type: "success", text: "Contrat mis à jour : visible immédiatement dans le dashboard du partenaire." });
    } catch (err) {
      setFeedback({ type: "error", text: err?.data?.detail || "Impossible d'enregistrer le contrat." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-2xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-ink">{application.company}</h2>
          <p className="text-sm text-ink-soft mt-0.5">{application.contact_name} · {application.email}</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream text-ink-soft whitespace-nowrap">
          {STATUS_LABEL[application.status]}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-faint text-xs uppercase tracking-wide mb-1">Domaine</p>
          <p className="text-ink">{application.category}</p>
        </div>
        <div>
          <p className="text-ink-faint text-xs uppercase tracking-wide mb-1">Reçue le</p>
          <p className="text-ink">{new Date(application.created_at).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      {application.message && (
        <div>
          <p className="text-ink-faint text-xs uppercase tracking-wide mb-1.5">Message</p>
          <p className="text-sm text-ink-soft bg-cream/60 rounded-xl p-4 leading-relaxed">{application.message}</p>
        </div>
      )}

      <OffersPanel offers={offers || []} onCreate={(payload) => onCreateOffer(payload)} />

      {application.status === "pending" && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleDecision("approved")}
            disabled={deciding}
            className="flex items-center gap-2 rounded-full bg-coffee text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60 hover:bg-coffee-dark transition-colors"
          >
            {deciding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Approuver
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            disabled={deciding}
            className="flex items-center gap-2 rounded-full border border-line text-ink-soft text-sm font-medium px-5 py-2.5 disabled:opacity-60 hover:bg-cream transition-colors"
          >
            <X size={16} />
            Rejeter
          </button>
        </div>
      )}

      {application.status === "approved" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-ink-faint text-xs uppercase tracking-wide">Contrat envoyé au partenaire</p>
            {contract?.status === "signed" && (
              <span className="text-xs font-medium text-coffee-dark">
                Signé le {new Date(contract.signed_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={contract?.status === "signed"}
            rows={9}
            className="w-full text-sm text-ink bg-cream/60 rounded-xl p-4 leading-relaxed border border-transparent focus:border-coffee-light outline-none disabled:opacity-70 resize-y font-sans"
          />
          {contract?.status !== "signed" && (
            <button
              onClick={handleSaveContract}
              disabled={saving || draft === contract?.content}
              className="mt-3 flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-5 py-2.5 disabled:opacity-40 hover:bg-coffee-dark transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Enregistrer et envoyer au partenaire
            </button>
          )}
        </div>
      )}

      {application.status === "approved" && (
        <div className="pt-5 mt-5 border-t border-line">
          <p className="text-ink-faint text-xs uppercase tracking-wide mb-3">Apps du partenaire</p>
          <PartnerAppsPanel applicationId={application.id} withAuth={withAuth} api={api} />
        </div>
      )}

      {feedback && (
        <p className={`text-sm ${feedback.type === "success" ? "text-coffee-dark" : "text-red-600"}`}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}
