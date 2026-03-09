import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function ReportingPage() {
  return (
    <LifecycleModulePage
      title="Reporting"
      description="Operational, financial, and regulatory reporting across end-to-end claims lifecycle."
      endpoint="/api/v1/reporting/work-items"
      sla="Hourly refresh"
    />
  );
}

