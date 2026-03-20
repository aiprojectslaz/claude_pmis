import Link from "next/link";
import { Sparkles } from "lucide-react";

interface PlanCardProps {
  id: string;
  name: string;
  domain: string;
  domainPath: string;
  summary: string;
  status: string;
}

export function PlanCard({ name, domain, domainPath, summary, status }: PlanCardProps) {
  const isApproved = status === "Approved";
  return (
    <div className="border border-[#cbd5e1] rounded-lg p-4 bg-white flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-[#1e293b] leading-snug">{name}</h3>
        <span className={isApproved ? "badge-green" : "badge-amber"} style={{ flexShrink: 0 }}>
          {status}
        </span>
      </div>
      <Link
        href={domainPath}
        className="text-[11px] text-[#1d4ed8] hover:underline w-fit"
      >
        {domain} domain →
      </Link>
      <p className="text-[11px] text-[#475569] leading-relaxed flex-1">{summary}</p>
      <div className="flex items-center gap-2 mt-1">
        <button className="text-[11px] border border-[#cbd5e1] rounded px-2.5 py-1 text-[#475569] hover:bg-[#f8fafc] transition-colors">
          Review
        </button>
        <button className="ai-chip">
          <Sparkles size={10} />
          AI draft
        </button>
      </div>
    </div>
  );
}
