import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mic } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await login(form.username, form.password);
    setBusy(false);
    if (res.ok) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo);
    } else {
      setError(res.error);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-oxblood glow-lime">
          <Mic className="w-7 h-7 text-marigold" strokeWidth={2.5} />
        </div>
        <h1 className="font-heading text-5xl mt-4">Tap the Mic</h1>
        <p className="font-sub italic text-stark/70 mt-1">Log in before the spotlight hits.</p>
      </div>

      <form onSubmit={submit} className="ticket-card p-6 space-y-5">
        {error && <div className="border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm" data-testid="login-error">{error}</div>}
        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Username</label>
          <input data-testid="login-username" className="retro-input w-full mt-1" value={form.username} onChange={onChange("username")} required />
        </div>
        <div>
          <label className="font-mono-accent text-[10px] tracking-[0.25em] uppercase text-stark/70">Password</label>
          <input data-testid="login-password" type="password" className="retro-input w-full mt-1" value={form.password} onChange={onChange("password")} required />
        </div>
        <button type="submit" disabled={busy} className="marquee-btn w-full" data-testid="login-submit">
          {busy ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="text-center mt-6 font-sub italic text-stark/70">
        No account yet? <Link to="/register" className="text-oxblood underline underline-offset-4" data-testid="login-register-link">Create Account.</Link>
      </p>
    </main>
  );
}
