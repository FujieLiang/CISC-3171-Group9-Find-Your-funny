import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Mic, Ticket, Users, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "STANDUP", label: "Stand-Up Show", Icon: Mic },
  { key: "IMPROV", label: "Improv Show", Icon: Users },
  { key: "OPEN_MIC", label: "Open Mic", Icon: Ticket },
];

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventName: "",
    description: "",
    category: "STANDUP",
    streetAddress: "",
    city: "",
    state: "",
    country: "USA",
    zipCode: "",
    startTime: "",
    endTime: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      const { data } = await api.post("/events", payload);
      toast.success("Show is on the bill!");
      navigate(`/events/${data.event.id}`);
    } catch (e) {
      setError(formatApiError(e));
    } finally { setBusy(false); }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">Post a Show</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-1">List your night.</h1>
        <p className="font-sub italic text-lg mt-3 text-stark/70">
          Fill out the handbill. We’ll paste it on every digital lamppost in the neighborhood.
        </p>
      </header>

      <form onSubmit={submit} className="ticket-card p-6 md:p-8 space-y-6">
        {error && <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm" data-testid="create-event-error">{error}</div>}

        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Show Name</label>
          <input
            data-testid="ce-name"
            className="retro-input w-full mt-1"
            placeholder="e.g. Thursday Night Chuckle Shack"
            value={form.eventName}
            onChange={onChange("eventName")}
            required
          />
        </div>

        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Description</label>
          <textarea
            data-testid="ce-desc"
            className="retro-input w-full mt-1 min-h-[120px] resize-y"
            placeholder="Tell folks what kind of night it is…"
            value={form.description}
            onChange={onChange("description")}
            required
          />
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
                  data-testid={`ce-cat-${c.key}`}
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
            <input data-testid="ce-street" className="retro-input w-full mt-1" value={form.streetAddress} onChange={onChange("streetAddress")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">City</label>
            <input data-testid="ce-city" className="retro-input w-full mt-1" value={form.city} onChange={onChange("city")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">State</label>
            <input data-testid="ce-state" className="retro-input w-full mt-1" value={form.state} onChange={onChange("state")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Country</label>
            <input data-testid="ce-country" className="retro-input w-full mt-1" value={form.country} onChange={onChange("country")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Zip Code</label>
            <input data-testid="ce-zip" className="retro-input w-full mt-1" value={form.zipCode} onChange={onChange("zipCode")} required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
              <Calendar className="inline w-3 h-3 mr-1" /> Start Time
            </label>
            <input data-testid="ce-start" type="datetime-local" className="retro-input w-full mt-1" value={form.startTime} onChange={onChange("startTime")} required />
          </div>
          <div>
            <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">
              <Clock className="inline w-3 h-3 mr-1" /> End Time
            </label>
            <input data-testid="ce-end" type="datetime-local" className="retro-input w-full mt-1" value={form.endTime} onChange={onChange("endTime")} required />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={busy} className="marquee-btn w-full md:w-auto" data-testid="ce-submit">
            {busy ? "Posting…" : "Post Show to the Bill"}
          </button>
        </div>
      </form>
    </main>
  );
}
