import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Mic, Ticket, Users, Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ComedianPicker from "@/components/ComedianPicker";

const CATEGORIES = [
  { key: "STANDUP", label: "Stand-Up Show", Icon: Mic },
  { key: "IMPROV", label: "Improv Show", Icon: Users },
  { key: "OPEN_MIC", label: "Open Mic", Icon: Ticket },
];

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEvent() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [performers, setPerformers] = useState([]);
  const [originalCap, setOriginalCap] = useState(null);
  const [reservedCount, setReservedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        if (user && Number(data.organizer) !== Number(user.id)) {
          toast.error("You can't edit this show.");
          navigate(`/events/${id}`);
          return;
        }
        setForm({
          eventName: data.name || "",
          description: data.description || "",
          category: data.category || "STANDUP",
          streetAddress: data.streetAddress || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "USA",
          zipCode: data.zipCode || "",
          startTime: toLocalInput(data.startTime),
          endTime: toLocalInput(data.endTime),
          reservationCap: data.reservationCap ?? "",
        });
        setPerformers(data.performers || []);
        setOriginalCap(data.reservationCap ?? null);
        setReservedCount(data.reservedCount ?? 0);
      } catch (e) {
        toast.error(formatApiError(e));
        navigate("/events");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading || !form) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-mono-accent text-sm uppercase tracking-wider">
        Loading…
      </main>
    );
  }

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isStandup = form.category === "STANDUP";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (isStandup) {
        payload.reservationCap = form.reservationCap === "" ? null : Number(form.reservationCap);
        payload.performerIds = performers.map((p) => p.id);
      } else {
        payload.reservationCap = null;
        payload.performerIds = [];
      }
      await api.put(`/events/${id}`, payload);
      toast.success("Show updated.");
      navigate(`/events/${id}`);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to={`/events/${id}`} className="inline-flex items-center gap-2 font-mono-accent text-xs tracking-[0.2em] uppercase hover:text-oxblood">
        <ArrowLeft className="w-4 h-4" /> Back to show
      </Link>

      <header className="mt-4 mb-8">
        <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">Edit Show</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-1">Tighten the bill.</h1>
      </header>

      <form onSubmit={submit} className="ticket-card p-6 md:p-8 space-y-6">
        {error && (
          <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm" data-testid="edit-event-error">
            {error}
          </div>
        )}

        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Show Name</label>
          <input className="retro-input w-full mt-1" value={form.eventName} onChange={onChange("eventName")} required data-testid="ee-name" />
        </div>

        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Description</label>
          <textarea className="retro-input w-full mt-1 min-h-[120px] resize-y" value={form.description} onChange={onChange("description")} required data-testid="ee-desc" />
        </div>

        <div>
          <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70 mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.Icon;
              const active = form.category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c.key }))}
                  className={`chip ${active ? "chip-active" : ""}`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
              <MapPin className="inline w-3 h-3 mr-1" /> Street Address
            </label>
            <input className="retro-input w-full mt-1" value={form.streetAddress} onChange={onChange("streetAddress")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">City</label>
            <input className="retro-input w-full mt-1" value={form.city} onChange={onChange("city")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">State</label>
            <input className="retro-input w-full mt-1" value={form.state} onChange={onChange("state")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Country</label>
            <input className="retro-input w-full mt-1" value={form.country} onChange={onChange("country")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Zip Code</label>
            <input className="retro-input w-full mt-1" value={form.zipCode} onChange={onChange("zipCode")} required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
              <Calendar className="inline w-3 h-3 mr-1" /> Start Time
            </label>
            <input type="datetime-local" className="retro-input w-full mt-1" value={form.startTime} onChange={onChange("startTime")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
              <Clock className="inline w-3 h-3 mr-1" /> End Time
            </label>
            <input type="datetime-local" className="retro-input w-full mt-1" value={form.endTime} onChange={onChange("endTime")} required />
          </div>
        </div>

        {isStandup && (
          <>
            <div className="dashed-divider" />
            <div>
              <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-oxblood mb-1">
                Stand-Up Only
              </div>
              <h2 className="font-heading text-2xl">Lineup & Reservations</h2>
              <p className="font-sub italic text-stark/70 text-sm mt-1">
                {reservedCount > 0 ? `${reservedCount} reserved so far.` : "No reservations yet."} Cap can be raised, never lowered.
              </p>
            </div>

            <div>
              <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
                Reservation Cap
              </label>
              <input
                type="number"
                min={originalCap ?? 1}
                step="1"
                placeholder="leave blank for unlimited"
                className="retro-input w-full mt-1"
                value={form.reservationCap}
                onChange={onChange("reservationCap")}
                data-testid="ee-cap"
              />
              {originalCap !== null && (
                <p className="font-sub italic text-stark/60 text-xs mt-1">
                  Current cap: {originalCap}. New cap must be ≥ {originalCap}.
                </p>
              )}
            </div>

            <div>
              <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
                Lineup
              </label>
              <div className="mt-1">
                <ComedianPicker selected={performers} onChange={setPerformers} />
              </div>
            </div>
          </>
        )}

        <div className="pt-2">
          <button type="submit" disabled={busy} className="marquee-btn w-full md:w-auto" data-testid="ee-submit">
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
