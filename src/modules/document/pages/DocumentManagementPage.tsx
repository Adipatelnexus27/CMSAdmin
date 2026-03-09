import { LifecycleModulePage } from "@/modules/shared/LifecycleModulePage";

export function DocumentManagementPage() {
  return (
    <LifecycleModulePage
      title="Document Management"
      description="Manage secure upload, indexing, retention, and retrieval of claim documents."
      endpoint="/api/v1/document-management/work-items"
      sla="1 hour"
    />
  );
}

