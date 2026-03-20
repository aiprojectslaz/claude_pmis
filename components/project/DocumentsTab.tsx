import { AIPanel } from "@/components/ui/AIPanel";
import { documents } from "@/lib/seed/metro-transit";

const statusBadge: Record<string, string> = {
  Approved: "badge-green",
  Current: "badge-green",
  Signed: "badge-green",
  Missing: "badge-red",
  Draft: "badge-amber",
};

export function DocumentsTab() {
  return (
    <div className="space-y-5">
      <AIPanel
        analysis="2 documents missing: SW Integration Scope Baseline (required before sprint 2 can baseline deliverables) and Integration Test Plan (required before commissioning phase gate G4). UAT Plan is in draft — needs approval before Day 100. PMBOK 7: missing required documents are a planning gap that blocks downstream phase gates."
        chips={[
          { label: "Draft SW integration scope baseline" },
          { label: "Create integration test plan template" },
        ]}
      />

      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Documents</h2>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th">Document</th>
                <th className="th w-28">Type</th>
                <th className="th w-16">Version</th>
                <th className="th w-24">Status</th>
                <th className="th w-16">View</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium">{row.name}</td>
                  <td className="td text-[#475569]">{row.type}</td>
                  <td className="td text-[#475569]">{row.version}</td>
                  <td className="td">
                    <span className={statusBadge[row.status] ?? "badge-gray"}>{row.status}</span>
                  </td>
                  <td className="td">
                    {row.viewable ? (
                      <button className="text-[#1d4ed8] text-[11px] hover:underline">
                        View →
                      </button>
                    ) : (
                      <span className="text-[#94a3b8] text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
