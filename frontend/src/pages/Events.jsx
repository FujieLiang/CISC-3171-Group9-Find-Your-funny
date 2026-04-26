import { useEffect, useState, useMemo } from "react";
import { api, formatApiError } from "@/lib/api";
import EventCard from "@/components/EventCard";
import CategoryTabs from "@/components/CategoryTabs";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (category !== "ALL") params.category = category;
      if (q.trim()) params.q = q.trim();
      if (city.trim()) params.city = city.trim();
      const { data } = await api.get("/events", { params });
      setEvents(data);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [category]);

  const grouped = useMemo(() => events, [events]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">The Whole Playbill</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-1">Browse Shows</h1>
        <p className="font-sub italic text-lg mt-3 text-stark/70 max-w-2xl">
          Every show we know about, all in one loud, well-lit list. Filter, sort, pick your poison.
        </p>
      </header>

      <div className="ticket-card p-4 md:p-6 mb-8">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stark/60" strokeWidth={2.5} />
            <input
              data-testid="events-search"
              className="retro-input w-full pl-9"
              placeholder="Search bits, shows, comics..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stark/60" strokeWidth={2.5} />
            <input
              data-testid="events-city"
              className="retro-input w-full pl-9"
              placeholder="City (e.g. Brooklyn)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <button onClick={load} className="marquee-btn-sm" data-testid="events-apply">Apply</button>
        </div>
        <div className="mt-4">
          <CategoryTabs value={category} onChange={setCategory} />
        </div>
      </div>

      {error && <div className="mb-6 border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-3 text-stark/70 font-mono-accent text-sm uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" /> Fetching the bill…
        </div>
      ) : grouped.length === 0 ? (
        <div className="ticket-card p-10 text-center">
          <h3 className="font-heading text-3xl">No shows match.</h3>
          <p className="font-sub italic text-stark/70 mt-2">Try widening the net, or be the first to post one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grouped.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      )}
    </main>
  );
}
