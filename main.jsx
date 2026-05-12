import { Mic, Ticket, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-dim bg-paper/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center bg-oxblood">
              <Mic className="w-4 h-4 text-cream" strokeWidth={2.75} />
              <span className="absolute -top-1 -right-1 lime-dot" />
            </div>
            <div className="font-display text-2xl text-stark">
              Find Your <span className="italic font-serif-italic text-marigold">Funny</span>
            </div>
          </div>
          <p className="mt-4 font-serif-italic text-stark/55 max-w-md leading-relaxed text-[15px]">
            A speakeasy of a stage. Built for open mics, basement clubs, back rooms, and the
            brave souls who still do improv without a net.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="#" className="p-2 border border-dim hover:border-marigold hover:text-marigold text-stark/70 transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" strokeWidth={2.5} />
            </a>
            <a href="#" className="p-2 border border-dim hover:border-marigold hover:text-marigold text-stark/70 transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" strokeWidth={2.5} />
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-4">The Bill</div>
          <ul className="space-y-2.5 font-sans text-[13px] text-stark/70">
            <li><a href="/events" className="hover:text-oxblood transition-colors">All shows</a></li>
            <li><a href="/near-me" className="hover:text-oxblood transition-colors">Near me</a></li>
            <li><a href="/create-event" className="hover:text-oxblood transition-colors">Post a show</a></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">House Rules</div>
          <ul className="space-y-2.5 font-sans text-[13px] text-stark/55">
            <li>Tip your bartender.</li>
            <li>Clap even at the bad ones.</li>
            <li>Heckling voids the warranty.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dim/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/40">
          <div className="flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-marigold" strokeWidth={2.5} />
            <span>Admit one · Laugh loud</span>
          </div>
          <div>© Find Your Funny</div>
        </div>
      </div>
    </footer>
  );
}
