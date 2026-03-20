"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore, type AccordionSection } from "@/store/useProjectStore";

interface AccordionSectionProps {
  domainId: string;
  section: AccordionSection;
  title: string;
  children: React.ReactNode;
}

export function AccordionSection({ domainId, section, title, children }: AccordionSectionProps) {
  const isOpen = useProjectStore((s) => s.isAccordionOpen(domainId, section));
  const toggle = useProjectStore((s) => s.toggleAccordion);

  return (
    <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
      <button
        onClick={() => toggle(domainId, section)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left"
      >
        <span className="text-[12px] font-semibold text-[#1e293b]">{title}</span>
        <ChevronRight
          size={14}
          className={cn(
            "text-[#94a3b8] flex-shrink-0 transition-transform duration-200",
            isOpen ? "rotate-90" : ""
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-[#cbd5e1] bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
