import { useEffect, useState } from "react";
import { Search, Loader2, UserPlus, UserMinus, ShieldCheck, Inbox, AlertCircle } from "lucide-react";

function EmptyState({ text }) {
  return (
    <div className="bg-surface border border-dashed border-line rounded-2xl px-6 py-12 text-center">
      <span className="mx-auto w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-ink-faint mb-3">
        <Inbox size={20} strokeWidth={1.6} />
      </span>
      <p className="text-sm text-ink-soft">{text}</p>
    </div>
  );
}

/** Panneau admin pour promouvoir un utilisateur au rôle "agent" (revue KYC
 * des candidatures partenaires) ou l'y retirer — recherche par email/nom,
 * puis bascule en un clic. Volontairement limité à agent ↔ client : la
 * promotion "partner" passe par l'approbation d'une candidature, et le
 * rôle "admin" ne se change pas depuis cet écran. */
export default function AgentsPanel({ withAuth, api }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function loadAgents() {
    setLoading(true);
    try {
      const list = await withAuth((token) => api.admin.listAgents(token));
      setAgents(list || []);
      setError(null);
    } catch {
      setError("Impossible de charger la liste des agents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const list = await withAuth((token) => api.admin.searchUsers(token, query.trim()));
      setResults(list || []);
    } finally {
      setSearching(false);
    }
  }

  async function setRole(userId, role) {
    setBusyId(userId);
    try {
      await withAuth((token) => api.admin.setUserRole(token, userId, role));
      setResults((rs) => rs.map((u) => (u.id === userId ? { ...u, role } : u)));
      await loadAgents();
    } catch (err) {
      alert(err?.data?.detail || "Une erreur est survenue."); // eslint-disable-line no-alert
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl md:text-2xl text-ink">Promouvoir un agent</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Recherchez un utilisateur par email ou nom, puis attribuez-lui le rôle agent.
          </p>
        </div>
        <form onSubmit={runSearch} className="flex gap-2 mb-4 max-w-md">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="email ou nom…"
              className="w-full text-sm rounded-lg border border-line bg-cream/40 pl-9 pr-3 py-2.5 outline-none focus:border-coffee-light"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 text-sm font-medium rounded-lg bg-ink text-cream px-4 py-2.5 hover:bg-coffee-dark disabled:opacity-60 transition-colors"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Rechercher
          </button>
        </form>

        {results.length > 0 && (
          <div className="bg-surface border border-line rounded-2xl overflow-hidden divide-y divide-line">
            {results.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink font-medium truncate">{u.full_name || u.email}</p>
                  <p className="text-xs text-ink-faint truncate">{u.email} · rôle actuel : {u.role}</p>
                </div>
                {u.role === "agent" ? (
                  <button
                    onClick={() => setRole(u.id, "client")}
                    disabled={busyId === u.id}
                    className="flex items-center gap-1.5 text-xs font-medium rounded-lg border border-line text-ink-soft px-3 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {busyId === u.id ? <Loader2 size={13} className="animate-spin" /> : <UserMinus size={13} />}
                    Retirer
                  </button>
                ) : u.role === "client" ? (
                  <button
                    onClick={() => setRole(u.id, "agent")}
                    disabled={busyId === u.id}
                    className="flex items-center gap-1.5 text-xs font-medium rounded-lg bg-coffee text-white px-3 py-2 hover:bg-coffee-dark disabled:opacity-50 transition-colors shrink-0"
                  >
                    {busyId === u.id ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                    Promouvoir agent
                  </button>
                ) : (
                  <span className="text-xs text-ink-faint italic shrink-0">non modifiable ici</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl md:text-2xl text-ink">Agents actifs</h2>
          <p className="text-sm text-ink-soft mt-0.5">{agents.length} agent(s) avec accès à l'espace de revue KYC.</p>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => <div key={i} className="h-16 rounded-2xl bg-surface border border-line animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState text="Aucun agent pour le moment — utilisez la recherche ci-dessus pour en créer un." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {agents.map((a) => (
              <div key={a.id} className="bg-surface border border-line rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-latte-soft text-coffee-dark flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{a.full_name || a.email}</p>
                    <p className="text-xs text-ink-faint truncate">{a.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRole(a.id, "client")}
                  disabled={busyId === a.id}
                  className="text-xs font-medium text-ink-soft hover:text-red-600 disabled:opacity-50 transition-colors shrink-0"
                >
                  {busyId === a.id ? <Loader2 size={13} className="animate-spin" /> : "Retirer"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
