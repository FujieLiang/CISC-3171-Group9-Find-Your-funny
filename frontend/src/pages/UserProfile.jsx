import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCard";
import { Mic, Plus, Ticket, User } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
 
  const [tab, setTab] = useState("created");
  const [created, setCreated] = useState([]);
  const [signed, setSigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser && Number(id) === currentUser.id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/users/${id}`);
        setProfileUser(res.data);
      } catch (e) {
        setError(formatApiError(e));
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!profileUser) return;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const [a, b] = await Promise.all([
           api.get(`/users/${id}/events/created`),
           api.get(`/users/${id}/events/signedup`),
        ]);
        setCreated(a.data); setSigned(b.data);
      } catch (e) { setError(formatApiError(e)); }
      finally { setLoading(false); }
    })();
  }, [profileUser, id, isOwnProfile]);

  if (!currentUser) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="font-mono-accent text-sm uppercase tracking-wider text-stark/70">
          Please log in to view profiles.
        </div>
      </main>
    );
  }

  if (!id) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="font-mono-accent text-sm uppercase tracking-wider text-stark/70">
          Invalid profile URL.
        </div>
      </main>
    );
  }

  if (!profileUser) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error ? (
          <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm">
            {error}
          </div>
        ) : (
          <div className="font-mono-accent text-sm uppercase tracking-wider text-stark/70">
            Loading…
          </div>
        )}
      </main>
    );
  }

  const list = tab === "created" ? created : signed;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">
            The Playbill
          </div>

          {isOwnProfile ? (
            <h1 className="font-heading text-5xl md:text-6xl mt-1">
              Hey, {profileUser.firstName}.
            </h1>
          ) : (
            <h1 className="font-heading text-5xl md:text-6xl mt-1">
              {profileUser.firstName} {profileUser.lastName}
            </h1>
          )}

          <p className="font-sub italic text-lg mt-2 text-stark/70">
            @{profileUser.username} · {profileUser.city}, {profileUser.state}
          </p>
        </div>

        {isOwnProfile ? (
          <Link to="/create-event" className="marquee-btn inline-flex items-center gap-2">
            <Plus className="w-5 h-5" strokeWidth={2.5} /> New Show
          </Link>
        ) : (
          <FollowButton targetUserId={profileUser.id} />
        )}
      </header>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatTile label="Shows hosted" value={created.length} Icon={Mic} />
        <StatTile label="On the list" value={signed.length} Icon={Ticket} />
        <StatTile label="Role" value={profileUser.role === 2 ? "Comic" : "Fan"} Icon={User} />
        <StatTile label="Home" value={`${profileUser.city}`} Icon={Ticket} />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("created")}
          className={`chip ${tab === "created" ? "chip-active" : ""}`}
        >
          <Mic className="w-3.5 h-3.5" strokeWidth={2.5} /> 
          {isOwnProfile ? "My Shows" : "Their Shows"}
        </button>

        <button
          onClick={() => setTab("signed")}
          className={`chip ${tab === "signed" ? "chip-active" : ""}`}
        >
          <Ticket className="w-3.5 h-3.5" strokeWidth={2.5} /> 
          {isOwnProfile ? "Signed Up" : "They Signed Up"}
        </button>
      </div>

      {error && (
        <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="font-mono-accent text-sm uppercase tracking-wider text-stark/70">
          Loading…
        </div>
      ) : list.length === 0 ? (
        <div className="ticket-card p-10 text-center">
          <h3 className="font-heading text-3xl">
            {isOwnProfile
              ? tab === "created"
                ? "No shows on your playbill yet."
                : "You haven’t signed up for anything."
              : tab === "created"
                ? "No shows yet."
                : "No signups yet."}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function StatTile({ label, value, Icon }) {
  return (
    <div className="ticket-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-marigold/15 border border-marigold/50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-stark" strokeWidth={2.5} />
      </div>
      <div>
        <div className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-stark/60">
          {label}
        </div>
        <div className="font-heading text-2xl leading-none mt-1">{value}</div>
      </div>
    </div>
  );
}
  


