import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function ClaimAssignmentPage() {
  return (
    <LifecycleModulePage
      title="Claim Assignment"
      description="Allocate claims using adjuster availability, skill matrix, geography, and workload rules."
      endpoint="/api/v1/claim-assignment/work-items"
      sla="2 hours"
    />
  );
}

