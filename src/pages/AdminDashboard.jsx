import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Inbox, Clock, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { useUser } from "../context/Usercontext.jsx";
import { api } from "../lib/api.js";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import ApplicationsTable from "../components/admin/ApplicationsTable.jsx";
import ApplicationDetail from "../components/admin/ApplicationDetail.jsx";
import AllRequestsPanel from "../components/admin/AllRequestsPanel.jsx";
import { SkeletonTable, SkeletonCard } from "../components/ui/Skeleton.jsx";

function greeting() {
  const h = new Date().getHours();
  return h >= 5 && h < 18 ? "Bonjour" : "Bonsoir";
}

const STAT_CARDS = [
  { key: "all", label: "Total", icon: Inbox, tone: "bg-ink text-cream" },
  { key: "pending", label: "En attente", icon: Clock, tone: "bg-amber-50 text-amber-700" },
  { key: "approved", label: "Approuvées", icon: CheckCircle2, tone: "bg-[#F1EAE0] text-coffee-dark" },
  { key: "rejected", label: "Rejetées", icon: XCircle, tone: "bg-red-50 text-red-700" },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, withAuth, signOut } = useUser();
  const [applications, setApplications] = useState([]);
  const [view, setView] = useState("applications");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [contract, setContract] = useState(null);
  const [offers, setOffers] = useState([]);
  const [pageStatus, setPageStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);
  const detailRef = useRef(null);

  const loadApplications = useCallback(async () => {
    setPageStatus("loading");
    setLoadError(null);
    try {
      const apps = await withAuth((token) => api.admin.listApplications(token));
      setApplications(apps);
      setPageStatus("ready");
    } catch (err) {
      setLoadError(err?.data?.detail || "Impossible de charger les candidatures.");
      setPageStatus("error");
    }
  }, [withAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "admin") loadApplications();
  }, [isLoading, isAuthenticated, user, loadApplications]);

  const loadContract = useCallback(
    async (id) => {
      try {
        const c = await withAuth((token) => api.admin.getContract(token, id));
        setContract(c);
      } catch {
        setContract(null);
      }
    },
    [withAuth]
  );

  const loadOffers = useCallback(
    async (id) => {
      try {
        const list = await withAuth((token) => api.admin.listOffers(token, id));
        setOffers(list || []);
      } catch {
        setOffers([]);
      }
    },
    [withAuth]
  );

  function handleSelect(id) {
    setSelectedId(id);
    const app = applications.find((a) => a.id === id);
    if (app?.status === "approved") loadContract(id);
    else setContract(null);
    loadOffers(id);
    // Sur mobile / tablette, le détail est sous la liste : on y descend.
    if (window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }

  async function handleCreateOffer(payload) {
    await withAuth((token) => api.admin.createOffer(token, selectedId, payload));
    await loadOffers(selectedId);
  }

  async function handleApprove() {
    await withAuth((token) => api.admin.updateStatus(token, selectedId, "approved"));
    await loadApplications();
    await loadContract(selectedId);
  }

  async function handleReject() {
    await withAuth((token) => api.admin.updateStatus(token, selectedId, "rejected"));
    await loadApplications();
  }

  async function handleSaveContract(content) {
    const updated = await withAuth((token) => api.admin.updateContract(token, selectedId, content));
    setContract(updated);
  }

  const stats = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    }),
    [applications]
  );

  const selectedApplication = applications.find((a) => a.id === selectedId) || null;
  const firstName = (user?.full_name || "").split(" ")[0];
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-ink text-cream flex items-center justify-center font-display text-xl animate-pulse">
            H
          </span>
          <p className="text-ink-soft text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-surface border border-line rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-sm">
          <span className="mx-auto w-14 h-14 rounded-2xl bg-ink text-cream flex items-center justify-center font-display text-2xl mb-5">
            H
          </span>
          <h1 className="font-display text-2xl text-ink mb-2">Espace admin</h1>
          <p className="text-ink-soft text-sm mb-7">
            {isAuthenticated
              ? "Ce compte n'a pas accès à l'espace admin."
              : "Connectez-vous avec un compte administrateur pour continuer."}
          </p>
          <div className="flex flex-col gap-3">
            {!isAuthenticated && (
              <Link
                to="/connexion"
                className="rounded-full bg-ink text-cream text-sm font-medium px-6 py-3 hover:bg-coffee-dark transition-colors"
              >
                Se connecter
              </Link>
            )}
            <Link to="/" className="text-sm text-ink-soft hover:text-ink transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <AdminSidebar
        user={user}
        onSignOut={signOut}
        view={view}
        onViewChange={setView}
        counts={{ applications: stats.pending }}
      />

      <div className="flex-1 min-w-0">
        {/* Header mobile */}
        <header className="md:hidden sticky top-0 z-10 bg-cream/90 backdrop-blur-md border-b border-line px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-ink text-cream flex items-center justify-center font-display">H</span>
            <span className="font-display text-lg text-ink">H-Company</span>
          </Link>
          <button
            onClick={signOut}
            aria-label="Se déconnecter"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:bg-surface"
          >
            <LogOut size={17} />
          </button>
        </header>

        <main className="px-4 sm:px-6 md:px-10 py-7 md:py-10 pb-28 md:pb-12 max-w-[1400px]">
          {/* En-tête de page */}
          <div className="mb-7 md:mb-9">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint mb-2 first-letter:uppercase">{today}</p>
            <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
              {view === "requests" ? (
                "Toutes les demandes"
              ) : (
                <>
                  {greeting()}
                  {firstName ? `, ${firstName}` : ""}
                </>
              )}
            </h1>
            <p className="text-sm text-ink-soft mt-2">
              {view === "requests"
                ? "Apps et paiements, tous partenaires confondus."
                : stats.pending > 0
                ? `${stats.pending} candidature${stats.pending > 1 ? "s attendent" : " attend"} votre décision.`
                : "Tout est à jour, aucune candidature en attente."}
            </p>
          </div>

          {view === "requests" ? (
            <AllRequestsPanel withAuth={withAuth} api={api} />
          ) : (
            <>
              {/* Statistiques (cliquables = filtre) */}
              {pageStatus === "ready" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => {
                    const active = filter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`group text-left bg-surface border rounded-2xl p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          active ? "border-coffee-light shadow-md ring-1 ring-coffee-light/40" : "border-line"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}>
                            <Icon size={17} strokeWidth={1.8} />
                          </span>
                          {active && <span className="w-2 h-2 rounded-full bg-coffee" />}
                        </div>
                        <p className="font-display text-3xl text-ink leading-none">{stats[key]}</p>
                        <p className="text-xs text-ink-soft mt-1.5">{label}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {pageStatus === "loading" && (
                <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 items-start">
                  <SkeletonTable rows={5} />
                  <SkeletonCard />
                </div>
              )}

              {pageStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <p className="text-sm text-red-700">{loadError}</p>
                  <button
                    onClick={loadApplications}
                    className="text-sm font-medium text-red-700 bg-surface border border-red-200 rounded-full px-4 py-2 hover:bg-red-100 whitespace-nowrap"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {pageStatus === "ready" && (
                <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 items-start">
                  <ApplicationsTable
                    applications={applications}
                    filter={filter}
                    onFilterChange={setFilter}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                  />
                  <div
                    ref={detailRef}
                    className="scroll-mt-20 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:rounded-3xl"
                  >
                    <ApplicationDetail
                      application={selectedApplication}
                      contract={contract}
                      offers={offers}
                      onCreateOffer={handleCreateOffer}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSaveContract={handleSaveContract}
                      withAuth={withAuth}
                      api={api}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}