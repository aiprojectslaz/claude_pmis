import { Sparkles } from "lucide-react";

export interface HealthCheckItem {
  outcome: string;
  evidence: string;
  status: "pass" | "gap" | "warning";
  aiAction?: string;
}

interface HealthCheckProps {
  items: HealthCheckItem[];
}

const icon: Record<string, string> = {
  pass: "✓",
  gap: "✗",
  warning: "!",
};

const itemColour: Record<string, string> = {
  pass: "text-[#166534]",
  gap: "text-[#991b1b]",
  warning: "text-[#92400e]",
};

const evidenceColour: Record<string, string> = {
  pass: "text-[#475569]",
  gap: "text-[#991b1b]",
  warning: "text-[#92400e]",
};

export function HealthCheck({ items }: HealthCheckProps) {
  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2.5">
          <span className={`text-[11px] font-bold flex-shrink-0 mt-0.5 w-3 ${itemColour[item.status]}`}>
            {icon[item.status]}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-[#1e293b]">{item.outcome}</span>
            <span className="text-[11px] text-[#475569]"> — </span>
            <span className={`text-[11px] ${evidenceColour[item.status]}`}>{item.evidence}</span>
            {item.aiAction && (
              <button className="inline-flex items-center gap-1 ml-2 text-[10px] text-[#1d4ed8] hover:underline">
                <Sparkles size={9} />
                {item.aiAction}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
