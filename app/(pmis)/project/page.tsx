import { ProjectTabs } from "@/components/project/ProjectTabs";
import { project } from "@/lib/seed/metro-transit";

export default function ProjectPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-[#cbd5e1]">
        <p className="section-label mb-1">Project</p>
        <h1 className="text-[14px] font-semibold text-[#1e293b]">{project.name}</h1>
        <p className="text-[11px] text-[#475569] mt-0.5">{project.code} · Change-controlled · Sponsor: D. Reyes</p>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <ProjectTabs />
      </div>
    </div>
  );
}
