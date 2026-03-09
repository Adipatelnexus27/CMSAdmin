import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function WorkflowAutomationPage() {
  return (
    <LifecycleModulePage
      title="Workflow Automation"
      description="Define routing rules, escalation paths, SLA breaches, and automated transitions."
      endpoint="/api/v1/workflow-automation/work-items"
      sla="Near real-time"
    />
  );
}

