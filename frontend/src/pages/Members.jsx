import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Members() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/members");
            setMembers(res.data);
        } catch (e) {
            setError(formatApiError(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [user?.id]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8">
                <div className="font-mono-accent text-[11px] tracking-[0.3em] uppercase text-oxblood">The Community</div>
                <h1 className="font-heading text-5xl md:text-6xl mt-1">Members</h1>
            </header>

            {error && <div className="mb-6 border border-destructive/60 bg-destructive/10 text-destructive px-4 py-3 font-mono-accent text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center gap-3 text-stark/70 font-mono-accent text-sm uppercase tracking-wider">
                    Loading user directory...</div>

            )
                : members.length === 0 ? (
                    <div className="ticket-card p-10 text-center">
                        <h3 className="font-heading text-3xl">No members yet.</h3>
                    </div>
            
            ) : (
            
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {members.map((member) => (
                        <Link key={member.id} to={`/profile/${member.id}`} className="ticket-card p-5 flex items-center gap-4">
                            
                            <div className="w-10 h-10 bg-oxblood/15 border border-oxblood/50 text-oxblood flex items-center justify-center font-accent">
                            {(member.firstName?.[0] || member.username?.[0] || "?").toUpperCase()}
                            </div>

                            <div>
                                <div className="font-sub text-base leading-none">{member.firstName} {member.lastName}</div>
                                <div className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-stark/60 mt-1">@{member.username} · {member.city}, {member.state}</div>
                            </div>

                        </Link>

                    ))}
                </div>
                    
                )}
            </main>
    );
}
    
