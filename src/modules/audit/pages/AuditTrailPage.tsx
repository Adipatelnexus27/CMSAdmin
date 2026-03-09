import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function AuditTrailPage() {
  return (
    <LifecycleModulePage
      title="Audit Trail"
      description="Review immutable operational events, user actions, and compliance checkpoints."
      endpoint="/api/v1/audit-trail/work-items"
      sla="Near real-time"
    />
  );
}

