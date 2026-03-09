import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function ClaimReservingPage() {
  return (
    <LifecycleModulePage
      title="Claim Reserving"
      description="Track reserve creation, revisions, approval gates, and reserve adequacy monitoring."
      endpoint="/api/v1/claim-reserving/work-items"
      sla="8 hours"
    />
  );
}

