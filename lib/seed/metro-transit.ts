import type { ApproachKey } from "@/lib/approaches";

// ── Project ──────────────────────────────────────────────────────────────────

export const project = {
  id: "MTU-2025",
  name: "Metro Transit Upgrade",
  code: "MTU-2025",
  approach: "hybrid" as ApproachKey,
  status: "active" as const,
  bac: 4_200_000,
  eac: 4_110_000,
  ev: 1_880_000,
  ac: 1_840_000,
  spi: 0.94,
  cpi: 1.02,
  deliverableCompletion: 63,
  openRisks: 7,
  escalatedRisks: 2,
  sprintVelocity: 14,
  sprintVelocityPlanned: 18,
  healthScore: 71,
  goLiveDay: 122,
  goLiveDayForecast: 132,
};

// ── Workstream approaches ────────────────────────────────────────────────────

export const workstreamApproaches: Record<string, ApproachKey> = {
  "Civil works": "predictive",
  "Signal systems": "predictive",
  "SW integration": "adaptive",
  Commissioning: "predictive",
};

// ── Team roster ──────────────────────────────────────────────────────────────

export const team = [
  { name: "PM (user)", role: "Project Manager", workstream: "All", charterStatus: "Signed" },
  { name: "D. Reyes", role: "Sponsor", workstream: "—", charterStatus: "Signed" },
  { name: "C. Mwangi", role: "Technical Lead", workstream: "SW integration", charterStatus: "Pending" },
  { name: "J. Park", role: "Regulatory Lead", workstream: "Procurement", charterStatus: "Signed" },
  { name: "L. Torres", role: "Cost Controller", workstream: "Civil works", charterStatus: "Not signed" },
];

// ── Stakeholders ─────────────────────────────────────────────────────────────

export const stakeholders = [
  { name: "D. Reyes", role: "Sponsor", engagement: "Leading", lastContact: "2 days ago", action: "None" },
  { name: "M. Okafor", role: "City Council", engagement: "Resistant", lastContact: "18 days ago", action: "Targeted briefing — AI draft ready" },
  { name: "Transit Workers Union", role: "Impacted group", engagement: "Neutral", lastContact: "5 days ago", action: "Elicitation form" },
  { name: "SigTech Inc.", role: "Vendor", engagement: "Supportive", lastContact: "1 day ago", action: "Monitoring" },
];

// ── Risk register ────────────────────────────────────────────────────────────

export const risks = [
  { id: "R-01", risk: "Regulatory lag", probability: "45%", rating: "Med", response: "Mitigate", status: "Active" },
  { id: "R-02", risk: "Scope creep", probability: "60%", rating: "Med", response: "Avoid", status: "Active" },
  { id: "R-03", risk: "Budget overrun Ph3", probability: "20%", rating: "Low", response: "Accept", status: "Closed" },
  { id: "R-04", risk: "Vendor delay — signals", probability: "70%", rating: "HIGH", response: "Mitigate", status: "Escalated — AI draft ready" },
];

// ── Domain health ────────────────────────────────────────────────────────────

export type HealthStatus = "green" | "amber" | "red";

export interface DomainHealth {
  id: string;
  label: string;
  status: HealthStatus;
  gap: string;
  colour: string;
  path: string;
}

export const domainHealth: DomainHealth[] = [
  {
    id: "stakeholder",
    label: "Stakeholder",
    status: "amber",
    gap: "M. Okafor 18 days no contact",
    colour: "#8b5cf6",
    path: "/domains/stakeholders",
  },
  {
    id: "team",
    label: "Team",
    status: "red",
    gap: "Charter unsigned + no retrospective held",
    colour: "#10b981",
    path: "/domains/team",
  },
  {
    id: "dev",
    label: "Dev Approach",
    status: "green",
    gap: "Minor: 2 phase gate exit criteria undefined",
    colour: "#f59e0b",
    path: "/domains/dev-approach",
  },
  {
    id: "planning",
    label: "Planning",
    status: "red",
    gap: "5 of 9 SW integration deliverables unbaselined",
    colour: "#3b82f6",
    path: "/domains/planning",
  },
  {
    id: "work",
    label: "Project Work",
    status: "amber",
    gap: "SigTech procurement audit 46 days overdue",
    colour: "#f97316",
    path: "/domains/project-work",
  },
  {
    id: "delivery",
    label: "Delivery",
    status: "red",
    gap: "5 SW integration deliverables missing DoD",
    colour: "#84cc16",
    path: "/domains/delivery",
  },
  {
    id: "measurement",
    label: "Measurement",
    status: "amber",
    gap: "No stakeholder engagement score or team velocity metric defined",
    colour: "#ec4899",
    path: "/domains/measurement",
  },
  {
    id: "uncertainty",
    label: "Uncertainty",
    status: "amber",
    gap: "R-04 response plan awaiting PM approval",
    colour: "#ef4444",
    path: "/domains/uncertainty",
  },
];

