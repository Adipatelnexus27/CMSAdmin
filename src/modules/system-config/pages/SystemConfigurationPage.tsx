import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { TableColumn, EntityTable } from "@/core/components/EntityTable";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { useAuthContext } from "@/core/auth/AuthContext";
import {
  ClaimStatus,
  ClaimType,
  FraudRule,
  InsuranceProduct,
  systemConfigurationApi,
  WorkflowStage
} from "@/modules/system-config/api/systemConfigurationApi";

type ConfigTab = "claimTypes" | "claimStatuses" | "insuranceProducts" | "fraudRules" | "workflowStages";

interface BannerState {
  severity: AlertColor;
  message: string;
}

function toErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unexpected error. Please retry.";
  }

  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    return parsed.error ?? error.message;
  } catch {
    return error.message;
  }
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  canManage: boolean;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreate: () => void;
}

function SectionHeader({ title, subtitle, canManage, loading, onRefresh, onCreate }: SectionHeaderProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1}>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      <Stack direction="row" gap={1}>
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void onRefresh()} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreate} disabled={!canManage}>
          Add New
        </Button>
      </Stack>
    </Stack>
  );
}

interface CrudActionsProps {
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function CrudActions({ canManage, onEdit, onDelete }: CrudActionsProps) {
  if (!canManage) {
    return (
      <Typography variant="body2" color="text.secondary">
        Read only
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={onEdit}>
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={onDelete}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function ClaimTypesSection({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<ClaimType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClaimType | null>(null);
  const [form, setForm] = useState({ claimTypeCode: "", claimTypeName: "", claimTypeDescription: "" });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await systemConfigurationApi.getClaimTypes());
      setBanner(null);
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: TableColumn<ClaimType>[] = [
    { key: "claimTypeCode", header: "Code" },
    { key: "claimTypeName", header: "Name" },
    { key: "claimTypeDescription", header: "Description" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <CrudActions
          canManage={canManage}
          onEdit={() => {
            setEditing(row);
            setForm({
              claimTypeCode: row.claimTypeCode,
              claimTypeName: row.claimTypeName,
              claimTypeDescription: row.claimTypeDescription ?? ""
            });
            setOpen(true);
          }}
          onDelete={() => void handleDelete(row)}
        />
      )
    }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ claimTypeCode: "", claimTypeName: "", claimTypeDescription: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        claimTypeCode: form.claimTypeCode.trim(),
        claimTypeName: form.claimTypeName.trim(),
        claimTypeDescription: form.claimTypeDescription.trim() || null
      };

      if (editing) {
        await systemConfigurationApi.updateClaimType(editing.claimTypeId, payload);
        setBanner({ severity: "success", message: "Claim type updated." });
      } else {
        await systemConfigurationApi.createClaimType(payload);
        setBanner({ severity: "success", message: "Claim type created." });
      }

      setOpen(false);
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ClaimType) => {
    if (!window.confirm(`Delete claim type "${row.claimTypeName}"?`)) {
      return;
    }

    try {
      await systemConfigurationApi.deleteClaimType(row.claimTypeId);
      setBanner({ severity: "success", message: "Claim type deleted." });
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    }
  };

  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <SectionHeader
          title="Claim Types"
          subtitle="Manage standardized claim type taxonomy."
          canManage={canManage}
          loading={loading}
          onRefresh={load}
          onCreate={openCreate}
        />
        {!canManage ? <Alert severity="info">Read-only access. Admin role is required for changes.</Alert> : null}
        {banner ? <Alert severity={banner.severity}>{banner.message}</Alert> : null}
        <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.claimTypeId)} />
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Claim Type" : "Create Claim Type"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Code"
            value={form.claimTypeCode}
            onChange={(event) => setForm((prev) => ({ ...prev, claimTypeCode: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Name"
            value={form.claimTypeName}
            onChange={(event) => setForm((prev) => ({ ...prev, claimTypeName: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={form.claimTypeDescription}
            onChange={(event) => setForm((prev) => ({ ...prev, claimTypeDescription: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function ClaimStatusesSection({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<ClaimStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClaimStatus | null>(null);
  const [form, setForm] = useState({ statusCode: "", statusName: "", sequenceNo: 1, isTerminalStatus: false });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await systemConfigurationApi.getClaimStatuses());
      setBanner(null);
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: TableColumn<ClaimStatus>[] = [
    { key: "statusCode", header: "Code" },
    { key: "statusName", header: "Name" },
    { key: "sequenceNo", header: "Sequence" },
    { key: "isTerminalStatus", header: "Terminal", render: (row) => (row.isTerminalStatus ? "Yes" : "No") },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <CrudActions
          canManage={canManage}
          onEdit={() => {
            setEditing(row);
            setForm({
              statusCode: row.statusCode,
              statusName: row.statusName,
              sequenceNo: row.sequenceNo,
              isTerminalStatus: row.isTerminalStatus
            });
            setOpen(true);
          }}
          onDelete={() => void handleDelete(row)}
        />
      )
    }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ statusCode: "", statusName: "", sequenceNo: 1, isTerminalStatus: false });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        statusCode: form.statusCode.trim(),
        statusName: form.statusName.trim(),
        sequenceNo: Number(form.sequenceNo),
        isTerminalStatus: form.isTerminalStatus
      };

      if (editing) {
        await systemConfigurationApi.updateClaimStatus(editing.claimStatusId, payload);
        setBanner({ severity: "success", message: "Claim status updated." });
      } else {
        await systemConfigurationApi.createClaimStatus(payload);
        setBanner({ severity: "success", message: "Claim status created." });
      }

      setOpen(false);
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ClaimStatus) => {
    if (!window.confirm(`Delete claim status "${row.statusName}"?`)) {
      return;
    }

    try {
      await systemConfigurationApi.deleteClaimStatus(row.claimStatusId);
      setBanner({ severity: "success", message: "Claim status deleted." });
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    }
  };

  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <SectionHeader
          title="Claim Statuses"
          subtitle="Define lifecycle states and sequence ordering."
          canManage={canManage}
          loading={loading}
          onRefresh={load}
          onCreate={openCreate}
        />
        {!canManage ? <Alert severity="info">Read-only access. Admin role is required for changes.</Alert> : null}
        {banner ? <Alert severity={banner.severity}>{banner.message}</Alert> : null}
        <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.claimStatusId)} />
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Claim Status" : "Create Claim Status"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Code"
            value={form.statusCode}
            onChange={(event) => setForm((prev) => ({ ...prev, statusCode: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Name"
            value={form.statusName}
            onChange={(event) => setForm((prev) => ({ ...prev, statusName: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Sequence No"
            type="number"
            value={form.sequenceNo}
            onChange={(event) => setForm((prev) => ({ ...prev, sequenceNo: Number(event.target.value) || 0 }))}
            required
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isTerminalStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, isTerminalStatus: event.target.checked }))}
              />
            }
            label="Terminal status"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function InsuranceProductsSection({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<InsuranceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceProduct | null>(null);
  const [form, setForm] = useState({ policyTypeCode: "", policyTypeName: "", policyTypeDescription: "" });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await systemConfigurationApi.getInsuranceProducts());
      setBanner(null);
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: TableColumn<InsuranceProduct>[] = [
    { key: "policyTypeCode", header: "Code" },
    { key: "policyTypeName", header: "Name" },
    { key: "policyTypeDescription", header: "Description" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <CrudActions
          canManage={canManage}
          onEdit={() => {
            setEditing(row);
            setForm({
              policyTypeCode: row.policyTypeCode,
              policyTypeName: row.policyTypeName,
              policyTypeDescription: row.policyTypeDescription ?? ""
            });
            setOpen(true);
          }}
          onDelete={() => void handleDelete(row)}
        />
      )
    }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ policyTypeCode: "", policyTypeName: "", policyTypeDescription: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        policyTypeCode: form.policyTypeCode.trim(),
        policyTypeName: form.policyTypeName.trim(),
        policyTypeDescription: form.policyTypeDescription.trim() || null
      };

      if (editing) {
        await systemConfigurationApi.updateInsuranceProduct(editing.policyTypeId, payload);
        setBanner({ severity: "success", message: "Insurance product updated." });
      } else {
        await systemConfigurationApi.createInsuranceProduct(payload);
        setBanner({ severity: "success", message: "Insurance product created." });
      }

      setOpen(false);
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: InsuranceProduct) => {
    if (!window.confirm(`Delete insurance product "${row.policyTypeName}"?`)) {
      return;
    }

    try {
      await systemConfigurationApi.deleteInsuranceProduct(row.policyTypeId);
      setBanner({ severity: "success", message: "Insurance product deleted." });
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    }
  };

  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <SectionHeader
          title="Insurance Products"
          subtitle="Manage product master list used by policies and claims."
          canManage={canManage}
          loading={loading}
          onRefresh={load}
          onCreate={openCreate}
        />
        {!canManage ? <Alert severity="info">Read-only access. Admin role is required for changes.</Alert> : null}
        {banner ? <Alert severity={banner.severity}>{banner.message}</Alert> : null}
        <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.policyTypeId)} />
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Insurance Product" : "Create Insurance Product"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Code"
            value={form.policyTypeCode}
            onChange={(event) => setForm((prev) => ({ ...prev, policyTypeCode: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Name"
            value={form.policyTypeName}
            onChange={(event) => setForm((prev) => ({ ...prev, policyTypeName: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={form.policyTypeDescription}
            onChange={(event) => setForm((prev) => ({ ...prev, policyTypeDescription: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function FraudRulesSection({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FraudRule | null>(null);
  const [form, setForm] = useState({ ruleCode: "", ruleName: "", ruleWeight: 0, ruleDefinition: "" });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await systemConfigurationApi.getFraudRules());
      setBanner(null);
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: TableColumn<FraudRule>[] = [
    { key: "ruleCode", header: "Code" },
    { key: "ruleName", header: "Name" },
    { key: "ruleWeight", header: "Weight" },
    { key: "ruleDefinition", header: "Definition" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <CrudActions
          canManage={canManage}
          onEdit={() => {
            setEditing(row);
            setForm({
              ruleCode: row.ruleCode,
              ruleName: row.ruleName,
              ruleWeight: row.ruleWeight,
              ruleDefinition: row.ruleDefinition ?? ""
            });
            setOpen(true);
          }}
          onDelete={() => void handleDelete(row)}
        />
      )
    }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ ruleCode: "", ruleName: "", ruleWeight: 0, ruleDefinition: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ruleCode: form.ruleCode.trim(),
        ruleName: form.ruleName.trim(),
        ruleWeight: Number(form.ruleWeight),
        ruleDefinition: form.ruleDefinition.trim() || null
      };

      if (editing) {
        await systemConfigurationApi.updateFraudRule(editing.fraudRuleId, payload);
        setBanner({ severity: "success", message: "Fraud rule updated." });
      } else {
        await systemConfigurationApi.createFraudRule(payload);
        setBanner({ severity: "success", message: "Fraud rule created." });
      }

      setOpen(false);
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: FraudRule) => {
    if (!window.confirm(`Delete fraud rule "${row.ruleName}"?`)) {
      return;
    }

    try {
      await systemConfigurationApi.deleteFraudRule(row.fraudRuleId);
      setBanner({ severity: "success", message: "Fraud rule deleted." });
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    }
  };

  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <SectionHeader
          title="Fraud Rules"
          subtitle="Configure scoring rules for suspicious claim detection."
          canManage={canManage}
          loading={loading}
          onRefresh={load}
          onCreate={openCreate}
        />
        {!canManage ? <Alert severity="info">Read-only access. Admin role is required for changes.</Alert> : null}
        {banner ? <Alert severity={banner.severity}>{banner.message}</Alert> : null}
        <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.fraudRuleId)} />
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? "Edit Fraud Rule" : "Create Fraud Rule"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Code"
            value={form.ruleCode}
            onChange={(event) => setForm((prev) => ({ ...prev, ruleCode: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Name"
            value={form.ruleName}
            onChange={(event) => setForm((prev) => ({ ...prev, ruleName: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Weight"
            type="number"
            value={form.ruleWeight}
            onChange={(event) => setForm((prev) => ({ ...prev, ruleWeight: Number(event.target.value) || 0 }))}
            required
            fullWidth
          />
          <TextField
            label="Definition"
            value={form.ruleDefinition}
            onChange={(event) => setForm((prev) => ({ ...prev, ruleDefinition: event.target.value }))}
            multiline
            minRows={4}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function WorkflowStagesSection({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowStage | null>(null);
  const [form, setForm] = useState({
    workflowDefinitionId: 1,
    stageCode: "",
    stageName: "",
    stageSequence: 1,
    slaInHours: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await systemConfigurationApi.getWorkflowStages());
      setBanner(null);
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: TableColumn<WorkflowStage>[] = [
    { key: "workflowDefinitionId", header: "Workflow ID" },
    { key: "stageCode", header: "Stage Code" },
    { key: "stageName", header: "Stage Name" },
    { key: "stageSequence", header: "Sequence" },
    { key: "slaInHours", header: "SLA (Hours)" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <CrudActions
          canManage={canManage}
          onEdit={() => {
            setEditing(row);
            setForm({
              workflowDefinitionId: row.workflowDefinitionId,
              stageCode: row.stageCode,
              stageName: row.stageName,
              stageSequence: row.stageSequence,
              slaInHours: row.slaInHours?.toString() ?? ""
            });
            setOpen(true);
          }}
          onDelete={() => void handleDelete(row)}
        />
      )
    }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({
      workflowDefinitionId: 1,
      stageCode: "",
      stageName: "",
      stageSequence: 1,
      slaInHours: ""
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        workflowDefinitionId: Number(form.workflowDefinitionId),
        stageCode: form.stageCode.trim(),
        stageName: form.stageName.trim(),
        stageSequence: Number(form.stageSequence),
        slaInHours: form.slaInHours.trim() ? Number(form.slaInHours) : null
      };

      if (editing) {
        await systemConfigurationApi.updateWorkflowStage(editing.workflowStageId, payload);
        setBanner({ severity: "success", message: "Workflow stage updated." });
      } else {
        await systemConfigurationApi.createWorkflowStage(payload);
        setBanner({ severity: "success", message: "Workflow stage created." });
      }

      setOpen(false);
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: WorkflowStage) => {
    if (!window.confirm(`Delete workflow stage "${row.stageName}"?`)) {
      return;
    }

    try {
      await systemConfigurationApi.deleteWorkflowStage(row.workflowStageId);
      setBanner({ severity: "success", message: "Workflow stage deleted." });
      await load();
    } catch (error) {
      setBanner({ severity: "error", message: toErrorMessage(error) });
    }
  };

  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <SectionHeader
          title="Workflow Stages"
          subtitle="Configure workflow sequence and SLA targets."
          canManage={canManage}
          loading={loading}
          onRefresh={load}
          onCreate={openCreate}
        />
        {!canManage ? <Alert severity="info">Read-only access. Admin role is required for changes.</Alert> : null}
        {banner ? <Alert severity={banner.severity}>{banner.message}</Alert> : null}
        <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.workflowStageId)} />
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Workflow Stage" : "Create Workflow Stage"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Workflow Definition ID"
            type="number"
            value={form.workflowDefinitionId}
            onChange={(event) => setForm((prev) => ({ ...prev, workflowDefinitionId: Number(event.target.value) || 0 }))}
            required
            fullWidth
          />
          <TextField
            label="Stage Code"
            value={form.stageCode}
            onChange={(event) => setForm((prev) => ({ ...prev, stageCode: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Stage Name"
            value={form.stageName}
            onChange={(event) => setForm((prev) => ({ ...prev, stageName: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Stage Sequence"
            type="number"
            value={form.stageSequence}
            onChange={(event) => setForm((prev) => ({ ...prev, stageSequence: Number(event.target.value) || 0 }))}
            required
            fullWidth
          />
          <TextField
            label="SLA (Hours)"
            type="number"
            value={form.slaInHours}
            onChange={(event) => setForm((prev) => ({ ...prev, slaInHours: event.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export function SystemConfigurationPage() {
  const [tab, setTab] = useState<ConfigTab>("claimTypes");
  const { user } = useAuthContext();
  const canManage = user?.roleCode === "Admin";

  return (
    <PageContainer>
      <PageHeader
        title="System Configuration"
        subtitle="Centralized master-data setup for claims lifecycle controls."
      />

      <Tabs value={tab} onChange={(_, value: ConfigTab) => setTab(value)} variant="scrollable" scrollButtons="auto">
        <Tab value="claimTypes" label="Claim Types" />
        <Tab value="claimStatuses" label="Claim Status" />
        <Tab value="insuranceProducts" label="Insurance Products" />
        <Tab value="fraudRules" label="Fraud Rules" />
        <Tab value="workflowStages" label="Workflow Stages" />
      </Tabs>

      {tab === "claimTypes" ? <ClaimTypesSection canManage={canManage} /> : null}
      {tab === "claimStatuses" ? <ClaimStatusesSection canManage={canManage} /> : null}
      {tab === "insuranceProducts" ? <InsuranceProductsSection canManage={canManage} /> : null}
      {tab === "fraudRules" ? <FraudRulesSection canManage={canManage} /> : null}
      {tab === "workflowStages" ? <WorkflowStagesSection canManage={canManage} /> : null}
    </PageContainer>
  );
}
