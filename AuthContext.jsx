import { Mic, Users, Ticket } from "lucide-react";

const OPTIONS = [
  { key: "ALL", label: "All", Icon: Ticket },
  { key: "STANDUP", label: "Stand-Up", Icon: Mic },
  { key: "IMPROV", label: "Improv", Icon: Users },
  { key: "OPEN_MIC", label: "Open Mic", Icon: Ticket },
];

export default function CategoryTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const Icon = o.Icon;
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            data-testid={`category-tab-${o.key}`}
            className={`chip ${active ? "chip-active" : "hover:bg-ticket"}`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
