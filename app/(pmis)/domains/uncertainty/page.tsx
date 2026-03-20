import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function UncertaintyDomainPage() {
  const c = domainConfigs.uncertainty;
  return <DomainPage domainId="uncertainty" {...c} />;
}
