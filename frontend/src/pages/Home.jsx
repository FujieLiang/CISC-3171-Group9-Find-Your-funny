import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mic, MapPin, Ticket, Users, ArrowRight, Compass, Sparkle, Radio } from "lucide-react";
import { api } from "@/lib/api";
import EventCard from "@/components/EventCard";

const HERO_IMG = "https://images.unsplash.com/photo-1648237409808-aa4649c07ec8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxzdGFuZCUyMHVwJTIwY29tZWR5JTIwbWljcm9waG9uZSUyMHN0YWdlfGVufDB8fHx8MTc3NjY1NzM3Nnww&ixlib=rb-4.1.0&q=85";
const AUDIENCE_IMG = "https://images.unsplash.com/photo-1699616040692-987a9be61635?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxjb21lZHklMjBjbHViJTIwYXVkaWVuY2UlMjBsYXVnaGluZ3xlbnwwfHx8fDE3NzY2NTczNzZ8MA&ixlib=rb-4.1.0&q=85";

const TICKER_ITEMS = [
  "Tonight · Basement sets · Open mic 9pm",
  "No two-drink minimum",
  "Back-room improv · Members only",
  "Open stage · Sign-up at the door",
  "Live from the booth · Laughs guaranteed",
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/events");
        setEvents(data.slice(0, 4));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="spotlight-overlay absolute inset-0 pointer-events-none" />

        {/* LIVE TICKER */}
        <div className="border-b border-dim bg-paper/60 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 px-4 sm:px-6 lg:px-8 py-3 shrink-0 border-r border-dim bg-cream">
              <span className="live-dot" />
              <span className="font-accent text-[11px] tracking-[0.15em] uppercase text-hotpink">Live</span>
            </div>
            <div className="ticker-wrap flex-1 py-3">
              <div className="ticker-track">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                  <span key={i} className="font-mono-accent text-[11px] tracking-[0.22em] uppercase text-stark/70 inline-flex items-center gap-3">
                    <span className="text-marigold">✦</span> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 border border-marigold/30 bg-paper/60 backdrop-blur-sm px-3 py-1.5">
              <Sparkle className="w-3 h-3 text-marigold" strokeWidth={2.5} fill="currentColor" />
              <span className="font-mono-accent text-[10px] tracking-[0.28em] uppercase text-marigold">
                Underground · Est. Tonight
              </span>
            </div>

            <h1 className="font-display text-[4rem] sm:text-7xl lg:text-[7.5rem] leading-[0.9] mt-8 text-stark tracking-tight">
              Find Your
              <span className="block">
                <span className="italic font-serif-italic text-oxblood" style={{ textShadow: "0 0 40px rgba(199,245,66,0.35)" }}>
                  funny
                </span>
                <span className="text-marigold">.</span>
              </span>
            </h1>

            <p className="font-sans text-[17px] md:text-[19px] mt-7 max-w-xl text-stark/65 leading-relaxed">
              Basement open mics. Back-room improv. Headliners you'll brag about
              knowing <span className="italic font-serif-italic text-marigold">before</span> they were headliners.
              All gathered in one dimly lit spot.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/near-me" className="btn-primary" data-testid="home-cta-nearme">
                <Compass className="w-4 h-4" strokeWidth={2.75} />
                Shows near me
              </Link>
              <Link to="/events" className="btn-secondary" data-testid="home-cta-browse">
                Browse the bill
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>

            <div className="mt-14 flex items-center gap-6 flex-wrap">
              <CategoryMini icon={Mic} label="Stand-Up" />
              <span className="w-px h-5 bg-dim" />
              <CategoryMini icon={Users} label="Improv" />
              <span className="w-px h-5 bg-dim" />
              <CategoryMini icon={Ticket} label="Open Mic" />
              <span className="w-px h-5 bg-dim" />
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-hotpink animate-pulse" strokeWidth={2.5} />
                <span className="font-mono-accent text-[10px] tracking-[0.22em] uppercase text-stark/60">
                  Low-lit · Loud laughs
                </span>
              </div>
            </div>
          </div>

          {/* Hero visual — speakeasy member card */}
          <div className="lg:col-span-5 relative">
            <div className="relative border border-marigold/40 bg-paper overflow-hidden glow-gold">
              <div className="relative">
                <img
                  src={HERO_IMG}
                  alt="Neon microphone in a dark club"
                  className="w-full h-80 object-cover opacity-80"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(11,9,6,0.1) 0%, rgba(11,9,6,0.4) 50%, rgba(11,9,6,0.95) 100%)",
                  }}
                />
                <div className="absolute top-4 left-4 tag-stamp">
                  № 001 · Members Only
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 border border-hotpink/60 bg-cream/60 backdrop-blur-sm">
                  <span className="live-dot" />
                  <span className="font-accent text-[10px] uppercase tracking-wider text-hotpink">On air</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="eyebrow">The House Card</div>
                  <div className="font-display text-[2.2rem] md:text-5xl mt-2 leading-[0.95] text-stark">
                    One mic.<br/>
                    One room.<br/>
                    <span className="italic font-serif-italic text-oxblood">Infinite bits.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-dim">
                <div className="grid grid-cols-3 gap-4">
                  <Meta label="Doors" value="19:30" accent />
                  <Meta label="Curtain" value="20:00" />
                  <Meta label="Cover" value="None" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TONIGHT ON THE BILL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="eyebrow">Now playing</div>
            <h2 className="font-display text-[2.75rem] md:text-6xl mt-2 text-stark leading-[0.95]">
              Tonight on the <span className="italic font-serif-italic text-marigold">bill</span>.
            </h2>
          </div>
          <Link
            to="/events"
            className="font-sans text-sm font-medium text-stark/70 hover:text-oxblood transition-colors inline-flex items-center gap-1"
            data-testid="home-see-all"
          >
            See the whole bill <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-ticket/60 border border-dim animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyBill />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        )}
      </section>

      {/* COMMUNITY BAND */}
      <section className="relative border-y border-dim overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(199,245,66,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(200,163,92,0.15) 0%, transparent 40%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative">
          <div>
            <div className="eyebrow">For the masses</div>
            <h2 className="font-display text-[2.5rem] md:text-6xl mt-3 leading-[0.98] text-stark">
              Open mic shouldn't require a{" "}
              <span className="italic font-serif-italic text-oxblood">
                secret handshake.
              </span>
            </h2>
            <p className="font-sans text-[17px] mt-6 text-stark/60 max-w-xl leading-relaxed">
              Post your show in two minutes. Let strangers sign up. Watch someone kill with
              a bit about their dentist. That's the whole thing — no cover, no clipboard, no gatekeeping.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap items-center">
              <Link to="/create-event" className="btn-primary" data-testid="home-list-show">
                List your show
                <Mic className="w-4 h-4" strokeWidth={2.75} />
              </Link>
              <Link
                to="/register"
                className="font-sans text-sm font-medium text-stark/70 hover:text-marigold transition-colors inline-flex items-center gap-1"
                data-testid="home-join"
              >
                Not yet a member? <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden border border-marigold/30">
              <img
                src={AUDIENCE_IMG}
                alt="Audience laughing in the dim"
                className="w-full h-80 lg:h-[26rem] object-cover"
                style={{ filter: "saturate(0.85) contrast(1.08) brightness(0.75)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(11,9,6,0.2) 0%, rgba(11,9,6,0.0) 40%, rgba(11,9,6,0.75) 100%)",
                }}
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-oxblood text-cream border border-oxblood px-4 py-2 font-accent text-2xl leading-none glow-lime">
              HA. HA. HA.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-14">
          <div className="eyebrow">The three-act play</div>
          <h2 className="font-display text-[2.5rem] md:text-5xl mt-2 text-stark">
            How it <span className="italic font-serif-italic text-marigold">works</span>.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <Step n="01" title="Drop a pin" desc="Type your address — or let us guess with one tap of the mic." icon={MapPin} />
          <Step n="02" title="Pick a punchline" desc="Stand-up. Improv. Open mic. Filter by category or distance." icon={Ticket} />
          <Step n="03" title="Get on the list" desc="Sign up in one click. Organizers see who's coming." icon={Mic} />
        </div>
      </section>
    </main>
  );
}

