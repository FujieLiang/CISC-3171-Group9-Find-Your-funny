import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
const res = await api.get(`/users/search`, { params: { q: query } });        
        setResults(res.data.users || res.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xs" ref={searchRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-stark/50" />
        <input
          type="text"
          placeholder="Search @username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="w-full bg-background border border-stark/20 text-stark font-mono-accent text-[12px] tracking-widest pl-9 pr-8 py-2 focus:outline-none focus:border-marigold transition-colors placeholder:text-stark/30"
        />
        
        <div className="absolute right-3 flex items-center">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-marigold animate-spin" />
          ) : query ? (
            <button onClick={clearSearch} className="text-stark/50 hover:text-stark transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-background border border-stark/20 shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="flex flex-col">
              {results.map((user) => (
                <li key={user.id} className="border-b border-stark/10 last:border-0">
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={clearSearch}
                    className="flex items-center gap-3 p-3 hover:bg-marigold/10 transition-colors"
                  >
                    <div className="w-8 h-8 bg-oxblood/15 border border-oxblood/50 text-oxblood flex items-center justify-center font-accent shrink-0 text-sm">
                      {(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-sub text-sm leading-none truncate text-stark">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-stark/60 mt-1 truncate">
                        @{user.username}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center font-sub italic text-stark/50 text-sm">
              No comics or fans found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}