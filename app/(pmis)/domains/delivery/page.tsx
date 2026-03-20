import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";

export default function DeliveryDomainPage() {
  const c = domainConfigs.delivery;
  return <DomainPage domainId="delivery" {...c} />;
}
