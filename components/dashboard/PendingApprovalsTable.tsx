import Link from "next/link";
import { pendingApprovals } from "@/lib/seed/metro-transit";

export function PendingApprovalsTable() {
  return (
    <div>
      <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Pending AI Approvals</h2>
      <div className="border border-[#cbd5e1] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8fafc] border-b border-[#cbd5e1]">
            <tr>
              <th className="th text-left">Action</th>
              <th className="th text-left">Domain</th>
              <th className="th text-left">Type</th>
              <th className="th text-left">Review</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}
              >
                <td className="td font-medium">{item.action}</td>
                <td className="td">
                  <span className="badge-blue">{item.domain}</span>
                </td>
                <td className="td text-[#475569]">{item.type}</td>
                <td className="td">
                  <Link
                    href={item.reviewPath}
                    className="text-[#1d4ed8] text-[11px] hover:underline"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
