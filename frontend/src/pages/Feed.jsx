import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCard";
import { Link } from "react-router-dom";

export default function Feed() {

    const { user } = useAuth(); //  logged in user
    const [events, setEvents] = useState([]); // events to display
    const [loading, setLoading] = useState(true); // loading or not
    const [error, setError] = useState(""); // error message

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/feed");
            setEvents(res.data);
        } catch (e) {
            setError(formatApiError(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [user?.id]); // load when page opens / user changes

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <header className="mb-8">
                <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">Your Personalized</div>
                <h1 className="font-heading text-5xl md:text-6xl mt-1">Comedy Feed</h1>
                <p className="mt-4 text-lg text-stark/80">View shows signed up for and posted by others you follow.</p>
            </header>

            {error && <div className="mb-6 border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center gap-3 text-stark/70 font-mono-accent text-sm uppercase tracking-wider">
                    Loading your feed...</div>

            )
                : events.length === 0 ? (
                    <div className="ticket-card p-10 text-center">
                        <h3 className="font-heading text-3xl">Your feed is empty.</h3>
                        <p className="font-sub italic text-stark/70 mt-2">Follow others to see their shows here.</p>
                        <Link to="/events" className="marquee-btn inline-block mt-6">Browse Shows</Link>
                    </div>
            
                ) : (
                    <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((e, i) => (
                            <EventCard key={e.id} event={e} index={i} />
                        ))}
                    </div>
                )}
                </main>
    );
}
