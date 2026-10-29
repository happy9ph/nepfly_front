import { Link } from "react-router-dom";
import { ArrowRight, Armchair, Search, UtensilsCrossed, CalendarCheck } from "lucide-react";
import RestoLayout, { EmptyState, ErrorState, RestoCard, Spinner, useRestoUi } from "../../components/restaurant/Shared.jsx";
import SearchForm from "../../components/restaurant/SearchForm.jsx";
import { useLoad } from "../../data/shop.js";
import { api } from "../../lib/api.js";
import { usePageMeta } from "../../components/ui/HeadManager.jsx";

export default function RestoHome() {
  const ui = useRestoUi();
  const h = ui.home;
  usePageMeta({ title: "H-Restaurant", description: h.lead });
  const { data, error, loading, reload } = useLoad(() => api.resto.home(), []);
  const steps = [Search, Armchair, CalendarCheck];
  return (
    <RestoLayout hideBar width="max-w-content">
      <section className="pt-4 pb-10 sm:pb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-coffee mb-3">{h.eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-6xl text-ink leading-[1.05] max-w-3xl mb-5">{h.title}</h1>
        <p className="text-ink-soft leading-relaxed max-w-2xl mb-8">{h.lead}</p>
        <SearchForm cities={data?.cities || []} />
      </section>

      {loading && !data ? <Spinner label={ui.common.loading} /> : error && !data ? <ErrorState onRetry={reload} /> : (
        <>
          {data.featured?.length > 0 ? (
            <section className="mb-14">
              <h2 className="font-display text-2xl text-ink mb-5">{h.featured}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{data.featured.map((r, i) => <RestoCard key={r.id} r={r} index={i} />)}</div>
            </section>
          ) : data.total === 0 && <EmptyState icon={UtensilsCrossed} title={h.empty} hint={h.emptyHint} />}

          {data.cuisines?.length > 0 && (
            <section className="mb-14">
              <h2 className="font-display text-2xl text-ink mb-5">{h.byCuisine}</h2>
              <div className="flex flex-wrap gap-2.5">
                {data.cuisines.map((c) => <Link key={c.key} to={`/restaurant/recherche?cuisine=${c.key}`} className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink hover:border-coffee-light">{ui.cuisines[c.key] || c.key} <span className="text-ink-faint">· {c.count}</span></Link>)}
              </div>
            </section>
          )}
          {data.cities?.length > 1 && (
            <section className="mb-14">
              <h2 className="font-display text-2xl text-ink mb-5">{h.cities}</h2>
              <div className="flex flex-wrap gap-2.5">{data.cities.map((c) => <Link key={c.city} to={`/restaurant/recherche?city=${encodeURIComponent(c.city)}`} className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink hover:border-coffee-light">{c.city} <span className="text-ink-faint">· {c.count}</span></Link>)}</div>
            </section>
          )}
        </>
      )}

      <section className="grid md:grid-cols-3 gap-5 mb-14">
        {h.steps.map((s, i) => { const Icon = steps[i]; return (
          <div key={s.t} className="rounded-3xl border border-line bg-surface p-6">
            <span className="w-10 h-10 rounded-full bg-latte-soft text-coffee flex items-center justify-center mb-4"><Icon size={18} /></span>
            <p className="font-display text-lg text-ink mb-1">{s.t}</p><p className="text-sm text-ink-soft leading-relaxed">{s.d}</p>
          </div>); })}
      </section>

      <section className="rounded-3xl bg-ink text-cream p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="max-w-xl"><h2 className="font-display text-3xl mb-3">{h.proTitle}</h2><p className="text-cream/75 leading-relaxed">{h.proLead}</p></div>
        <Link to="/restaurant/pro" className="inline-flex items-center gap-2 rounded-full bg-cream text-ink text-sm font-medium px-6 py-3.5 whitespace-nowrap">{h.proCta}<ArrowRight size={16} /></Link>
      </section>
    </RestoLayout>
  );
}
