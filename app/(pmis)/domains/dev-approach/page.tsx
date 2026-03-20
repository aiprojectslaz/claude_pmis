import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function DevApproachDomainPage() {
  const c = domainConfigs.dev;
  return <DomainPage domainId="dev" {...c} />;
}
