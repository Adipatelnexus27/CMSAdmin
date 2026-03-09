import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function ClaimInvestigationPage() {
  return (
    <LifecycleModulePage
      title="Claim Investigation"
      description="Manage evidence, statements, incident reconstruction, and investigation task completion."
      endpoint="/api/v1/claim-investigation/work-items"
      sla="48 hours"
    />
  );
}

