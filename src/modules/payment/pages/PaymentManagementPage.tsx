import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function PaymentManagementPage() {
  return (
    <LifecycleModulePage
      title="Payment Management"
      description="Execute disbursements, payment controls, reversals, and finance reconciliation."
      endpoint="/api/v1/payment-management/work-items"
      sla="24 hours"
    />
  );
}

