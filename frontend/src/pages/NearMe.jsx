import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import EventCard from "@/components/EventCard";
import CategoryTabs from "@/components/CategoryTabs";
import { Compass, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NearMe() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [loc, setLoc] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [address, setAddress] = useState(null);
  const [error, setError] = useState("");

  const fetchNearby = async (lat, lon) => {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/events/nearby-public", { params: { lat, lon, limit: 40 } });
      setEvents(data);
      setStatus("ready");
    } catch (e) {
      setError(formatApiError(e));
      setStatus("error");
    }
  };

  const detectLocation = () => {
  if (!navigator.geolocation) {
    setError("Your browser doesn't support geolocation.");
    setStatus("error");
    return;
  }

  setStatus("locating");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      setLoc({ lat: latitude, lon: longitude });

      try {
        const { data } = await api.post("/geo/reverse", {
          latitude,
          longitude,
        });

        console.log("reverse response:", data);

        // adjust depending on backend shape
        setAddress(data.address ?? data);

      } catch (err) {
        console.error("Reverse geocode failed:", err);
      }

      fetchNearby(latitude, longitude);
    },
    (err) => {
      setError(err.message || "We couldn't get your location.");
      setStatus("error");
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
};

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setLoc({ lat: user.latitude, lon: user.longitude });
      fetchNearby(user.latitude, user.longitude);
    } else {
      detectLocation();
    }
    // eslint-disable-next-line
  }, []);

  const filtered = category === "ALL" ? events : events.filter((e) => e.category === category);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">Within Heckling Distance</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-1">Shows Near You</h1>
        <div className="mt-3 flex items-center gap-2 font-sub italic text-lg text-stark/80">
          <MapPin className="w-5 h-5 text-oxblood" strokeWidth={2.5} />
          {address?.city ? (
            <span>In or around <span className="font-bold not-italic">{address.city}{address.state ? `, ${address.state}` : ""}</span></span>
          ) : loc ? (
            <span className="font-mono-accent text-sm">{loc.lat.toFixed(3)}, {loc.lon.toFixed(3)}</span>
          ) : (
            <span>We’ll find you…</span>
          )}
          <button onClick={detectLocation} className="chip ml-2" data-testid="near-me-relocate">
            <Compass className="w-3.5 h-3.5" strokeWidth={2.5} />
            Relocate
          </button>
        </div>
      </header>

      <div className="mb-6">
        <CategoryTabs value={category} onChange={setCategory} />
      </div>

      {status === "locating" && (
        <div className="flex items-center gap-3 text-stark/70 font-mono-accent text-sm uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" /> Finding you under the spotlight…
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-3 text-stark/70 font-mono-accent text-sm uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading the bill…
        </div>
      )}

      {status === "error" && (
        <div className="ticket-card p-8">
          <h3 className="font-heading text-2xl">We couldn’t pin you down.</h3>
          <p className="font-sub italic text-stark/70 mt-2">{error || "Try enabling location or browsing all shows."}</p>
          <button onClick={detectLocation} className="marquee-btn-sm mt-4" data-testid="near-me-retry">Try Again</button>
        </div>
      )}

      {status === "ready" && (
        filtered.length === 0 ? (
          <div className="ticket-card p-10 text-center">
            <h3 className="font-heading text-3xl">No shows within earshot.</h3>
            <p className="font-sub italic text-stark/70 mt-2">Try removing the category filter, or be the first to post one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        )
      )}
    </main>
  );
}
