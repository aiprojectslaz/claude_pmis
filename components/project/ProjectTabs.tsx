"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { CharterTab } from "./CharterTab";
import { PlansTab } from "./PlansTab";
import { AssumptionsTab } from "./AssumptionsTab";
import { LessonsTab } from "./LessonsTab";
import { DocumentsTab } from "./DocumentsTab";

const TABS = [
  { value: "charter", label: "Charter", content: <CharterTab /> },
  { value: "plans", label: "Plans", content: <PlansTab /> },
  { value: "assumptions", label: "Assumptions", content: <AssumptionsTab /> },
  { value: "lessons", label: "Lessons learned", content: <LessonsTab /> },
  { value: "documents", label: "Documents", content: <DocumentsTab /> },
];

export function ProjectTabs() {
  return (
    <Tabs.Root defaultValue="charter" className="flex flex-col min-h-0">
      {/* Tab bar */}
      <Tabs.List className="flex border-b border-[#cbd5e1] bg-white sticky top-0 z-10">
        {TABS.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={cn(
              "px-4 py-2.5 text-[12px] text-[#475569] border-b-2 border-transparent -mb-px",
              "hover:text-[#1e293b] transition-colors",
              "data-[state=active]:text-[#1d4ed8] data-[state=active]:border-[#1d4ed8] data-[state=active]:font-medium"
            )}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab panels */}
      {TABS.map(({ value, content }) => (
        <Tabs.Content
          key={value}
          value={value}
          className="flex-1 p-6 focus:outline-none"
        >
          {content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