// ── Pending AI approvals ─────────────────────────────────────────────────────

export const pendingApprovals = [
  { action: "Draft stakeholder update — M. Okafor", domain: "Stakeholder", type: "Email", reviewPath: "/domains/stakeholders" },
  { action: "R-04 vendor delay response plan", domain: "Uncertainty", type: "Risk response", reviewPath: "/domains/uncertainty" },
  { action: "DoD drafts — 5 SW integration deliverables", domain: "Delivery", type: "Definition of Done", reviewPath: "/deliverables" },
];

// ── SW integration deliverables ──────────────────────────────────────────────

export const swDeliverables = [
  {
    id: "WBS-1.3.1",
    name: "Data migration — source audit",
    workstream: "SW integration",
    dodStatus: "Missing",
    completion: "Not started",
    accepted: "Blocked",
    baselined: false,
    effort: "10 days",
    cost: 18_000,
    owner: "C. Mwangi",
    requirements: [
      { id: "REQ-W01", text: "All legacy source tables mapped and documented", dod: "Mapping document approved by PM", status: "Pending" },
      { id: "REQ-W02", text: "Data quality report with ≤ 0.5% error rate", dod: "Report produced and signed off", status: "Pending" },
      { id: "REQ-W03", text: "Sign-off from C. Mwangi and PM", dod: "Both signatures obtained", status: "Pending" },
    ],
  },
  {
    id: "WBS-1.3.2",
    name: "API integration — Phase 1",
    workstream: "SW integration",
    dodStatus: "Missing",
    completion: "Not started",
    accepted: "Blocked",
    baselined: false,
    effort: "18 days",
    cost: 32_400,
    owner: "C. Mwangi",
    requirements: [
      { id: "REQ-W04", text: "Signal controller API endpoints documented", dod: "API spec published in project repository", status: "Pending" },
      { id: "REQ-W05", text: "End-to-end test suite ≥ 95% coverage", dod: "Test report shows ≥ 95% pass rate", status: "Pending" },
      { id: "REQ-W06", text: "No critical defects at handover", dod: "Zero P1/P2 defects outstanding", status: "Pending" },
    ],
  },
  {
    id: "WBS-1.3.3",
    name: "Platform configuration",
    workstream: "SW integration",
    dodStatus: "Defined",
    completion: "50%",
    accepted: "In progress",
    baselined: true,
    effort: "12 days",
    cost: 21_600,
    owner: "C. Mwangi",
    requirements: [
      { id: "REQ-P01", text: "Authentication configured", dod: "Auth setup complete", status: "Complete" },
      { id: "REQ-P02", text: "Dev environment running", dod: "Dev env verified", status: "Complete" },
      { id: "REQ-P03", text: "Staging environment configured", dod: "Staging env verified", status: "Pending" },
      { id: "REQ-P04", text: "City identity provider integrated", dod: "IdP integration tested", status: "Pending" },
    ],
  },
  {
    id: "WBS-1.3.4",
    name: "Integration testing",
    workstream: "SW integration",
    dodStatus: "Missing",
    completion: "Not started",
    accepted: "Blocked",
    baselined: false,
    effort: "14 days",
    cost: 25_200,
    owner: "C. Mwangi",
    requirements: [
      { id: "REQ-W07", text: "Integration test plan approved before execution", dod: "Test plan sign-off on file", status: "Pending" },
      { id: "REQ-W08", text: "All integration test cases executed", dod: "Test log shows 100% execution", status: "Pending" },
      { id: "REQ-W09", text: "Zero critical integration failures at sign-off", dod: "No P1 defects outstanding", status: "Pending" },
      { id: "REQ-W10", text: "Technical lead and PM sign-off", dod: "Both signatures obtained", status: "Pending" },
    ],
  },
  {
    id: "WBS-1.3.5",
    name: "UAT & handover",
    workstream: "SW integration",
    dodStatus: "Missing",
    completion: "Not started",
    accepted: "Blocked",
    baselined: false,
    effort: "10 days",
    cost: 15_000,
    owner: "PM",
    requirements: [
      { id: "REQ-W11", text: "All UAT test cases executed by ops staff", dod: "UAT log shows 100% execution", status: "Pending" },
      { id: "REQ-W12", text: "Zero critical defects outstanding at UAT close", dod: "Zero P1/P2 defects open", status: "Pending" },
      { id: "REQ-W13", text: "Operations team trained on new platform", dod: "Training attendance recorded", status: "Pending" },
      { id: "REQ-W14", text: "Sponsor sign-off — D. Reyes", dod: "Formal acceptance document signed", status: "Pending" },
    ],
  },
];
