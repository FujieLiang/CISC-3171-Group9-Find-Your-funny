import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Calendar, Clock, Ticket, Users, Mic, ArrowLeft, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_LABEL = { STANDUP: "Stand-Up Show", IMPROV: "Improv Show", OPEN_MIC: "Open Mic" };
const CATEGORY_COLOR = { STANDUP: "bg-oxblood text-cream", IMPROV: "bg-marigold text-cream", OPEN_MIC: "bg-hotpink text-cream" };

function formatDT(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return iso; }
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signedUp, setSignedUp] = useState(false);
  const [signups, setSignups] = useState(null); // organizer-only
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);

      try {
        const { data: list } = await api.get(`/events/${id}/signups`);
        setSignups(list.signups || []);
      } catch {}

      if (user) {
        try {
          const { data: s } = await api.get(`/events/${id}/my-signup`);
          setSignedUp(!!s.signedUp);
        } catch {}
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user?.id]);

  const onSignup = async () => {
    if (!user) { navigate("/login"); return; }
    setBusy(true);
    try {
      await api.post(`/events/${id}/signup`);
      setSignedUp(true);
      toast.success("You’re on the list. Break a leg.");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const onCancel = async () => {
    setBusy(true);
    try {
      await api.delete(`/events/${id}/signup`);
      setSignedUp(false);
      toast.success("Pulled your name off the list.");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const onDelete = async () => {
    if (!window.confirm("Really delete this show?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Show deleted.");
      navigate("/events");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  if (loading) return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-mono-accent text-sm uppercase tracking-wider">Loading…</main>
  );
  if (!event) return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="ticket-card p-8 text-center">
        <h2 className="font-heading text-3xl">Event not found.</h2>
        <Link to="/events" className="marquee-btn-sm inline-block mt-4">Back to the bill</Link>
      </div>
    </main>
  );

  const isOrganizer = user && user.id === event.organizer;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/events" className="inline-flex items-center gap-2 font-mono-accent text-xs tracking-[0.2em] uppercase hover:text-oxblood" data-testid="event-back">
        <ArrowLeft className="w-4 h-4" /> Back to bill
      </Link>

      <article className="mt-4 border-2 border-stark bg-paper shadow-stub-lg">
        <div className="bg-ticket border-b border-dim px-6 py-3 flex items-center justify-between">
          <div className="marquee-bulbs">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} className="bulb" />)}
          </div>
          <div className="font-mono-accent text-[10px] tracking-[0.3em] uppercase text-marigold">ADMIT ONE · № {event.id.slice(0,6).toUpperCase()}</div>
          <div className="marquee-bulbs">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} className="bulb" />)}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="p-8 md:border-r md:border-dashed md:border-marigold/25">
            <div className={`inline-flex items-center gap-2 px-3 py-1 font-mono-accent text-[10px] tracking-[0.22em] uppercase ${CATEGORY_COLOR[event.category]}`}>
              {event.category === "STANDUP" && <Mic className="w-3.5 h-3.5" strokeWidth={2.5} />}
              {event.category === "IMPROV" && <Users className="w-3.5 h-3.5" strokeWidth={2.5} />}
              {event.category === "OPEN_MIC" && <Ticket className="w-3.5 h-3.5" strokeWidth={2.5} />}
              {CATEGORY_LABEL[event.category] || event.category}
            </div>
            <h1 className="font-heading text-4xl md:text-5xl mt-3 leading-tight">{event.name}</h1>
            <p className="font-sub italic text-lg mt-3 text-stark/80">{event.description}</p>

            <div className="dashed-divider my-6" />

            <dl className="grid sm:grid-cols-2 gap-5 font-body">
              <div>
                <dt className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/60">Where</dt>
                <dd className="mt-1 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-oxblood" strokeWidth={2.5} />
                  <span>{event.streetAddress}<br/>{event.city}, {event.state} {event.zipCode}</span>
                </dd>
              </div>
              <div>
                <dt className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/60">Hosted by</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-oxblood" strokeWidth={2.5} />
                  <span>{event.organizerName || "Anonymous"}</span>
                </dd>
              </div>
              <div>
                <dt className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/60">Starts</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-oxblood" strokeWidth={2.5} />
                  <span>{formatDT(event.startTime)}</span>
                </dd>
              </div>
              <div>
                <dt className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/60">Ends</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-oxblood" strokeWidth={2.5} />
                  <span>{formatDT(event.endTime)}</span>
                </dd>
              </div>
            </dl>
          </div>

          <aside className="p-8 bg-ticket">
            <div className="flex items-center justify-between">
              <div className="font-mono-accent text-[10px] tracking-[0.3em] uppercase text-oxblood">Stub</div>
              <div className="font-mono-accent text-[10px] tracking-[0.3em] uppercase text-stark/60">№ {event.id.slice(0,6).toUpperCase()}</div>
            </div>
            <div className="font-heading text-3xl mt-2 leading-tight">{event.name}</div>
            <div className="mt-4 space-y-3 font-body text-sm">
              <div>
                <div className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-stark/60">Date</div>
                <div className="font-heading text-xl">{formatDT(event.startTime)}</div>
              </div>
              <div>
                <div className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-stark/60">Signups</div>
                <div className="font-heading text-xl">{event.signupCount || 0}</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {!isOrganizer && (
                signedUp ? (
                  <button onClick={onCancel} disabled={busy} className="w-full marquee-btn-light inline-flex items-center justify-center gap-2" data-testid="event-cancel-signup">
                    <XCircle className="w-4 h-4" strokeWidth={2.5} /> Cancel Signup
                  </button>
                ) : (
                  <button onClick={onSignup} disabled={busy} className="w-full marquee-btn inline-flex items-center justify-center gap-2" data-testid="event-signup-button">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> {user ? "Get on the List" : "Login to Sign Up"}
                  </button>
                )
              )}
              {isOrganizer && (
                <>
                  <Link to={`/events/${event.id}/edit`} className="w-full marquee-btn-light inline-flex items-center justify-center" data-testid="event-edit">Edit Show</Link>
                  <button onClick={onDelete} className="w-full border border-destructive/60 bg-destructive/10 text-destructive px-4 py-2.5 font-accent text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-destructive hover:text-stark transition-colors" data-testid="event-delete">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} /> Delete
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>

        <div className="px-8 py-6 border-t-2 border-stark">
          <h2 className="font-heading text-2xl">Signup List</h2>
          {signups === null ? (
            <p className="font-mono-accent text-xs uppercase tracking-wider mt-2">Loading…</p>
          ) : signups.length === 0 ? (
            <p className="font-sub italic text-stark/70 mt-2">Nobody yet. The mic is quiet.</p>
          ) : (
            <ul className="mt-3 divide-y-2 divide-dashed divide-stark/30">
              {signups.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between" data-testid={`signup-row-${s.id}`}>
                  <Link
                    to={`/profile/${s.userId}`}
                    className="flex items-center justify-between hover:bg-marigold/10 -mx-2 px-2 py-1 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-oxblood/15 border border-oxblood/50 text-oxblood flex items-center justify-center font-accent">
                      {String(s.displayName || s.userName || "?").trim()[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-sub text-lg leading-none">{s.displayName || s.userName}</div>
                      {s.displayName && (
                        <div className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-stark/60">
                          @{s.userName}
                        </div>
                      )}
                    </div>
                  </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </main>
  );
}
