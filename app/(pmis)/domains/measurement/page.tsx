import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function MeasurementDomainPage() {
  const c = domainConfigs.measurement;
  return <DomainPage domainId="measurement" {...c} />;
}
