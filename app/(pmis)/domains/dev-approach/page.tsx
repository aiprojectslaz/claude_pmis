import { DomainPage } from "@/components/domains/DomainPage";
import { domainConfigs } from "@/lib/domain-configs";
import { ApproachConfigurator } from "@/components/domains/ApproachConfigurator";

export default function DevApproachDomainPage() {
  const c = domainConfigs.dev;
  return (
    <DomainPage
      domainId="dev"
      {...c}
      dataSectionTitle="Approach configurator"
      dataSection={<ApproachConfigurator />}
    />
  );
}
