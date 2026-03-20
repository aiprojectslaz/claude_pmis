import { StatCard } from "@/components/dashboard/StatCard";
import { DomainHealthMap } from "@/components/dashboard/DomainHealthMap";
import { PendingApprovalsTable } from "@/components/dashboard/PendingApprovalsTable";
import { AIPanel } from "@/components/ui/AIPanel";
import { project } from "@/lib/seed/metro-transit";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <p className="section-label mb-1">Project Dashboard</p>
        <h1 className="text-[14px] font-semibold text-[#1e293b]">Metro Transit Upgrade</h1>
        <p className="text-[11px] text-[#475569] mt-0.5">MTU-2025 · Hybrid · Health score <span className="font-medium text-[#1e293b]">{project.healthScore}/100</span></p>
      </div>

      {/* AI Agent panel */}
      <AIPanel
        analysis={`Cross-domain analysis — 3 domains at Red, 4 at Amber. Critical: R-04 vendor delay is pushing go-live from Day ${project.goLiveDay} to Day ${project.goLiveDayForecast}. SW integration has 5 deliverables with no DoD and no baseline. Recommend prioritising Planning and Delivery domain gaps before sprint start.`}
        chips={[
          { label: "Prioritise gaps" },
          { label: "Pending approvals" },
          { label: "Draft status email" },
        ]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="SPI"
          value={project.spi.toFixed(2)}
          subtext="4 days behind schedule"
          trend="down"
          trendLabel="Behind plan"
          valueColour="text-[#92400e]"
        />
        <StatCard
          label="CPI"
          value={project.cpi.toFixed(2)}
          subtext="2% under budget"
          trend="up"
          trendLabel="Under budget"
          valueColour="text-[#166534]"
        />
        <StatCard
          label="Open Risks"
          value={project.openRisks}
          subtext={`${project.escalatedRisks} escalated`}
          trend="down"
          trendLabel="R-04 active"
          valueColour="text-[#991b1b]"
        />
        <StatCard
          label="Deliverables"
          value={`${project.deliverableCompletion}%`}
          subtext="Complete"
          trend="neutral"
          trendLabel="5 blocked (no DoD)"
        />
      </div>

      {/* Domain health map */}
      <DomainHealthMap />

      {/* Pending approvals */}
      <PendingApprovalsTable />
    </div>
  );
}
