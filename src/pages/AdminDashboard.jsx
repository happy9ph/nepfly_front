import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LogOut, RefreshCw, Clock, CheckCircle2, X, ChevronDown, ChevronUp, MoreHorizontal, Gift, ArrowRight, Loader2,
} from "lucide-react";
import { useUser } from "../context/Usercontext.jsx";
import { api } from "../lib/api.js";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import ApplicationsTable, { timeAgo } from "../components/admin/ApplicationsTable.jsx";
import ApplicationDetail from "../components/admin/ApplicationDetail.jsx";
import AllRequestsPanel from "../components/admin/AllRequestsPanel.jsx";
import { SkeletonTable, SkeletonCard } from "../components/ui/Skeleton.jsx";

/* Titre avec le point doré, façon "Monitors." */
function Title({ children, as: Tag = "h1", className = "" }) {
  return (
    <Tag className={`font-display text-ink ${className}`}>
      {children}
      <span className="text-[#C89A3D]">.</span>
    </Tag>
  );
}

function SideCard({ title, children, action }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <Title as="h2" className="text-lg">{title}</Title>
        {action}
      </div>
      {children}
    </div>
  );
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [todoOpen, setTodoOpen] = useState(true);
  const [todoHidden, setTodoHidden] = useState(false);

  const loadApplications = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setPageStatus("loading");
      setLoadError(null);
      try {
        const apps = await withAuth((token) => api.admin.listApplications(token));
        setApplications(apps);
        setPageStatus("ready");
      } catch (err) {
        setLoadError(err?.data?.detail || "Impossible de charger les candidatures.");
        setPageStatus("error");
      }
    },
    [withAuth]
  );

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
    setOffers([]);
    loadOffers(id);
  }

  function closeDetail() {
    setSelectedId(null);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadApplications({ silent: true });
    setRefreshing(false);
  }

  async function handleCreateOffer(payload) {
    await withAuth((token) => api.admin.createOffer(token, selectedId, payload));
    await loadOffers(selectedId);
  }

  async function handleApprove() {
    await withAuth((token) => api.admin.updateStatus(token, selectedId, "approved"));
    await loadApplications({ silent: true });
    await loadContract(selectedId);
  }

  async function handleReject() {
    await withAuth((token) => api.admin.updateStatus(token, selectedId, "rejected"));
    await loadApplications({ silent: true });
  }

  async function handleSaveContract(content) {
    const updated = await withAuth((token) => api.admin.updateContract(token, selectedId, content));
    setContract(updated);
  }

  // Panneau de détail : fermeture avec Échap + blocage du scroll de la page
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => e.key === "Escape" && closeDetail();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  const stats = useMemo(() => {
    const pending = applications.filter((a) => a.status === "pending");
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const oldestPending = [...pending].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const decided = approved + rejected;
    return {
      total: applications.length,
      pending: pending.length,
      approved,
      rejected,
      decided,
      approvalRate: decided ? Math.round((approved / decided) * 100) : null,
      lastWeek: applications.filter((a) => new Date(a.created_at).getTime() >= weekAgo).length,
      oldestPending,
    };
  }, [applications]);

  const selectedApplication = applications.find((a) => a.id === selectedId) || null;

  /* ───────── États d'accès ───────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="animate-spin text-coffee" size={22} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="bg-surface rounded-3xl p-8 md:p-10 max-w-md w-full text-center">
          <Title className="text-3xl mb-3">Espace admin</Title>
          <p className="text-ink-soft text-sm mb-7">
            {isAuthenticated
              ? "Ce compte n'a pas accès à l'espace admin."
              : "Connectez-vous avec un compte administrateur pour continuer."}
          </p>
          {!isAuthenticated && (
            <Link to="/connexion" className="block rounded-xl bg-coffee hover:bg-coffee-dark text-white text-sm font-medium py-3 mb-3 transition-colors">
              Se connecter
            </Link>
          )}
          <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const statusTone =
    stats.pending > 0
      ? { halo: "bg-amber-100", core: "bg-amber-500", Icon: Clock }
      : { halo: "bg-[#F1EAE0]", core: "bg-coffee", Icon: CheckCircle2 };

  return (
    <div className="min-h-screen bg-cream md:flex">
      <AdminSidebar
        user={user}
        onSignOut={signOut}
        view={view}
        onViewChange={(v) => { setView(v); setSelectedId(null); }}
        counts={{ applications: stats.pending }}
      />

      <div className="flex-1 min-w-0">
        {/* Header mobile */}
        <header className="md:hidden sticky top-0 z-20 bg-ink text-cream px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-lg">
            <span className="w-2 h-2 rounded-full bg-[#C89A3D]" />
            H-Company
          </Link>
          <button onClick={signOut} aria-label="Se déconnecter" className="w-9 h-9 rounded-lg flex items-center justify-center text-cream/60 hover:bg-white/10">
            <LogOut size={17} />
          </button>
        </header>

        <main className="px-4 sm:px-6 lg:px-12 py-8 lg:py-12 pb-28 md:pb-12 max-w-[1320px]">
          {view === "requests" ? (
            <>
              <div className="mb-8">
                <Title className="text-3xl">Toutes les demandes</Title>
                <p className="text-sm text-ink-soft mt-1">Apps et paiements, tous partenaires confondus.</p>
              </div>
              <AllRequestsPanel withAuth={withAuth} api={api} />
            </>
          ) : (
            <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
              {/* ───────── Colonne principale ───────── */}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <Title className="text-3xl">Candidatures</Title>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing || pageStatus === "loading"}
                    className="flex items-center gap-2 rounded-xl bg-coffee hover:bg-coffee-dark text-white text-sm font-medium pl-4 pr-4 py-2.5 disabled:opacity-60 transition-colors shadow-sm"
                  >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                    Actualiser
                  </button>
                </div>

                {pageStatus === "loading" && <SkeletonTable rows={4} />}

                {pageStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <p className="text-sm text-red-700">{loadError}</p>
                    <button onClick={() => loadApplications()} className="text-sm font-medium text-red-700 bg-surface border border-red-200 rounded-xl px-4 py-2 hover:bg-red-100">
                      Réessayer
                    </button>
                  </div>
                )}

                {pageStatus === "ready" && (
                  <ApplicationsTable
                    applications={applications}
                    filter={filter}
                    onFilterChange={setFilter}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                  />
                )}

                {/* Carte « À traiter » façon onboarding */}
                {pageStatus === "ready" && stats.pending > 0 && !todoHidden && (
                  <div className="mt-8 bg-surface border border-line rounded-2xl p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold text-ink">
                          {stats.pending} candidature{stats.pending > 1 ? "s attendent" : " attend"} votre décision
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-coffee-dark bg-[#F1EAE0] rounded-lg px-2.5 py-1.5">
                            <Gift size={13} /> {stats.decided}/{stats.total} traitées
                          </span>
                          <span className="text-sm text-ink-soft">Les plus anciennes en premier.</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setTodoOpen((o) => !o)}
                          aria-label={todoOpen ? "Replier" : "Déplier"}
                          className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink-soft hover:bg-cream"
                        >
                          {todoOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                        <button
                          onClick={() => setTodoHidden(true)}
                          aria-label="Masquer"
                          className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink-soft hover:bg-cream"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-line/70 mt-6 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-coffee transition-all"
                        style={{ width: `${stats.total ? (stats.decided / stats.total) * 100 : 0}%` }}
                      />
                    </div>

                    {todoOpen && (
                      <ol className="mt-6 space-y-3">
                        {stats.oldestPending.slice(0, 3).map((app, i) => (
                          <li key={app.id}>
                            <button
                              onClick={() => handleSelect(app.id)}
                              className="w-full flex items-center gap-4 text-left rounded-2xl border border-line hover:border-coffee-light hover:bg-cream/40 px-4 md:px-5 py-4 transition-colors group"
                            >
                              <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-sm font-semibold text-ink shrink-0">
                                {i + 1}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold text-ink truncate">{app.company}</span>
                                <span className="block text-xs text-ink-soft mt-0.5 truncate">
                                  {app.category} · reçue il y a {timeAgo(app.created_at)}
                                </span>
                              </span>
                              <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-coffee-dark">
                                Traiter <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>

              {/* ───────── Colonne de droite ───────── */}
              <aside className="space-y-5 xl:sticky xl:top-12">
                {pageStatus === "loading" ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <SideCard title="Statut actuel">
                      <div className="flex justify-center mb-5">
                        <span className={`w-16 h-16 rounded-full flex items-center justify-center ${statusTone.halo}`}>
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${statusTone.core}`}>
                            <statusTone.Icon size={18} strokeWidth={2.4} />
                          </span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-center">
                        {[
                          { key: "pending", label: "En attente", value: stats.pending, cls: "text-amber-600" },
                          { key: "approved", label: "Approuvées", value: stats.approved, cls: "text-ink" },
                          { key: "rejected", label: "Rejetées", value: stats.rejected, cls: "text-ink" },
                        ].map((s) => (
                          <button
                            key={s.key}
                            onClick={() => setFilter(filter === s.key ? "all" : s.key)}
                            className={`rounded-xl py-2 transition-colors ${filter === s.key ? "bg-cream" : "hover:bg-cream/60"}`}
                          >
                            <p className={`text-xl font-semibold tabular-nums ${s.value > 0 ? s.cls : "text-ink"}`}>{s.value}</p>
                            <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-ink-soft text-center mt-4">
                        {stats.total} candidature{stats.total > 1 ? "s" : ""} au total.
                      </p>
                      <div className="flex justify-center mt-3">
                        <button
                          onClick={() => setView("requests")}
                          className="flex items-center gap-1.5 text-xs font-medium text-cream bg-ink hover:bg-coffee-dark rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <Gift size={12} className="text-[#C89A3D]" />
                          Demandes d'apps & paiements
                        </button>
                      </div>
                    </SideCard>

                    <SideCard
                      title="Activité"
                      action={<MoreHorizontal size={16} className="text-ink-faint" />}
                    >
                      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                        <div>
                          <p className={`text-xl font-semibold tabular-nums ${stats.approvalRate === null ? "text-ink" : stats.approvalRate >= 50 ? "text-coffee-dark" : "text-red-600"}`}>
                            {stats.approvalRate === null ? "—" : `${stats.approvalRate}%`}
                          </p>
                          <p className="text-xs text-ink-soft mt-0.5">Taux d'approbation</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-ink tabular-nums">{stats.lastWeek}</p>
                          <p className="text-xs text-ink-soft mt-0.5">Reçues en 7 jours</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-ink tabular-nums">
                            {stats.oldestPending[0] ? timeAgo(stats.oldestPending[0].created_at) : "—"}
                          </p>
                          <p className="text-xs text-ink-soft mt-0.5">Plus ancienne en attente</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-ink tabular-nums">{stats.decided}</p>
                          <p className="text-xs text-ink-soft mt-0.5">Décisions prises</p>
                        </div>
                      </div>
                    </SideCard>
                  </>
                )}
              </aside>
            </div>
          )}
        </main>
      </div>

      {/* ───────── Panneau latéral de détail ───────── */}
      {selectedApplication && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={selectedApplication.company}>
          <style>{`
            @keyframes hc-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes hc-fade { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            style={{ animation: "hc-fade .2s ease-out" }}
            onClick={closeDetail}
          />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-cream shadow-2xl flex flex-col"
            style={{ animation: "hc-slide .28s cubic-bezier(.2,.8,.2,1)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-ink text-cream shrink-0">
              <p className="text-sm font-medium">
                Candidature<span className="text-[#C89A3D]">.</span>
              </p>
              <button
                onClick={closeDetail}
                aria-label="Fermer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-cream/70 hover:bg-white/10 hover:text-cream"
              >
                <X size={17} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
        </div>
      )}
    </div>
  );
}