import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function NotificationsPage() {
  return (
    <LifecycleModulePage
      title="Notifications"
      description="Configure and monitor email, SMS, and in-app notifications across workflows."
      endpoint="/api/v1/notifications/work-items"
      sla="Immediate"
    />
  );
}

