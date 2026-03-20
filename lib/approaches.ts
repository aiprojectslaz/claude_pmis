export const APPROACHES = {
  predictive: {
    label: "Predictive — Waterfall",
    tasksView: ["timeline"] as string[],
    primaryMetrics: "CPI · SPI · EAC",
    healthFormula: "CPI + SPI + risks + phase gate score",
    phaseGates: "5 formal phase gates",
    riskCadence: "Calendar bi-weekly",
    frameworkRequired: "Yes (Waterfall)",
  },
  adaptive: {
    label: "Adaptive — Scrum / SAFe / Kanban",
    tasksView: ["board"] as string[],
    primaryMetrics: "Velocity · Burndown",
    healthFormula: "Velocity trend + impediments + goal hit rate",
    phaseGates: "Sprint cadence only",
    riskCadence: "Sprint start/end",
    frameworkRequired: "Yes (Scrum/SAFe/Kanban)",
  },
  iterative: {
    label: "Iterative",
    tasksView: ["board", "iteration-log"] as string[],
    primaryMetrics: "Defect rate · Improvement rate",
    healthFormula: "Defect trend + improvement rate + rework",
    phaseGates: "Iteration boundaries",
    riskCadence: "Iteration boundaries",
    frameworkRequired: "Optional",
  },
  incremental: {
    label: "Incremental",
    tasksView: ["timeline", "increment-view"] as string[],
    primaryMetrics: "Acceptance rate · Value/increment",
    healthFormula: "Delivery rate + acceptance rate + risks",
    phaseGates: "Increment delivery reviews",
    riskCadence: "Before each delivery",
    frameworkRequired: "Optional",
  },
  hybrid: {
    label: "Hybrid — EVM + Velocity",
    tasksView: ["timeline", "board"] as string[],
    primaryMetrics: "EVM (CPI · SPI · EAC) + Velocity · Burndown",
    healthFormula: "50% EVM (CPI + SPI) + 50% Velocity — adjustable split",
    phaseGates: "Formal phase gates containing sprint cadences",
    riskCadence: "Calendar bi-weekly + Sprint start/end simultaneously",
    frameworkRequired: "Recommended",
  },
} as const;

export type ApproachKey = keyof typeof APPROACHES;