function Meta({ label, value, accent }) {
  return (
    <div>
      <div className="eyebrow-muted">{label}</div>
      <div className={`font-accent text-xl md:text-[22px] mt-1.5 ${accent ? "text-oxblood" : "text-stark"}`}>
        {value}
      </div>
    </div>
  );
}

function CategoryMini({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-stark/70">
      <Icon className="w-4 h-4 text-marigold" strokeWidth={2.5} />
      <span className="font-mono-accent text-[10px] tracking-[0.25em] uppercase">{label}</span>
    </div>
  );
}

function Step({ n, title, desc, icon: Icon }) {
  return (
    <div className="soft-card p-8 relative group">
      <div className="flex items-center justify-between">
        <div className="font-accent text-5xl text-oxblood leading-none">{n}</div>
        <div className="w-10 h-10 flex items-center justify-center border border-marigold/40 text-marigold group-hover:border-marigold group-hover:text-stark transition-colors">
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </div>
      </div>
      <h3 className="font-display text-[26px] mt-8 text-stark leading-tight">{title}</h3>
      <p className="font-sans text-[14px] text-stark/55 mt-3 leading-relaxed">{desc}</p>
    </div>
  );
}

function EmptyBill() {
  return (
    <div className="soft-card p-12 text-center">
      <Ticket className="w-8 h-8 text-oxblood mx-auto" strokeWidth={2.5} />
      <h3 className="font-display text-3xl mt-4 text-stark">The room is quiet. For now.</h3>
      <p className="font-serif-italic text-stark/55 mt-2">Be the first punchline — list a show and pack the back room.</p>
      <Link to="/create-event" className="btn-primary inline-flex mt-6" data-testid="empty-bill-cta">Post a show</Link>
    </div>
  );
}
