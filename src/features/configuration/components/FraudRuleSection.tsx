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
import { FraudDetectionRule, UpsertFraudDetectionRuleRequest } from "../types";

const initialForm: UpsertFraudDetectionRuleRequest = {
  ruleName: "",
  ruleExpression: "",
  severityScore: 50,
  priority: 0,
  isActive: true
};

export function FraudRuleSection() {
  const [rules, setRules] = useState<FraudDetectionRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertFraudDetectionRuleRequest>(initialForm);

  async function loadRules(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setRules(await configurationApi.getFraudRules());
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load fraud rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRules();
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
        await configurationApi.updateFraudRule(editingId, form);
      } else {
        await configurationApi.createFraudRule(form);
      }
      resetForm();
      await loadRules();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Save failed.");
    }
  }

  function onEdit(rule: FraudDetectionRule): void {
    setEditingId(rule.fraudRuleId);
    setForm({
      ruleName: rule.ruleName,
      ruleExpression: rule.ruleExpression,
      severityScore: rule.severityScore,
      priority: rule.priority,
      isActive: rule.isActive
    });
  }

  async function onDelete(fraudRuleId: string): Promise<void> {
    setError(null);
    try {
      await configurationApi.deleteFraudRule(fraudRuleId);
      if (editingId === fraudRuleId) {
        resetForm();
      }
      await loadRules();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Delete failed.");
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Fraud Rule Form
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Rule Name"
              value={form.ruleName}
              onChange={(event) => setForm((prev) => ({ ...prev, ruleName: event.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Rule Expression"
              value={form.ruleExpression}
              onChange={(event) => setForm((prev) => ({ ...prev, ruleExpression: event.target.value }))}
              required
              fullWidth
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Severity Score"
                value={form.severityScore}
                onChange={(event) => setForm((prev) => ({ ...prev, severityScore: Number(event.target.value) }))}
              />
              <TextField
                type="number"
                label="Priority"
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))}
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
          Fraud Rule Table
        </Typography>

        {loading ? <Typography>Loading...</Typography> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Expression</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.fraudRuleId}>
                <TableCell>{rule.ruleName}</TableCell>
                <TableCell sx={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{rule.ruleExpression}</TableCell>
                <TableCell>{rule.severityScore}</TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>{rule.isActive ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => onEdit(rule)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete(rule.fraudRuleId)}>
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
