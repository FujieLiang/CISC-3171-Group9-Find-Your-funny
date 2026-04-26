import { Link } from "react-router-dom";
import { MapPin, Clock, Mic, Ticket, Users, ArrowUpRight } from "lucide-react";

const CATEGORY_META = {
  STANDUP: { label: "Stand-Up", dot: "bg-oxblood", Icon: Mic },
  IMPROV: { label: "Improv", dot: "bg-marigold", Icon: Users },
  OPEN_MIC: { label: "Open Mic", dot: "bg-hotpink", Icon: Ticket },
};

function formatDate(iso) {
  if (!iso) return "TBD";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return iso; }
}
function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}
function weekday(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
  } catch { return ""; }
}

export default function EventCard({ event, index = 0 }) {
  const meta = CATEGORY_META[event.category] || CATEGORY_META.STANDUP;
  const [mo, day] = formatDate(event.startTime).split(" ");

  return (
    <Link
      to={`/events/${event.id}`}
      data-testid={`event-card-${event.id}`}
      className="group block ticket-card animate-fade-up overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex">
        {/* Date stub */}
        <div className="w-24 sm:w-28 shrink-0 bg-ticket border-r border-dashed border-marigold/25 p-4 flex flex-col items-center justify-center text-center">
          <div className="font-mono-accent text-[9px] tracking-[0.28em] uppercase text-marigold/80">{weekday(event.startTime)}</div>
          <div className="font-accent text-[2rem] leading-none mt-1.5 text-stark tracking-tight">{day}</div>
          <div className="font-mono-accent text-[10px] tracking-[0.22em] uppercase text-stark/55 mt-1">{mo}</div>
          <div className="ticket-perforation-h w-full my-3" />
          <div className="font-mono-accent text-[10px] tracking-[0.15em] text-oxblood">{formatTime(event.startTime)}</div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 min-w-0 relative">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/75">{meta.label}</span>
            </div>
            {typeof event.distanceKm === "number" && (
              <div className="flex items-center gap-1 font-mono-accent text-[10px] tracking-wider text-marigold/80">
                <MapPin className="w-3 h-3" strokeWidth={2.5} />
                {event.distanceKm.toFixed(1)} km
              </div>
            )}
          </div>

          <h3 className="font-display text-[22px] leading-[1.1] text-stark line-clamp-2 pr-6 relative">
            {event.name}
            <ArrowUpRight
              className="absolute top-0.5 right-0 w-4 h-4 text-stark/30 group-hover:text-oxblood group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
              strokeWidth={2.5}
            />
          </h3>

          <p className="mt-1.5 font-serif-italic text-stark/55 text-[13px] line-clamp-2 leading-snug">
            {event.description}
          </p>

          <div className="mt-4 space-y-1.5 font-sans text-[13px] text-stark/75">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-marigold/70 shrink-0" strokeWidth={2.5} />
              <span className="truncate">{event.city}, {event.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-marigold/70" strokeWidth={2.5} />
              <span>{formatTime(event.startTime)}{formatTime(event.endTime) ? ` – ${formatTime(event.endTime)}` : ""}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dim flex items-center justify-between">
            <div className="font-mono-accent text-[10px] tracking-[0.2em] uppercase text-stark/45">
              by <span className="text-marigold">{event.organizerName || "Anon"}</span>
            </div>
            <div className="font-mono-accent text-[10px] tracking-[0.2em] uppercase text-stark/45">
              {event.signupCount || 0} on list
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
