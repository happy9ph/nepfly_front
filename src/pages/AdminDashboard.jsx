import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/Usercontext.jsx";
import { api } from "../lib/api.js";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import ApplicationsTable from "../components/admin/ApplicationsTable.jsx";
import ApplicationDetail from "../components/admin/ApplicationDetail.jsx";
import AllRequestsPanel from "../components/admin/AllRequestsPanel.jsx";
import { SkeletonTable, SkeletonCard } from "../components/ui/Skeleton.jsx";

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

  const selectedApplication = applications.find((a) => a.id === selectedId) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-ink-soft text-sm">Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-ink text-lg font-medium">
          {isAuthenticated
            ? "Ce compte n'a pas accès à l'espace admin."
            : "Connectez-vous avec un compte administrateur pour continuer."}
        </p>
        {!isAuthenticated && (
          <Link
            to="/connexion"
            className="rounded-full bg-ink text-cream text-sm font-medium px-6 py-2.5"
          >
            Se connecter
          </Link>
        )}
        <Link to="/" className="text-sm underline underline-offset-4 text-ink-soft">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <AdminSidebar user={user} onSignOut={signOut} view={view} onViewChange={setView} />

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-10 bg-cream/95 backdrop-blur-sm border-b border-line px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg text-ink">H-Company</Link>
          <button onClick={signOut} className="text-xs text-ink-soft">Déconnexion</button>
        </header>

        <main className="px-5 md:px-10 py-8 md:py-10 pb-28 md:pb-10 max-w-6xl">
          {view === "requests" ? (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl md:text-3xl text-ink">Toutes les demandes</h1>
                <p className="text-sm text-ink-soft mt-1">
                  Vue agrégée, tous partenaires confondus.
                </p>
              </div>
              <AllRequestsPanel withAuth={withAuth} api={api} />
            </>
          ) : (
            <>
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl text-ink">Candidatures partenaires</h1>
            <p className="text-sm text-ink-soft mt-1">
              {applications.length} candidature{applications.length > 1 ? "s" : ""} au total
            </p>
          </div>

          {pageStatus === "loading" && (
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
              <SkeletonTable rows={4} />
              <SkeletonCard />
            </div>
          )}
          {pageStatus === "error" && <p className="text-sm text-red-600">{loadError}</p>}

          {pageStatus === "ready" && (
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
              <ApplicationsTable
                applications={applications}
                filter={filter}
                onFilterChange={setFilter}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
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
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
