"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { AIPanel } from "@/components/ui/AIPanel";
import { AccordionSection } from "./AccordionSection";
import { HealthCheck, type HealthCheckItem } from "./HealthCheck";
import type { HealthStatus } from "@/lib/seed/metro-transit";

interface DomainPageProps {
  domainId: string;
  title: string;
  colour: string;
  health: HealthStatus;
  aiAnalysis: string;
  aiChips: { label: string }[];
  healthItems: HealthCheckItem[];
  dataSection: React.ReactNode;
  dataSectionTitle: string;
  planSummary: React.ReactNode;
}

const healthLabel: Record<HealthStatus, string> = {
  green: "OK",
  amber: "Watch",
  red: "Gap",
};
const healthBadge: Record<HealthStatus, string> = {
  green: "badge-green",
  amber: "badge-amber",
  red: "badge-red",
};

export function DomainPage({
  domainId,
  title,
  colour,
  health,
  aiAnalysis,
  aiChips,
  healthItems,
  dataSection,
  dataSectionTitle,
  planSummary,
}: DomainPageProps) {
  const initAccordionState = useProjectStore((s) => s.initAccordionState);

  useEffect(() => {
    initAccordionState(domainId);
  }, [domainId, initAccordionState]);

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: colour }}
        />
        <div>
          <p className="section-label">PMBOK 7 Domain</p>
          <h1 className="text-[14px] font-semibold text-[#1e293b]">{title}</h1>
        </div>
        <span className={`ml-auto ${healthBadge[health]}`}>{healthLabel[health]}</span>
      </div>

      {/* 1 — AI Agent panel (open by default) */}
      <AccordionSection domainId={domainId} section="ai" title="AI Agent">
        <AIPanel analysis={aiAnalysis} chips={aiChips} />
      </AccordionSection>

      {/* 2 — Domain health check (open by default) */}
      <AccordionSection domainId={domainId} section="hc" title="Domain health check">
        <HealthCheck items={healthItems} />
      </AccordionSection>

      {/* 3 — Domain data table (closed by default) */}
      <AccordionSection domainId={domainId} section="data" title={dataSectionTitle}>
        {dataSection}
      </AccordionSection>

      {/* 4 — Plan summary (closed by default) */}
      <AccordionSection domainId={domainId} section="plan" title="Plan summary">
        {planSummary}
      </AccordionSection>
    </div>
  );
}
