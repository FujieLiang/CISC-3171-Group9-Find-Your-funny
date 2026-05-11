import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, SkipForward, Mic } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";

const SWIPE_THRESHOLD = 120;

const formatTrait = (t) =>
  t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Onboarding() {
  const navigate = useNavigate();
  const [comedians, setComedians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState([]);
  const [passes, setPasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [fading, setFading] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/onboarding/swipe-set");
        setComedians(data.comedians || []);
      } catch (e) {
        toast.error(formatApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = comedians[index];
  const total = comedians.length;
  const done = !loading && total > 0 && index >= total;

  useEffect(() => {
    if (done) submit({ skipped: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const decide = (liked) => {
    if (!current || fading) return;
    if (liked) setLikes((arr) => [...arr, current.id]);
    else setPasses((arr) => [...arr, current.id]);
    setDrag({ x: 0, active: false });
    setFading(true);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setFading(false);
    }, 300);
  };

  const submit = async ({ skipped }) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post("/onboarding/submit", {
        skipped,
        likes: skipped ? [] : likes,
        passes: skipped ? [] : passes,
      });
      toast.success(skipped ? "Default humor profile saved." : "Humor profile saved.");
      navigate("/");
    } catch (e) {
      toast.error(formatApiError(e));
      setSubmitting(false);
    }
  };

  const onPointerDown = (e) => {
    if (!current) return;
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.active) return;
    setDrag((d) => ({ ...d, x: e.clientX - startX.current }));
  };
  const onPointerUp = () => {
    if (!drag.active) return;
    if (drag.x > SWIPE_THRESHOLD) decide(true);
    else if (drag.x < -SWIPE_THRESHOLD) decide(false);
    else setDrag({ x: 0, active: false });
  };

  const tilt = useMemo(() => drag.x * 0.06, [drag.x]);
  const likeOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      <header className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-oxblood glow-lime">
          <Mic className="w-5 h-5 text-marigold" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl mt-2">Build Your Humor Profile</h1>
        <p className="font-sub italic text-stark/70 text-sm mt-1">
          Swipe right on comedians you like, left on the ones you don't.
        </p>
      </header>

      {loading ? (
        <div className="ticket-card p-10 text-center font-mono-accent text-xs tracking-[0.25em] uppercase text-stark/60">
          Loading the lineup…
        </div>
      ) : total === 0 ? (
        <div className="ticket-card p-10 text-center space-y-4">
          <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-oxblood">
            No comedians on file
          </div>
          <p className="font-sub italic text-stark/70">
            We couldn't load any comedians. You can still set a default profile.
          </p>
          <button
            className="marquee-btn"
            onClick={() => submit({ skipped: true })}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Use Default Profile"}
          </button>
        </div>
      ) : done ? (
        <div className="ticket-card p-10 text-center font-mono-accent text-xs tracking-[0.25em] uppercase text-stark/60">
          {submitting ? "Saving your profile…" : "All done."}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">Card {index + 1} / {total}</span>
            <button
              className="chip hover:bg-ticket"
              onClick={() => submit({ skipped: true })}
              disabled={submitting}
              data-testid="onb-skip"
            >
              <SkipForward className="w-3.5 h-3.5" strokeWidth={2.5} />
              Skip this step
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 mb-6">
            <SwipeButton
              icon={X}
              label="Dislike"
              onClick={() => decide(false)}
              disabled={submitting}
              testId="onb-pass"
            />

            <div className="relative h-[420px] flex-1 min-w-0 select-none mt-12">
              <div
                className="ticket-card absolute inset-0 p-6 flex flex-col cursor-grab active:cursor-grabbing touch-none"
                style={{
                  transform: `translateX(${drag.x}px) rotate(${tilt}deg)`,
                  opacity: fading ? 0 : 1,
                  transition: drag.active
                    ? "none"
                    : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.28s ease",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                data-testid="onb-card"
              >
                <div
                  className="absolute top-5 left-5 tag-stamp"
                  style={{
                    opacity: passOpacity,
                    borderColor: "rgba(255, 95, 62, 0.8)",
                    color: "#FF5F3E",
                  }}
                >
                  Dislike
                </div>
                <div
                  className="absolute top-5 right-5 tag-stamp"
                  style={{
                    opacity: likeOpacity,
                    borderColor: "#C7F542",
                    color: "#C7F542",
                  }}
                >
                  Like
                </div>

                <CardBody comedian={current} />
              </div>
            </div>

            <SwipeButton
              icon={Heart}
              label="Like"
              onClick={() => decide(true)}
              disabled={submitting}
              testId="onb-like"
            />
          </div>

          <p className="text-center mt-6 font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/50">
            New here? Skip and we'll start you at a balanced 5 across every category.
          </p>
        </>
      )}
    </main>
  );
}

function SwipeButton({ icon: Icon, label, onClick, disabled, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-testid={testId}
      className="shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
      style={{
        background: "#C7F542",
        color: "#0B0906",
        border: "1px solid #C7F542",
        boxShadow: "0 0 18px rgba(199, 245, 66, 0.35)",
      }}
    >
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
    </button>
  );
}

function CardBody({ comedian }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-marigold">
        Headliner
      </div>
      <h2 className="font-display text-5xl mt-3 leading-tight">{comedian.name}</h2>

      <div className="dashed-divider my-5" />

      <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/60 mb-3">
        Signature Style
      </div>
      <div className="flex flex-wrap gap-2">
        {(comedian.topTraits || []).map((t) => (
          <span key={t} className="tag-stamp">{formatTrait(t)}</span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="ticket-perforation-h" />
        <div className="flex items-center justify-between mt-3 font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/50">
          <span>Drag the card</span>
          <span>← Pass · Like →</span>
        </div>
      </div>
    </div>
  );
}
