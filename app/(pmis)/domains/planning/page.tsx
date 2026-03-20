import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function PlanningDomainPage() {
  const c = domainConfigs.planning;
  return <DomainPage domainId="planning" {...c} />;
}
