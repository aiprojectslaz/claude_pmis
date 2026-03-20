import Link from "next/link";
import type { HealthCheckItem } from "@/components/domains/HealthCheck";
import {
  stakeholders,
  team,
  risks,
  swDeliverables,
  kpiRegister,
  workItems,
  pmPlans,
} from "@/lib/seed/metro-transit";
import { APPROACHES } from "@/lib/approaches";

// ── Shared helpers ────────────────────────────────────────────────────────────

function PlanSummaryLink({ planId, name, status, summary }: { planId: string; name: string; status: string; summary: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-[#1e293b]">{name}</span>
        <span className={status === "Approved" ? "badge-green" : "badge-amber"}>{status}</span>
      </div>
      <p className="text-[11px] text-[#475569]">{summary}</p>
      <Link href="/project" className="text-[11px] text-[#1d4ed8] hover:underline">
        View full plan in Project → Plans →
      </Link>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
          <tr>{headers.map((h) => <th key={h} className="th">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
              {row.map((cell, j) => <td key={j} className="td">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const engagementBadge: Record<string, string> = {
  Leading: "badge-green",
  Supportive: "badge-green",
  Neutral: "badge-gray",
  Resistant: "badge-red",
};

const charterBadge: Record<string, string> = {
  Signed: "badge-green",
  Pending: "badge-amber",
  "Not signed": "badge-red",
};

const riskRatingBadge: Record<string, string> = {
  HIGH: "badge-red",
  Med: "badge-amber",
  Low: "badge-gray",
};

const riskStatusBadge = (s: string) =>
  s.startsWith("Escalated") ? "badge-red" : s === "Closed" ? "badge-gray" : "badge-blue";

const kpiStatusBadge: Record<string, string> = {
  OK: "badge-green",
  Watch: "badge-amber",
  Missing: "badge-red",
};

// ── Domain configs ────────────────────────────────────────────────────────────

export const domainConfigs = {
  stakeholder: {
    title: "Stakeholder",
    colour: "#8b5cf6",
    health: "amber" as const,
    aiAnalysis:
      "Stakeholder analysis — 1 of 4 stakeholders has not been contacted in 18 days (M. Okafor, City Council, Resistant). PMBOK 7 requires resistant stakeholders to be managed proactively. An AI-drafted targeted briefing is ready for PM approval. Transit Workers Union is neutral — recommend an elicitation session before cutover planning begins.",
    aiChips: [
      { label: "Draft M. Okafor update" },
      { label: "Schedule union elicitation" },
    ],
    healthItems: [
      { outcome: "Sponsor actively engaged", evidence: "D. Reyes — Leading, last contact 2 days ago", status: "pass" },
      { outcome: "All stakeholders contacted within 14 days", evidence: "M. Okafor 18 days no contact", status: "gap", aiAction: "Draft update" },
      { outcome: "Engagement strategies defined for resistant stakeholders", evidence: "Strategy documented but plan in Draft", status: "warning", aiAction: "Review plan" },
      { outcome: "Stakeholder Engagement Plan approved", evidence: "SP-05 currently in Draft", status: "warning", aiAction: "Review plan" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Stakeholder register",
    dataSection: (
      <Table
        headers={["Stakeholder", "Role", "Engagement", "Last contact", "Action needed"]}
        rows={stakeholders.map((s) => [
          <span className="font-medium">{s.name}</span>,
          s.role,
          <span className={engagementBadge[s.engagement] ?? "badge-gray"}>{s.engagement}</span>,
          s.lastContact,
          s.action === "None" ? <span className="text-[#94a3b8]">None</span> : s.action,
        ])}
      />
    ),
    planSummary: (() => {
      const plan = pmPlans.find((p) => p.id === "SP-05")!;
      return <PlanSummaryLink planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
    })(),
  },

  team: {
    title: "Team",
    colour: "#10b981",
    health: "red" as const,
    aiAnalysis:
      "Team domain — 2 gaps. (1) L. Torres (Cost Controller, Civil works) has not signed the project charter — this is a Team domain requirement in PMBOK 7, not just a formality. (2) No retrospective has been held since project start. PMBOK 7 Team domain requires continuous team improvement; a retro is overdue.",
    aiChips: [
      { label: "Chase L. Torres sign-off" },
      { label: "Schedule retrospective" },
    ],
    healthItems: [
      { outcome: "PM authority established and documented", evidence: "Charter approved, PM authority to $25k", status: "pass" },
      { outcome: "All team members have signed the project charter", evidence: "L. Torres — Not signed (Civil works)", status: "gap", aiAction: "Chase sign-off" },
      { outcome: "Retrospective held since project start", evidence: "No retrospective recorded", status: "gap", aiAction: "Schedule retro" },
      { outcome: "Workstream ownership assigned to all team members", evidence: "All workstreams have named owners", status: "pass" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Team roster",
    dataSection: (
      <Table
        headers={["Name", "Role", "Workstream", "Charter status"]}
        rows={team.map((m) => [
          <span className="font-medium">{m.name}</span>,
          m.role,
          m.workstream,
          <span className={charterBadge[m.charterStatus] ?? "badge-gray"}>{m.charterStatus}</span>,
        ])}
      />
    ),
    planSummary: (() => {
      const plan = pmPlans.find((p) => p.id === "SP-07")!;
      return <PlanSummaryLink planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
    })(),
  },

  dev: {
    title: "Dev Approach & Lifecycle",
    colour: "#f59e0b",
    health: "green" as const,
    aiAnalysis:
      "Development approach — Hybrid confirmed. Civil works and signal systems use Predictive (Waterfall); SW integration uses Adaptive (Scrum). The hybrid formula weights EVM and velocity equally. Minor gap: phase gate exit criteria for G4 (pre-commissioning) and G5 (go-live) are not yet fully defined. PMBOK 7: phase gate criteria should be defined before entering the phase, not during.",
    aiChips: [
      { label: "Define G4 exit criteria" },
      { label: "Define G5 exit criteria" },
    ],
    healthItems: [
      { outcome: "Development approach selected and documented", evidence: "Hybrid — confirmed and configured", status: "pass" },
      { outcome: "Per-workstream approaches configured", evidence: "Civil/Signal=Predictive · SW integration=Adaptive", status: "pass" },
      { outcome: "Phase gate exit criteria defined for all gates", evidence: "G4 and G5 exit criteria not yet defined", status: "warning", aiAction: "Define criteria" },
      { outcome: "Sprint cadence running for adaptive workstream", evidence: "SW integration — 14 pts/sprint (planned 18)", status: "pass" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Approach configuration",
    dataSection: (() => {
      const a = APPROACHES.hybrid;
      return (
        <Table
          headers={["Property", "Value"]}
          rows={[
            ["Approach", <span className="badge-orange">{a.label}</span>],
            ["Tasks views", a.tasksView.join(" · ")],
            ["Primary metrics", a.primaryMetrics],
            ["Health formula", a.healthFormula],
            ["Phase gates", a.phaseGates],
            ["Risk review cadence", a.riskCadence],
            ["Framework", a.frameworkRequired],
          ]}
        />
      );
    })(),
    planSummary: (
      <p className="text-[11px] text-[#475569]">
        No dedicated subsidiary plan for Dev Approach — the approach engine configuration governs this domain.{" "}
        <Link href="/project" className="text-[#1d4ed8] hover:underline">View all plans →</Link>
      </p>
    ),
  },

  planning: {
    title: "Planning",
    colour: "#3b82f6",
    health: "red" as const,
    aiAnalysis:
      "Planning domain — 2 gaps. (1) 5 of 9 SW integration deliverables have no scope baseline — this blocks the Planning domain health check and prevents the Delivery domain from setting acceptance criteria. (2) Scope Management Plan is in Draft. PMBOK 7: scope baseline is the foundation of the project plan; unbaselined deliverables mean the project has no agreed scope for those work packages.",
    aiChips: [
      { label: "Draft SW integration scope statements" },
      { label: "Review Scope Management Plan" },
    ],
    healthItems: [
      { outcome: "Schedule baseline set for all workstreams", evidence: "Civil works and signal systems baselined; SW integration partial", status: "warning", aiAction: "Review timeline" },
      { outcome: "Cost baseline established (BAC)", evidence: "BAC $4,200,000 approved", status: "pass" },
      { outcome: "Scope baseline complete for all deliverables", evidence: "5 of 9 SW integration deliverables unbaselined", status: "gap", aiAction: "Draft scope statements" },
      { outcome: "Scope Management Plan approved", evidence: "SP-03 currently in Draft", status: "warning", aiAction: "Review plan" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Unbaselined deliverables",
    dataSection: (() => {
      const unbaselined = swDeliverables.filter((d) => !d.baselined);
      return (
        <Table
          headers={["ID", "Deliverable", "Workstream", "Owner", "Baseline status"]}
          rows={unbaselined.map((d) => [
            <span className="text-[#475569]">{d.id}</span>,
            <span className="font-medium">{d.name}</span>,
            d.workstream,
            d.owner,
            <span className="badge-red">Not baselined</span>,
          ])}
        />
      );
    })(),
    planSummary: (
      <div className="space-y-3">
        {["SP-01", "SP-02", "SP-03"].map((id) => {
          const plan = pmPlans.find((p) => p.id === id)!;
          return <PlanSummaryLink key={id} planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
        })}
      </div>
    ),
  },

  work: {
    title: "Project Work",
    colour: "#f97316",
    health: "amber" as const,
    aiAnalysis:
      "Project work — 1 active gap. The SigTech procurement audit is 46 days overdue (due Day 30, now Day 76). This is a Procurement Management Plan requirement. Vendor audits are a Project Work domain control — skipping them increases the risk of undiscovered vendor issues. R-04 (vendor delay) may be connected. Recommend initiating the audit immediately.",
    aiChips: [
      { label: "Initiate SigTech audit" },
      { label: "Link to R-04" },
    ],
    healthItems: [
      { outcome: "Work packages assigned with named owners", evidence: "All workstreams have assigned owners", status: "pass" },
      { outcome: "Vendor contract in place for key suppliers", evidence: "SigTech Inc. contract signed", status: "pass" },
      { outcome: "Procurement audits completed on schedule", evidence: "SigTech audit 46 days overdue", status: "warning", aiAction: "Initiate audit" },
      { outcome: "Sprint cadence maintained for adaptive workstream", evidence: "SW integration running — 14 pts/sprint", status: "pass" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Work items register",
    dataSection: (
      <Table
        headers={["ID", "Item", "Type", "Owner", "Due day", "Status"]}
        rows={workItems.map((w) => [
          <span className="text-[#475569]">{w.id}</span>,
          <span className="font-medium">{w.item}</span>,
          w.type,
          w.owner,
          `Day ${w.dueDay}`,
          <span className={w.status.startsWith("Overdue") ? "badge-red" : w.status === "On track" ? "badge-green" : "badge-gray"}>
            {w.status}
          </span>,
        ])}
      />
    ),
    planSummary: (() => {
      const plan = pmPlans.find((p) => p.id === "SP-08")!;
      return <PlanSummaryLink planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
    })(),
  },

  delivery: {
    title: "Delivery",
    colour: "#84cc16",
    health: "red" as const,
    aiAnalysis:
      "Delivery domain — 2 gaps. (1) 5 SW integration deliverables have no Definition of Done — PMBOK 7 Delivery domain requires DoD before a deliverable can enter acceptance. Without DoD, acceptance criteria cannot be verified. (2) Quality Management Plan is in Draft. Three AI-drafted DoD sets are queued for PM approval in the Dashboard.",
    aiChips: [
      { label: "Review DoD drafts" },
      { label: "Approve Quality Management Plan" },
    ],
    healthItems: [
      { outcome: "Acceptance criteria defined for all baselined deliverables", evidence: "Baselined deliverables have criteria; unbaselined do not", status: "warning", aiAction: "Review" },
      { outcome: "Definition of Done defined for all deliverables", evidence: "5 of 9 SW integration deliverables missing DoD", status: "gap", aiAction: "Draft DoD" },
      { outcome: "Quality Management Plan approved", evidence: "SP-06 currently in Draft", status: "warning", aiAction: "Review plan" },
      { outcome: "Deliverable completion tracked", evidence: "63% overall completion tracked", status: "pass" },
    ] as HealthCheckItem[],
    dataSectionTitle: "SW integration deliverables",
    dataSection: (
      <Table
        headers={["ID", "Deliverable", "DoD status", "Completion", "Accepted"]}
        rows={swDeliverables.map((d) => [
          <span className="text-[#475569]">{d.id}</span>,
          <span className="font-medium">{d.name}</span>,
          <span className={d.dodStatus === "Missing" ? "badge-red" : "badge-green"}>{d.dodStatus}</span>,
          d.completion,
          <span className={d.accepted === "Blocked" ? "badge-red" : d.accepted === "In progress" ? "badge-amber" : "badge-gray"}>
            {d.accepted}
          </span>,
        ])}
      />
    ),
    planSummary: (() => {
      const plan = pmPlans.find((p) => p.id === "SP-06")!;
      return <PlanSummaryLink planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
    })(),
  },

  measurement: {
    title: "Measurement",
    colour: "#ec4899",
    health: "amber" as const,
    aiAnalysis:
      "Measurement domain — EVM metrics are tracked (SPI 0.94, CPI 1.02) and the Hybrid health score formula is operational (71/100). However, 2 KPIs are missing from the register: stakeholder engagement score and a formally-tracked team velocity metric. PMBOK 7: measurement should cover all performance dimensions, not just schedule and cost.",
    aiChips: [
      { label: "Define stakeholder engagement score" },
      { label: "Add velocity metric to register" },
    ],
    healthItems: [
      { outcome: "EVM metrics tracked (SPI, CPI, EAC)", evidence: "SPI 0.94 · CPI 1.02 · EAC $4,110,000", status: "pass" },
      { outcome: "Health score formula defined and calculated", evidence: "Hybrid formula — 71/100", status: "pass" },
      { outcome: "Stakeholder engagement score defined in KPI register", evidence: "Not yet defined", status: "warning", aiAction: "Define metric" },
      { outcome: "Team velocity formally tracked in register", evidence: "Tracked ad-hoc — not in KPI register", status: "warning", aiAction: "Add to register" },
    ] as HealthCheckItem[],
    dataSectionTitle: "KPI register",
    dataSection: (
      <Table
        headers={["ID", "Metric", "Value", "Target", "Trend", "Domain", "Status"]}
        rows={kpiRegister.map((k) => [
          <span className="text-[#475569]">{k.id}</span>,
          <span className="font-medium">{k.metric}</span>,
          k.value,
          k.target,
          k.trend,
          k.domain,
          <span className={kpiStatusBadge[k.status] ?? "badge-gray"}>{k.status}</span>,
        ])}
      />
    ),
    planSummary: (
      <p className="text-[11px] text-[#475569]">
        Measurement is cross-domain — no dedicated subsidiary plan. Metrics feed into the Hybrid health score formula.{" "}
        <Link href="/project" className="text-[#1d4ed8] hover:underline">View all plans →</Link>
      </p>
    ),
  },

  uncertainty: {
    title: "Uncertainty",
    colour: "#ef4444",
    health: "amber" as const,
    aiAnalysis:
      "Uncertainty domain — Risk register is maintained with 7 active risks. R-04 (Vendor delay — signals, 70% probability, HIGH rating) has a drafted response plan awaiting PM approval. This risk is directly linked to the go-live slip from Day 122 to Day 132. Approving the response plan is the highest-priority action in this domain.",
    aiChips: [
      { label: "Review R-04 response plan" },
      { label: "Reassess R-02 probability" },
    ],
    healthItems: [
      { outcome: "Risk register maintained and current", evidence: "4 risks: 3 active, 1 closed", status: "pass" },
      { outcome: "Risk Management Plan approved", evidence: "SP-04 approved", status: "pass" },
      { outcome: "All HIGH-rated risk responses approved", evidence: "R-04 response drafted — awaiting PM approval", status: "warning", aiAction: "Review R-04 response" },
      { outcome: "Risk review cadence maintained", evidence: "Bi-weekly (civil/signal) + sprint-cadence (SW integration) scheduled", status: "pass" },
    ] as HealthCheckItem[],
    dataSectionTitle: "Risk register",
    dataSection: (
      <Table
        headers={["ID", "Risk", "Probability", "Rating", "Response", "Status"]}
        rows={risks.map((r) => [
          <span className="font-medium text-[#475569]">{r.id}</span>,
          r.risk,
          r.probability,
          <span className={riskRatingBadge[r.rating] ?? "badge-gray"}>{r.rating}</span>,
          r.response,
          <span className={riskStatusBadge(r.status)}>{r.status}</span>,
        ])}
      />
    ),
    planSummary: (() => {
      const plan = pmPlans.find((p) => p.id === "SP-04")!;
      return <PlanSummaryLink planId={plan.id} name={plan.name} status={plan.status} summary={plan.summary} />;
    })(),
  },
};

export type DomainConfigKey = keyof typeof domainConfigs;
