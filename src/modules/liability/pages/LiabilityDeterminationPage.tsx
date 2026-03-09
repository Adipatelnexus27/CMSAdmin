import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function LiabilityDeterminationPage() {
  return (
    <LifecycleModulePage
      title="Liability Determination"
      description="Perform fault allocation and third-party liability assessment for recoveries and legal defense."
      endpoint="/api/v1/liability-determination/work-items"
      sla="24 hours"
    />
  );
}

