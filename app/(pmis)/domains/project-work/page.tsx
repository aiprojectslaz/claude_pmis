import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function ProjectWorkDomainPage() {
  const c = domainConfigs.work;
  return <DomainPage domainId="work" {...c} />;
}
