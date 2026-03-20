"use client";

import { create } from "zustand";
import type { ApproachKey } from "@/lib/approaches";
import { project, workstreamApproaches } from "@/lib/seed/metro-transit";

// Accordion section keys per domain
export type AccordionSection = "ai" | "hc" | "data" | "plan";

// Default open/closed per spec §5.2
const ACCORDION_DEFAULTS: Record<AccordionSection, boolean> = {
  ai: true,
  hc: true,
  data: false,
  plan: false,
};

interface ProjectStore {
  // Active project
  projectId: string;
  projectName: string;
  projectStatus: "setup" | "active" | "closed";

  // Approach engine
  projectApproach: ApproachKey;
  workstreamApproaches: Record<string, ApproachKey>;
  setApproach: (approach: ApproachKey) => void;
  setWorkstreamApproach: (workstream: string, approach: ApproachKey) => void;

  // Domain accordion state memory
  // key: domain id (e.g. "stakeholder", "team", ...)
  accordionState: Record<string, Record<AccordionSection, boolean>>;
  toggleAccordion: (domainId: string, section: AccordionSection) => void;
  initAccordionState: (domainId: string) => void;
  isAccordionOpen: (domainId: string, section: AccordionSection) => boolean;

  // Domains sidebar group
  domainsExpanded: boolean;
  toggleDomainsGroup: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Hydrate from Metro Transit seed
  projectId: project.id,
  projectName: project.name,
  projectStatus: "active",

  projectApproach: project.approach,
  workstreamApproaches,
  setApproach: (approach) => set({ projectApproach: approach }),
  setWorkstreamApproach: (workstream, approach) =>
    set((state) => ({
      workstreamApproaches: { ...state.workstreamApproaches, [workstream]: approach },
    })),

  accordionState: {},
  toggleAccordion: (domainId, section) =>
    set((state) => {
      const domain = state.accordionState[domainId] ?? { ...ACCORDION_DEFAULTS };
      return {
        accordionState: {
          ...state.accordionState,
          [domainId]: { ...domain, [section]: !domain[section] },
        },
      };
    }),
  initAccordionState: (domainId) =>
    set((state) => {
      if (state.accordionState[domainId]) return state; // already initialised
      return {
        accordionState: {
          ...state.accordionState,
          [domainId]: { ...ACCORDION_DEFAULTS },
        },
      };
    }),
  isAccordionOpen: (domainId, section) => {
    const state = get();
    const domain = state.accordionState[domainId];
    if (!domain) return ACCORDION_DEFAULTS[section];
    return domain[section];
  },

  domainsExpanded: false,
  toggleDomainsGroup: () => set((state) => ({ domainsExpanded: !state.domainsExpanded })),
}));
