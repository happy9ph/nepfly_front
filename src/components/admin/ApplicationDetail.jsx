import { useEffect, useState } from "react";
import {
  Check, X, Send, Loader2, Mail, Calendar, Tag, FileText, CheckCircle2,
  AlertCircle, Package, MousePointerClick, Gavel, BadgePercent,
} from "lucide-react";
import OffersPanel from "./OffersPanel.jsx";
import PartnerAppsPanel from "./PartnerAppsPanel.jsx";

const STATUS = {
  pending: { label: "En attente", badge: "bg-latte-soft text-coffee-dark border-latte-light", dot: "bg-latte" },
  approved: { label: "Approuvée", badge: "bg-latte-soft text-coffee-dark border-coffee-light", dot: "bg-coffee" },
  rejected: { label: "Rejetée", badge: "bg-line/60 text-ink-soft border-line", dot: "bg-ink-faint" },
};

function Section({ icon: Icon, title, aside, children }) {
  return (
    <section className="px-6 py-6 border-t border-line">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="w-7 h-7 rounded-lg bg-cream flex items-center justify-center text-coffee-dark">
            <Icon size={14} strokeWidth={2} />
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function InfoTile({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-line bg-cream/40 px-3.5 py-3 min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-faint mb-1">
        <Icon size={12} /> {label}
      </p>
      <div className="text-sm text-ink truncate">{children}</div>
    </div>
  );
}

export default function ApplicationDetail({ application, contract, offers, onApprove, onReject, onSaveContract, onCreateOffer, withAuth, api }) {
  const [draft, setDraft] = useState(contract?.content || "");
  const [saving, setSaving] = useState(false);
  const [deciding, setDeciding] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setDraft(contract?.content || "");
    setFeedback(null);
  }, [contract?.id, application?.id]);

  if (!application) {
    return (
      <div className="bg-surface border border-dashed border-line rounded-3xl px-8 py-16 text-center">
        <span className="mx-auto w-14 h-14 rounded-2xl bg-cream flex items-center justify-center text-coffee mb-4">
          <MousePointerClick size={24} strokeWidth={1.6} />
        </span>
        <p className="font-display text-lg text-ink mb-1">Aucune candidature sélectionnée</p>
        <p className="text-sm text-ink-soft max-w-xs mx-auto">
          Choisissez une candidature dans la liste pour voir son détail, envoyer des offres et gérer le contrat.
        </p>
      </div>
    );
  }

  const status = STATUS[application.status] || STATUS.pending;
  const signed = contract?.status === "signed";
  const dirty = draft !== (contract?.content || "");

  async function handleDecision(next) {
    setDeciding(next);
    setFeedback(null);
    try {
      await (next === "approved" ? onApprove() : onReject());
      setFeedback({ type: "success", text: next === "approved" ? "Candidature approuvée. Le contrat est prêt ci-dessous." : "Candidature rejetée." });
    } catch (err) {
      setFeedback({ type: "error", text: err?.data?.detail || "Une erreur est survenue." });
    } finally {
      setDeciding(null);
    }
  }

  async function handleSaveContract() {
    setSaving(true);
    setFeedback(null);
    try {
      await onSaveContract(draft);
      setFeedback({ type: "success", text: "Contrat enregistré : visible immédiatement dans le dashboard du partenaire." });
    } catch (err) {
      setFeedback({ type: "error", text: err?.data?.detail || "Impossible d'enregistrer le contrat." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* En-tête */}
      <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-cream/70 to-surface">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-ink text-cream flex items-center justify-center font-display text-2xl shrink-0 shadow-sm">
            {application.company?.[0]?.toUpperCase() || "?"}
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl text-ink leading-tight break-words">{application.company}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <p className="text-sm text-ink-soft mt-1">{application.contact_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <InfoTile icon={Tag} label="Domaine">{application.category}</InfoTile>
          <InfoTile icon={Calendar} label="Reçue le">
            {new Date(application.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </InfoTile>
          <div className="col-span-2">
            <InfoTile icon={Mail} label="Email">
              <a href={`mailto:${application.email}`} className="hover:text-coffee-dark underline-offset-4 hover:underline">
                {application.email}
              </a>
            </InfoTile>
          </div>
        </div>

        {application.message && (
          <blockquote className="mt-4 border-l-[3px] border-coffee-light bg-cream/50 rounded-r-xl px-4 py-3 text-sm text-ink-soft leading-relaxed italic">
            « {application.message} »
          </blockquote>
        )}
      </div>

      {/* Décision */}
      {application.status === "pending" && (
        <Section icon={Gavel} title="Décision">
          <p className="text-xs text-ink-soft mb-4">
            Approuver la candidature crée automatiquement un contrat modifiable pour ce partenaire.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleDecision("approved")}
              disabled={!!deciding}
              className="flex items-center justify-center gap-2 rounded-xl bg-coffee text-white text-sm font-medium px-4 py-3 disabled:opacity-60 hover:bg-coffee-dark transition-colors shadow-sm"
            >
              {deciding === "approved" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Approuver
            </button>
            <button
              onClick={() => handleDecision("rejected")}
              disabled={!!deciding}
              className="flex items-center justify-center gap-2 rounded-xl border border-line text-ink-soft text-sm font-medium px-4 py-3 disabled:opacity-60 hover:border-ink-faint hover:bg-line/50 hover:text-ink transition-colors"
            >
              {deciding === "rejected" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              Rejeter
            </button>
          </div>
        </Section>
      )}

      {/* Offres */}
      <Section icon={BadgePercent} title="Offres commerciales">
        <OffersPanel offers={offers || []} onCreate={(payload) => onCreateOffer(payload)} />
      </Section>

      {/* Contrat */}
      {application.status === "approved" && (
        <Section
          icon={FileText}
          title="Contrat"
          aside={
            signed ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-coffee-dark bg-latte-soft border border-coffee-light px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} /> Signé
              </span>
            ) : (
              <span className="text-xs font-medium text-ink-faint bg-cream px-2.5 py-1 rounded-full">
                {dirty ? "Modifications non enregistrées" : "Non signé"}
              </span>
            )
          }
        >
          {signed && (
            <p className="text-xs text-coffee-dark mb-3">
              Signé par le partenaire le{" "}
              {new Date(contract.signed_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
              Le contrat n'est plus modifiable.
            </p>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={signed}
            rows={10}
            placeholder="Rédigez ici les termes du contrat…"
            className="w-full text-sm text-ink bg-cream/40 rounded-xl p-4 leading-relaxed border border-line focus:border-coffee-light focus:bg-surface outline-none disabled:opacity-70 disabled:cursor-not-allowed resize-y font-sans transition-colors"
          />
          {!signed && (
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-ink-faint">{draft.length} caractères</span>
              <button
                onClick={handleSaveContract}
                disabled={saving || !dirty}
                className="flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-5 py-2.5 disabled:opacity-40 hover:bg-coffee-dark transition-colors"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Enregistrer et envoyer
              </button>
            </div>
          )}
        </Section>
      )}

      {/* Apps */}
      {application.status === "approved" && (
        <Section icon={Package} title="Apps du partenaire">
          <PartnerAppsPanel applicationId={application.id} withAuth={withAuth} api={api} />
        </Section>
      )}

      {feedback && (
        <div className="px-6 pb-6">
          <div
            role="status"
            className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm border ${
              feedback.type === "success"
                ? "bg-latte-soft border-coffee-light text-coffee-dark"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
            <span className="flex-1">{feedback.text}</span>
            <button onClick={() => setFeedback(null)} aria-label="Fermer" className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}