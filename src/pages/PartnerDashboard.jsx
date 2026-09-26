import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, FileText, Activity, Tag, Boxes, Compass } from "lucide-react";
import { useUser } from "../context/Usercontext.jsx";
import { api } from "../lib/api.js";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import OverviewTab from "../components/dashboard/OverviewTab.jsx";
import OffersTab from "../components/dashboard/OffersTab.jsx";
import AppsTab from "../components/dashboard/AppsTab.jsx";
import MyServicesPanel from "../components/dashboard/MyServicesPanel.jsx";
import ContractTab from "../components/dashboard/ContractTab.jsx";
import ActivityTab from "../components/dashboard/ActivityTab.jsx";
import { Skeleton, SkeletonCard, SkeletonStatRow } from "../components/ui/Skeleton.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const STATUS_LABELS = {
  pending: { label: "En attente d'approbation", tone: "pending" },
  approved: { label: "Approuvé", tone: "approved" },
  rejected: { label: "Non retenu", tone: "rejected" },
};

const MOBILE_TABS = [
  { key: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { key: "apps", label: "Mes apps", icon: Boxes },
  { key: "services", label: "Mes services", icon: Compass },
  { key: "offers", label: "Offres", icon: Tag },
  { key: "contract", label: "Contrat", icon: FileText },
  { key: "activity", label: "Activité", icon: Activity },
];

function StatusBadge({ status }) {
  const info = STATUS_LABELS[status] || { label: status, tone: "pending" };
  const toneClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-[#F1EAE0] text-coffee-dark border-coffee-light",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border ${toneClasses[info.tone]}`}>
      {info.label}
    </span>
  );
}

export default function PartnerDashboard() {
  const { user, isAuthenticated, isLoading, withAuth, signOut } = useUser();
  const { t } = useLanguage();
  const [application, setApplication] = useState(null);
  const [contract, setContract] = useState(null);
  const [activities, setActivities] = useState([]);
  const [offers, setOffers] = useState([]);
  const [apps, setApps] = useState([]);
  const [billing, setBilling] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [services, setServices] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading"); // loading | ready | error
  const [activeTab, setActiveTab] = useState("overview");
  const toast = useToast();

  const load = useCallback(async () => {
    setPageStatus("loading");
    setLoadError(null);
    try {
      const app = await withAuth((token) => api.partners.me(token)).catch(() => null);
      setApplication(app);

      // Les abonnements aux services H-Company appartiennent à l'utilisateur,
      // pas à sa candidature partenaire — on les charge dans tous les cas.
      const svc = await withAuth((token) => api.services.mine(token)).catch(() => null);
      setServices(svc);

      if (app) {
        const offersList = await withAuth((token) => api.partners.myOffers(token)).catch(() => []);
        setOffers(offersList || []);
      } else {
        const messages = await withAuth((token) => api.contactMessages.mine(token)).catch(() => []);
        setContactMessages(messages || []);
      }

      if (app?.status === "approved") {
        const [c, acts, st, myApps, myBilling] = await Promise.all([
          withAuth((token) => api.partners.contract(token)).catch(() => null),
          withAuth((token) => api.partners.activities(token)).catch(() => []),
          withAuth((token) => api.partners.stats(token)).catch(() => null),
          withAuth((token) => api.partners.myApps(token)).catch(() => []),
          withAuth((token) => api.partners.billing(token)).catch(() => null),
        ]);
        setContract(c);
        setActivities(acts || []);
        setStats(st);
        setApps(myApps || []);
        setBilling(myBilling);
      }
      setPageStatus("ready");
    } catch (err) {
      setLoadError(err?.data?.detail || "Impossible de charger votre espace partenaire.");
      setPageStatus("error");
    }
  }, [withAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) load();
  }, [isLoading, isAuthenticated, load]);

  async function handleAcceptOffer(offerId) {
    const updatedContract = await withAuth((token) => api.partners.acceptOffer(token, offerId));
    setContract(updatedContract);
    const [freshOffers, freshApp] = await Promise.all([
      withAuth((token) => api.partners.myOffers(token)),
      withAuth((token) => api.partners.me(token)),
    ]);
    setOffers(freshOffers);
    setApplication(freshApp);
    toast.success("Offre acceptée : votre contrat a été mis à jour avec ces conditions.");
  }

  async function handleSign(signerName) {
    const updated = await withAuth((token) => api.partners.signContract(token, signerName));
    setContract(updated);
    const [acts, st] = await Promise.all([
      withAuth((token) => api.partners.activities(token)),
      withAuth((token) => api.partners.stats(token)),
    ]);
    setActivities(acts);
    setStats(st);
  }

  async function handleRequestApp(name, description) {
    await withAuth((token) => api.partners.requestApp(token, name, description));
    const [freshApps, freshBilling] = await Promise.all([
      withAuth((token) => api.partners.myApps(token)),
      withAuth((token) => api.partners.billing(token)),
    ]);
    setApps(freshApps);
    setBilling(freshBilling);
    toast.success("Demande envoyée : l'équipe H-Company va l'examiner.");
  }

  if (isLoading || pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-cream md:flex">
        <div className="hidden md:block w-64 shrink-0 border-r border-line bg-surface h-screen" />
        <div className="flex-1 px-5 md:px-10 py-8 md:py-10 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonStatRow />
          <div className="grid lg:grid-cols-5 gap-6 mt-6">
            <div className="lg:col-span-2"><SkeletonCard /></div>
            <div className="lg:col-span-3"><SkeletonCard /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-ink text-lg font-medium">Connectez-vous pour accéder à votre espace partenaire.</p>
        <Link to="/" className="text-sm underline underline-offset-4 text-ink-soft">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-ink text-lg font-medium">{loadError}</p>
        <Link to="/" className="text-sm underline underline-offset-4 text-ink-soft">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Candidature pas encore approuvée : pas de vrai dashboard à montrer,
  // juste le statut — pas de sidebar/stats qui n'auraient aucun sens ici.
  if (!application) {
    // Utilisateur venu uniquement via le formulaire de contact — pas de
    // candidature partenaire, donc pas de sidebar complète, juste le suivi
    // de ses messages.
    return (
      <div className="min-h-screen bg-cream">
        <header className="border-b border-line px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-ink">H-Company</Link>
          <button onClick={signOut} className="text-sm text-ink-soft hover:text-ink">Se déconnecter</button>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="font-display text-2xl text-ink mb-6 text-center">{t("myServices.heading")}</h1>
            <MyServicesPanel summary={services} />
          </div>

          <h1 className="font-display text-2xl text-ink mb-6 text-center">Mes demandes</h1>
          {contactMessages.length === 0 ? (
            <p className="text-ink-soft text-center">Aucune demande envoyée pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((m) => (
                <div key={m.id} className="bg-surface border border-line rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        m.status === "answered" ? "bg-coffee/10 text-coffee-dark" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {m.status === "answered" ? "Répondu" : "En attente"}
                    </span>
                    <span className="text-xs text-ink-soft">{new Date(m.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="text-sm text-ink mb-2">{m.message}</p>
                  {m.admin_reply && (
                    <div className="mt-3 pt-3 border-t border-line/60">
                      <p className="text-xs text-ink-faint mb-1">Réponse de l'équipe H-Company</p>
                      <p className="text-sm text-ink-soft">{m.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (application.status !== "approved") {
    return (
      <div className="min-h-screen bg-cream">
        <header className="border-b border-line px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-ink">H-Company</Link>
          <button onClick={signOut} className="text-sm text-ink-soft hover:text-ink">Se déconnecter</button>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="flex justify-center mb-4">
            <StatusBadge status={application.status} />
          </div>
          {application.status === "pending" ? (
            <p className="text-ink-soft mb-10">
              Merci {application.contact_name}, votre demande pour <strong>{application.company}</strong> est
              bien reçue et en cours d'examen. Vous recevrez un e-mail dès qu'elle sera traitée.
            </p>
          ) : (
            <p className="text-ink-soft mb-10">
              Votre demande pour <strong>{application.company}</strong> n'a pas été retenue pour l'instant.
              N'hésitez pas à nous contacter pour en savoir plus.
            </p>
          )}
          {offers.length > 0 && (
            <div className="text-left">
              <h2 className="font-display text-xl text-ink mb-4 text-center">Offres reçues</h2>
              <OffersTab offers={offers} onAccept={handleAcceptOffer} />
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <DashboardSidebar active={activeTab} onSelect={setActiveTab} user={user} onSignOut={signOut} />

      <div className="flex-1 min-w-0">
        {/* Barre mobile : la sidebar est cachée sous md, on remplace par des onglets horizontaux */}
        <header className="md:hidden sticky top-0 z-10 bg-cream/95 backdrop-blur-sm border-b border-line">
          <div className="flex items-center justify-between px-4 py-4">
            <Link to="/" className="font-display text-lg text-ink">H-Company</Link>
            <button onClick={signOut} className="text-xs text-ink-soft">Déconnexion</button>
          </div>
          <div className="flex px-2 pb-2 gap-1 overflow-x-auto">
            {MOBILE_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                  activeTab === key ? "bg-ink text-cream" : "text-ink-soft"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <main className="px-5 md:px-10 py-8 md:py-10 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-ink">Espace partenaire</h1>
              <p className="text-sm text-ink-soft mt-1">{application.company}</p>
            </div>
            <div className="hidden md:block">
              <StatusBadge status={application.status} />
            </div>
          </div>

          {activeTab === "overview" && (
            <OverviewTab application={application} stats={stats} activities={activities} />
          )}
          {activeTab === "apps" && <AppsTab apps={apps} billing={billing} onRequestApp={handleRequestApp} />}
          {activeTab === "services" && <MyServicesPanel summary={services} />}
          {activeTab === "offers" && <OffersTab offers={offers} onAccept={handleAcceptOffer} />}
          {activeTab === "contract" && <ContractTab contract={contract} onSign={handleSign} />}
          {activeTab === "activity" && <ActivityTab activities={activities} />}
        </main>
      </div>
    </div>
  );
}
