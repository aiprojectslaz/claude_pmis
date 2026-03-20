"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Network,
  PackageCheck,
  CheckSquare,
  BarChart2,
  AlertTriangle,
  CircleAlert,
  GitPullRequest,
  BookOpen,
} from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { SidebarItem } from "./SidebarItem";
import { DomainsGroup } from "./DomainsGroup";

export function Sidebar() {
  const { projectName, openRisks, escalatedRisks } =
    (() => {
      const s = useProjectStore();
      // surface escalated risk health for Risks item
      return {
        projectName: s.projectName,
        openRisks: 7,
        escalatedRisks: 2,
      };
    })();

  return (
    <aside className="w-52 flex-shrink-0 border-r border-[#cbd5e1] bg-[#f8fafc] flex flex-col h-full overflow-y-auto">
      {/* Project chip */}
      <div className="px-3 py-3 border-b border-[#cbd5e1]">
        <div className="bg-[#dbeafe] text-[#1e40af] text-[11px] font-medium px-2.5 py-1.5 rounded-md truncate">
          {projectName}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 px-1">
        {/* Top-level */}
        <SidebarItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        <SidebarItem href="/project" label="Project" icon={FolderKanban} />

        {/* Planning & execution */}
        <div className="pt-3 pb-1 px-2">
          <span className="section-label">— Planning &amp; Execution —</span>
        </div>
        <SidebarItem href="/wbs" label="WBS" icon={Network} />
        <SidebarItem href="/deliverables" label="Deliverables" icon={PackageCheck} />
        <SidebarItem href="/tasks" label="Tasks" icon={CheckSquare} />
        <SidebarItem href="/analytics" label="Analytics" icon={BarChart2} />

        {/* Governance */}
        <div className="pt-3 pb-1 px-2">
          <span className="section-label">— Governance —</span>
        </div>
        <SidebarItem
          href="/risks"
          label="Risks"
          icon={AlertTriangle}
          health={escalatedRisks > 0 ? "red" : "green"}
        />
        <SidebarItem href="/issues" label="Issues" icon={CircleAlert} health="amber" />
        <SidebarItem href="/change-log" label="Change log" icon={GitPullRequest} />
        <SidebarItem href="/knowledge" label="Knowledge &amp; tools" icon={BookOpen} />

        {/* Domains — collapsible */}
        <div className="pt-3">
          <DomainsGroup />
        </div>
      </nav>
    </aside>
  );
}
