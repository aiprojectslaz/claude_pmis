import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function StakeholderDomainPage() {
  const c = domainConfigs.stakeholder;
  return <DomainPage domainId="stakeholder" {...c} />;
}
