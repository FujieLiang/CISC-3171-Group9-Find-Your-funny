import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Ticket, Compass } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "USA",
    zipCode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await register(form);
    setBusy(false);
    if (res.ok) navigate("/");
    else setError(res.error);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data: d } = await api.post("/geo/reverse", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });

          const a = d?.raw?.address || {};
          setForm((f) => ({
            ...f,
            streetAddress: [a.house_number, a.road].filter(Boolean).join(" ") || f.streetAddress,
            city: d.city || a.city || a.town || a.village || f.city,
            state: d.state || f.state,
            country: d.country || f.country,
            zipCode: d.zipCode || a.postcode || f.zipCode,
          }));
        } catch {}
      },
      () => {}
    );
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-oxblood glow-lime">
          <Ticket className="w-7 h-7 text-marigold" strokeWidth={2.5} />
        </div>
        <h1 className="font-heading text-5xl mt-4">Get the Ticket</h1>
        <p className="font-sub italic text-stark/70 mt-1">Make an account — sign up for shows, post your own.</p>
      </div>

      <form onSubmit={submit} className="ticket-card p-6 space-y-5">
        {error && <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm" data-testid="register-error">{error}</div>}

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="First Name" testid="reg-first"><input className="retro-input w-full" value={form.firstName} onChange={onChange("firstName")} required data-testid="reg-first" /></Field>
          <Field label="Last Name" testid="reg-last"><input className="retro-input w-full" value={form.lastName} onChange={onChange("lastName")} required data-testid="reg-last" /></Field>
          <Field label="Username"><input className="retro-input w-full" value={form.username} onChange={onChange("username")} required data-testid="reg-username" /></Field>
          <Field label="Email"><input type="email" className="retro-input w-full" value={form.email} onChange={onChange("email")} required data-testid="reg-email" /></Field>
          <Field label="Password" className="md:col-span-2"><input type="password" className="retro-input w-full" value={form.password} onChange={onChange("password")} required data-testid="reg-password" /></Field>
        </div>

        <div className="dashed-divider" />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-oxblood">Home Address (for nearby shows)</div>
          <button type="button" onClick={detectLocation} className="chip hover:bg-ticket" data-testid="reg-detect">
            <Compass className="w-3.5 h-3.5" strokeWidth={2.5} />
            Auto-fill from location
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Street Address" className="md:col-span-2"><input className="retro-input w-full" value={form.streetAddress} onChange={onChange("streetAddress")} required data-testid="reg-street" /></Field>
          <Field label="City"><input className="retro-input w-full" value={form.city} onChange={onChange("city")} required data-testid="reg-city" /></Field>
          <Field label="State"><input className="retro-input w-full" value={form.state} onChange={onChange("state")} required data-testid="reg-state" /></Field>
          <Field label="Country"><input className="retro-input w-full" value={form.country} onChange={onChange("country")} required data-testid="reg-country" /></Field>
          <Field label="Zip Code"><input className="retro-input w-full" value={form.zipCode} onChange={onChange("zipCode")} required data-testid="reg-zip" /></Field>
        </div>

        <button type="submit" disabled={busy} className="marquee-btn w-full" data-testid="reg-submit">
          {busy ? "Creating account…" : "Print my ticket"}
        </button>
      </form>

      <p className="text-center mt-6 font-sub italic text-stark/70">
        Already got a ticket? <Link to="/login" className="text-oxblood underline underline-offset-4" data-testid="register-login-link">Log in</Link>
      </p>
    </main>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
