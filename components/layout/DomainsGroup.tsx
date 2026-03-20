"use client";

import { ChevronRight } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { SidebarItem } from "./SidebarItem";
import { domainHealth } from "@/lib/seed/metro-transit";
import { cn } from "@/lib/utils";

export function DomainsGroup() {
  const { domainsExpanded, toggleDomainsGroup } = useProjectStore();

  return (
    <div>
      <button
        onClick={toggleDomainsGroup}
        className="w-full flex items-center justify-between px-3 py-1.5 group"
      >
        <span className="section-label">— Domains —</span>
        <ChevronRight
          size={12}
          className={cn(
            "text-[#94a3b8] transition-transform duration-200",
            domainsExpanded ? "rotate-90" : ""
          )}
        />
      </button>

      {domainsExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {domainHealth.map((d) => (
            <SidebarItem
              key={d.id}
              href={d.path}
              label={d.label}
              health={d.status}
              domainColour={d.colour}
              indent
            />
          ))}
        </div>
      )}
    </div>
  );
}
