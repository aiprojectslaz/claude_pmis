import { AIPanel } from "@/components/ui/AIPanel";
import { lessons } from "@/lib/seed/metro-transit";

export function LessonsTab() {
  return (
    <div className="space-y-5">
      <AIPanel
        analysis="3 lessons logged — all from the first 4 weeks. A fourth lesson is recommended: the procurement audit delay (SigTech, Project Work domain) has not been captured as a lesson. PMBOK 7: lessons should be logged continuously, not just at project close — they feed the organisational process assets."
        chips={[
          { label: "Draft lesson — procurement delay" },
        ]}
      />

      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Lessons learned log</h2>
        <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <tr>
                <th className="th w-16">ID</th>
                <th className="th">Lesson</th>
                <th className="th w-24">Phase</th>
                <th className="th w-28">Domain</th>
                <th className="th">Action taken</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="td font-medium text-[#475569]">{row.id}</td>
                  <td className="td">{row.lesson}</td>
                  <td className="td text-[#475569]">{row.phase}</td>
                  <td className="td text-[#475569]">{row.domain}</td>
                  <td className="td text-[#475569]">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
