import Link from "next/link";
import { AIPanel } from "@/components/ui/AIPanel";
import { assumptions } from "@/lib/seed/metro-transit";

const statusBadge: Record<string, string> = {
  Valid: "badge-green",
  "At risk": "badge-red",
  Watch: "badge-amber",
  Invalidated: "badge-red",
};

export function AssumptionsTab() {
  return (
    <div className="space-y-5">
      <AIPanel
        analysis="3 valid, 1 at risk (ASM-01 — SigTech delivery linked to escalated R-04), 1 on watch (ASM-03 — scope stability). ASM-01 is directly connected to the go-live slip from Day 122 to Day 132. Recommend reviewing ASM-03 after R-02 response plan is approved. PMBOK 7: assumptions should be reviewed and updated whenever a linked risk changes status."
        chips={[
          { label: "Cross-reference risks" },
          { label: "Flag invalidated" },
        ]}
      />

      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Assumptions log</h2>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th w-16">ID</th>
                <th className="th">Assumption</th>
                <th className="th w-28">Domain</th>
                <th className="th w-24">Linked risk</th>
                <th className="th w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {assumptions.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium text-[#475569]">{row.id}</td>
                  <td className="td">{row.assumption}</td>
                  <td className="td text-[#475569]">{row.domain}</td>
                  <td className="td">
                    {row.linkedRisk !== "—" ? (
                      <Link href="/risks" className="text-[#1d4ed8] text-[11px] hover:underline">
                        {row.linkedRisk}
                      </Link>
                    ) : (
                      <span className="text-[#94a3b8]">—</span>
                    )}
                  </td>
                  <td className="td">
                    <span className={statusBadge[row.status] ?? "badge-gray"}>{row.status}</span>
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
