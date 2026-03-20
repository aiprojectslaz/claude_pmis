"use client";

import Link from "next/link";
import { useProjectStore } from "@/store/useProjectStore";
import type { DomainHealth } from "@/lib/seed/metro-transit";

const statusBadge: Record<string, string> = {
  green: "badge-green",
  amber: "badge-amber",
  red: "badge-red",
};

const statusLabel: Record<string, string> = {
  green: "OK",
  amber: "Watch",
  red: "Gap",
};

interface DomainHealthCardProps {
  domain: DomainHealth;
}

export function DomainHealthCard({ domain }: DomainHealthCardProps) {
  const { toggleDomainsGroup, domainsExpanded } = useProjectStore();

  const handleClick = () => {
    // Expand domains group in sidebar when navigating to a domain
    if (!domainsExpanded) toggleDomainsGroup();
  };

  return (
    <Link
      href={domain.path}
      onClick={handleClick}
      className="block border border-[#cbd5e1] rounded-lg p-3 bg-white hover:border-[#93c5fd] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: domain.colour }}
          />
          <span className="text-[12px] font-medium text-[#1e293b]">{domain.label}</span>
        </div>
        <span className={statusBadge[domain.status]}>{statusLabel[domain.status]}</span>
      </div>
      <p className="text-[10px] text-[#475569] ml-4.5 leading-snug">{domain.gap}</p>
    </Link>
  );
}
