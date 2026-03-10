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
import { LookupConfigurationItem, LookupConfigType, UpsertLookupConfigurationItemRequest } from "../types";

interface LookupConfigurationSectionProps {
  configType: LookupConfigType;
  title: string;
}

const initialForm: UpsertLookupConfigurationItemRequest = {
  name: "",
  code: "",
  description: "",
  displayOrder: 0,
  isActive: true
};

export function LookupConfigurationSection({ configType, title }: LookupConfigurationSectionProps) {
  const [items, setItems] = useState<LookupConfigurationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertLookupConfigurationItemRequest>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadItems(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await configurationApi.getLookupItems(configType);
      setItems(data);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [configType]);

  function resetForm(): void {
    setForm(initialForm);
    setEditingId(null);
  }

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await configurationApi.updateLookupItem(configType, editingId, form);
      } else {
        await configurationApi.createLookupItem(configType, form);
      }

      resetForm();
      await loadItems();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Save failed.");
    }
  }

  async function onDelete(id: string): Promise<void> {
    setError(null);
    try {
      await configurationApi.deleteLookupItem(id);
      if (editingId === id) {
        resetForm();
      }
      await loadItems();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Delete failed.");
    }
  }

  function onEdit(item: LookupConfigurationItem): void {
    setEditingId(item.configurationItemId);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description ?? "",
      displayOrder: item.displayOrder,
      isActive: item.isActive
    });
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {title} Form
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Code"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                required
                fullWidth
              />
            </Stack>

            <TextField
              label="Description"
              value={form.description ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              fullWidth
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <TextField
                type="number"
                label="Display Order"
                value={form.displayOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    displayOrder: Number(event.target.value)
                  }))
                }
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
          {title} Table
        </Typography>

        {loading ? <Typography>Loading...</Typography> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.configurationItemId}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.displayOrder}</TableCell>
                <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => onEdit(item)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete(item.configurationItemId)}>
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
