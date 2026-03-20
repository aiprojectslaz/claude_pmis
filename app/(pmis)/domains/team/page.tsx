import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function TeamDomainPage() {
  const c = domainConfigs.team;
  return <DomainPage domainId="team" {...c} />;
}
