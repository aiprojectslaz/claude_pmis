import { AIPanel } from "@/components/ui/AIPanel";
import { PlanCard } from "./PlanCard";
import { pmPlans } from "@/lib/seed/metro-transit";

export function PlansTab() {
  return (
    <div className="space-y-5">
      <AIPanel
        analysis="Plan coverage: 5 of 8 subsidiary plans approved, 3 in draft (Scope, Stakeholder Engagement, Quality). PMBOK 7 requires all subsidiary plans to be approved before baseline is set. Scope Management Plan draft is the highest priority — scope baseline cannot be finalised without it."
        chips={[
          { label: "Draft Scope Management Plan" },
          { label: "Review drafts" },
        ]}
      />

      <div>
        <h2 className="text-[12px] font-semibold text-[#1e293b] mb-3">Subsidiary PM plans</h2>
        <div className="grid grid-cols-2 gap-4">
          {pmPlans.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
