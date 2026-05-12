import { Link, NavLink, useNavigate } from "react-router-dom";
import { Mic, User, LogOut, Plus, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `font-sans text-[13px] font-medium px-3 py-2 transition-colors relative ${
      isActive ? "text-oxblood" : "text-stark/65 hover:text-stark"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-cream/80 backdrop-blur-xl border-b border-dim/80"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="navbar-logo">
          <div className="relative w-9 h-9 flex items-center justify-center bg-oxblood">
            <Mic className="w-4 h-4 text-cream" strokeWidth={2.75} />
            <span className="absolute -top-1 -right-1 lime-dot" />
          </div>
          <div className="leading-none">
            <div className="font-display text-[22px] text-stark tracking-tight">
              Find Your <span className="italic font-serif-italic text-marigold">Funny</span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/events" className={linkClass} data-testid="nav-events">Browse</NavLink>
          <NavLink to="/near-me" className={linkClass} data-testid="nav-nearme">Near Me</NavLink>
          {user && <NavLink to="/profile" className={linkClass} data-testid="nav-profile">My Profile</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="font-sans text-[13px] font-medium px-3 py-2 text-stark/65 hover:text-stark transition-colors"
                data-testid="nav-login"
              >
                Log in
              </Link>
              <Link to="/register" className="btn-sm" data-testid="nav-register">
                Create Account
              </Link>
            </>
          ) : (
            <>
              <Link to="/create-event" className="btn-sm" data-testid="nav-create-cta">
                <Plus className="w-3.5 h-3.5" strokeWidth={2.75} />
                Post show
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-dim/90 bg-paper/40">
                <User className="w-3.5 h-3.5 text-marigold" strokeWidth={2.5} />
                <span className="font-mono-accent text-[11px] text-stark/85">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 border border-dim/90 hover:border-oxblood hover:text-oxblood text-stark/70 transition-all"
                data-testid="nav-logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 border border-dim/90 text-stark"
          onClick={() => setOpen((s) => !s)}
          data-testid="nav-toggle"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-dim bg-paper/95 backdrop-blur-xl">
          <div className="px-4 py-4 flex flex-col gap-1" onClick={() => setOpen(false)}>
            <NavLink to="/events" className="py-2.5 font-sans text-sm font-medium text-stark" data-testid="mobile-nav-events">Browse</NavLink>
            <NavLink to="/near-me" className="py-2.5 font-sans text-sm font-medium text-stark" data-testid="mobile-nav-nearme">Near Me</NavLink>
            {user && <NavLink to="/create-event" className="py-2.5 font-sans text-sm font-medium text-stark" data-testid="mobile-nav-create">Post Show</NavLink>}
            {user && <NavLink to="/profile" className="py-2.5 font-sans text-sm font-medium text-stark" data-testid="mobile-nav-profile">My Bills</NavLink>}
            <div className="hairline my-2" />
            {!user ? (
              <>
                <Link to="/login" className="py-2.5 font-sans text-sm font-medium text-stark" data-testid="mobile-nav-login">Log in</Link>
                <Link to="/register" className="btn-sm text-center mt-1" data-testid="mobile-nav-register">Get on the list</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-sm text-center" data-testid="mobile-nav-logout">Log out</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
