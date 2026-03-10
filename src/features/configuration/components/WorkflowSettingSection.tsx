import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { configurationApi } from "../api/configurationApi";
import { UpsertWorkflowSettingRequest, WorkflowSetting } from "../types";

const initialForm: UpsertWorkflowSettingRequest = {
  workflowKey: "",
  stepName: "",
  stepSequence: 1,
  assignedRole: "",
  slaHours: 24,
  isActive: true
};

export function WorkflowSettingSection() {
  const [settings, setSettings] = useState<WorkflowSetting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertWorkflowSettingRequest>(initialForm);

  async function loadSettings(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setSettings(await configurationApi.getWorkflowSettings());
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load workflow settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function resetForm(): void {
    setForm(initialForm);
    setEditingId(null);
  }

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await configurationApi.updateWorkflowSetting(editingId, form);
      } else {
        await configurationApi.createWorkflowSetting(form);
      }
      resetForm();
      await loadSettings();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Save failed.");
    }
  }

  function onEdit(setting: WorkflowSetting): void {
    setEditingId(setting.workflowSettingId);
    setForm({
      workflowKey: setting.workflowKey,
      stepName: setting.stepName,
      stepSequence: setting.stepSequence,
      assignedRole: setting.assignedRole,
      slaHours: setting.slaHours,
      isActive: setting.isActive
    });
  }

  async function onDelete(workflowSettingId: string): Promise<void> {
    setError(null);
    try {
      await configurationApi.deleteWorkflowSetting(workflowSettingId);
      if (editingId === workflowSettingId) {
        resetForm();
      }
      await loadSettings();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Delete failed.");
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Workflow Setting Form
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Workflow Key"
                value={form.workflowKey}
                onChange={(event) => setForm((prev) => ({ ...prev, workflowKey: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Step Name"
                value={form.stepName}
                onChange={(event) => setForm((prev) => ({ ...prev, stepName: event.target.value }))}
                required
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Step Sequence"
                value={form.stepSequence}
                onChange={(event) => setForm((prev) => ({ ...prev, stepSequence: Number(event.target.value) }))}
              />
              <TextField
                label="Assigned Role"
                value={form.assignedRole}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedRole: event.target.value }))}
                required
              />
              <TextField
                type="number"
                label="SLA Hours"
                value={form.slaHours}
                onChange={(event) => setForm((prev) => ({ ...prev, slaHours: Number(event.target.value) }))}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                }
                label="Active"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained">{editingId ? "Update" : "Create"}</Button>
              <Button type="button" variant="outlined" onClick={resetForm}>Clear</Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Workflow Setting Table
        </Typography>

        {loading ? <Typography>Loading...</Typography> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Workflow</TableCell>
              <TableCell>Step</TableCell>
              <TableCell>Sequence</TableCell>
              <TableCell>Assigned Role</TableCell>
              <TableCell>SLA Hours</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map((setting) => (
              <TableRow key={setting.workflowSettingId}>
                <TableCell>{setting.workflowKey}</TableCell>
                <TableCell>{setting.stepName}</TableCell>
                <TableCell>{setting.stepSequence}</TableCell>
                <TableCell>{setting.assignedRole}</TableCell>
                <TableCell>{setting.slaHours}</TableCell>
                <TableCell>{setting.isActive ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => onEdit(setting)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete(setting.workflowSettingId)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
