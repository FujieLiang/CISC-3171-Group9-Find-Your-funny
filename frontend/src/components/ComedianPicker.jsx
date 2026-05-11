import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Search, X } from "lucide-react";

export default function ComedianPicker({ selected, onChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/users/search", {
          params: { role: "COMIC", q: q.trim(), limit: 10 },
        });
        if (!cancelled) setResults(data || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const selectedIds = new Set(selected.map((u) => u.id));
  const filteredResults = results.filter((u) => !selectedIds.has(u.id));

  const add = (u) => {
    onChange([...selected, u]);
    setQ("");
    setResults([]);
    setOpen(false);
  };

  const remove = (id) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stark/50" strokeWidth={2.5} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search comedians by name or username"
          className="retro-input w-full pl-9"
          data-testid="comedian-picker-input"
        />
      </div>

      {open && q.trim() && (
        <div className="absolute z-20 left-0 right-0 mt-1 ticket-card max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 font-mono-accent text-[10px] tracking-[0.2em] uppercase text-stark/60">
              Searching…
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="px-3 py-2 font-sub italic text-sm text-stark/60">
              No comedians found.
            </div>
          ) : (
            filteredResults.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => add(u)}
                className="w-full text-left px-3 py-2 hover:bg-marigold/10 flex items-center gap-3"
                data-testid={`comedian-result-${u.id}`}
              >
                <div className="w-8 h-8 bg-oxblood/15 border border-oxblood/50 text-oxblood flex items-center justify-center font-accent text-sm">
                  {(u.firstName?.[0] || u.username?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <div className="font-sub text-sm leading-none">{u.firstName} {u.lastName}</div>
                  <div className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-stark/60 mt-1">
                    @{u.username}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 border border-oxblood/50 bg-oxblood/10 text-oxblood font-mono-accent text-[10px] tracking-[0.2em] uppercase"
              data-testid={`comedian-chip-${u.id}`}
            >
              {u.firstName} {u.lastName}
              <button
                type="button"
                onClick={() => remove(u.id)}
                aria-label={`Remove ${u.username}`}
                className="hover:bg-oxblood/20 p-0.5"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
