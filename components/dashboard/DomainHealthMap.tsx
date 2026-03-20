import { domainHealth } from "@/lib/seed/metro-transit";
import { DomainHealthCard } from "./DomainHealthCard";

export function DomainHealthMap() {
  return (
    <div>
      <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Domain Health Map</h2>
      <div className="grid grid-cols-4 gap-3">
        {domainHealth.map((d) => (
          <DomainHealthCard key={d.id} domain={d} />
        ))}
      </div>
    </div>
  );
}
