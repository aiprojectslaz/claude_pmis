import { AIPanel } from "@/components/ui/AIPanel";
import { charterSections, charterAmendments } from "@/lib/seed/metro-transit";

const statusBadge: Record<string, string> = {
  Approved: "badge-green",
  Signed: "badge-green",
  Pending: "badge-amber",
};

export function CharterTab() {
  return (
    <div className="space-y-5">
      <AIPanel
        analysis="Charter analysis: Sponsor D. Reyes signed. L. Torres charter unsigned (Team domain gap — see Team domain). AMD-01 and AMD-02 both approved by CCB. No outstanding CCB actions. PMBOK 7: the charter authorises the project and establishes PM authority — it should be change-controlled and never edited without CCB approval."
        chips={[
          { label: "Flag missing sign-off" },
          { label: "Review assumptions" },
        ]}
      />

      {/* Charter sections */}
      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Charter sections</h2>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th w-40">Section</th>
                <th className="th">Content</th>
                <th className="th w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {charterSections.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium whitespace-nowrap">{row.section}</td>
                  <td className="td text-[#475569]">{row.content}</td>
                  <td className="td">
                    <span className={statusBadge[row.status] ?? "badge-gray"}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Amendment log */}
      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Amendment log</h2>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th w-16">ID</th>
                <th className="th w-20">Date</th>
                <th className="th">Change</th>
                <th className="th w-28">Requested by</th>
                <th className="th w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {charterAmendments.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium text-[#475569]">{row.id}</td>
                  <td className="td text-[#475569]">{row.date}</td>
                  <td className="td">{row.change}</td>
                  <td className="td text-[#475569]">{row.requestedBy}</td>
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
