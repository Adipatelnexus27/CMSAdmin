import { auditApi } from "../api/auditApi";

interface UserActionOptions {
  description?: string;
  claimId?: string;
  entityName?: string;
  entityId?: string;
  requestPath?: string;
}

export async function logUserAction(actionName: string, options?: UserActionOptions): Promise<void> {
  if (!actionName.trim()) {
    return;
  }

  try {
    await auditApi.logAction({
      eventType: "UserAction",
      actionName: actionName.trim(),
      description: options?.description?.trim() || undefined,
      claimId: options?.claimId,
      entityName: options?.entityName,
      entityId: options?.entityId,
      requestMethod: "UI",
      requestPath: options?.requestPath
    });
  } catch {
    // Best-effort logging. User interactions should never fail due to audit telemetry.
  }
}
