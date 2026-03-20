"use client";

import { APPROACHES, type ApproachKey } from "@/lib/approaches";
import { useProjectStore } from "@/store/useProjectStore";
import { cn } from "@/lib/utils";

// Subtitle shown under each approach card
const APPROACH_SUBTITLE: Record<ApproachKey, string> = {
  predictive: "Waterfall",
  adaptive: "Scrum / SAFe / Kanban",
  iterative: "Iterative cycles",
  incremental: "Delivery increments",
  hybrid: "EVM + Velocity",
};

const APPROACH_BADGE: Record<ApproachKey, string> = {
  predictive: "badge-blue",
  adaptive: "badge-green",
  iterative: "badge-purple",
  incremental: "badge-gray",
  hybrid: "badge-orange",
};

const APPROACH_KEYS = Object.keys(APPROACHES) as ApproachKey[];

export function ApproachConfigurator() {
  const projectApproach = useProjectStore((s) => s.projectApproach);
  const workstreamApproaches = useProjectStore((s) => s.workstreamApproaches);
  const setApproach = useProjectStore((s) => s.setApproach);
  const setWorkstreamApproach = useProjectStore((s) => s.setWorkstreamApproach);

  const currentApproach = APPROACHES[projectApproach];

  return (
    <div className="space-y-5">
      {/* ── 1. Project approach cards ─────────────────────────────────────── */}
      <div>
        <p className="section-label mb-2">Project approach</p>
        <div className="flex flex-wrap gap-2">
          {APPROACH_KEYS.map((key) => {
            const isSelected = key === projectApproach;
            return (
              <button
                key={key}
                onClick={() => setApproach(key)}
                className={cn(
                  "flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-colors min-w-[100px]",
                  isSelected
                    ? "border-[#3b82f6] bg-[#eff6ff]"
                    : "border-[#cbd5e1] bg-white hover:bg-[#f8fafc]"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold capitalize",
                    isSelected ? "text-[#1d4ed8]" : "text-[#1e293b]"
                  )}
                >
                  {key}
                </span>
                <span
                  className={cn(
                    "text-[10px] mt-0.5",
                    isSelected ? "text-[#3b82f6]" : "text-[#94a3b8]"
                  )}
                >
                  {APPROACH_SUBTITLE[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Per-workstream selectors ───────────────────────────────────── */}
      <div>
        <p className="section-label mb-2">Per-workstream approaches</p>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th">Workstream</th>
                <th className="th">Approach</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(workstreamApproaches).map(([workstream, approach], i) => (
                <tr key={workstream} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium">{workstream}</td>
                  <td className="td">
                    <select
                      value={approach}
                      onChange={(e) =>
                        setWorkstreamApproach(workstream, e.target.value as ApproachKey)
                      }
                      className="text-[11px] border border-[#cbd5e1] rounded px-2 py-1 bg-white text-[#1e293b] focus:outline-none focus:border-[#3b82f6]"
                    >
                      {APPROACH_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Impact preview ─────────────────────────────────────────────── */}
      <div>
        <p className="section-label mb-2">Impact preview</p>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#1e293b]">Selected approach</span>
            <span className={APPROACH_BADGE[projectApproach]}>{currentApproach.label}</span>
          </div>
          <table className="w-full">
            <tbody>
              {[
                ["Tasks views", currentApproach.tasksView.join(" · ")],
                ["Primary metrics", currentApproach.primaryMetrics],
                ["Health formula", currentApproach.healthFormula],
                ["Phase gates", currentApproach.phaseGates],
                ["Risk cadence", currentApproach.riskCadence],
                ["Framework", currentApproach.frameworkRequired],
              ].map(([prop, val], i) => (
                <tr key={prop} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium text-[#475569] w-1/3">{prop}</td>
                  <td className="td text-[#1e293b]">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
