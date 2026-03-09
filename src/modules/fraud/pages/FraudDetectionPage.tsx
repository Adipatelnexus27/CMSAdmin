import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function FraudDetectionPage() {
  return (
    <LifecycleModulePage
      title="Fraud Detection"
      description="Monitor fraud risk scores, rule triggers, and SIU referrals for suspicious claims."
      endpoint="/api/v1/fraud-detection/work-items"
      sla="12 hours"
    />
  );
}

