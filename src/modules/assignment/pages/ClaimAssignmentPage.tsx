import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useAuthContext } from "@/core/auth/AuthContext";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import {
  claimAssignmentApi,
  ClaimAssignmentDashboard,
  ClaimPriority,
  ClaimTriageItem
} from "@/modules/assignment/api/claimAssignmentApi";

const priorityOptions: ClaimPriority[] = ["Low", "Medium", "High", "Critical"];

const priorityColorMap: Record<ClaimPriority, "default" | "warning" | "error" | "info"> = {
  Low: "default",
  Medium: "info",
  High: "warning",
  Critical: "error"
};

export function ClaimAssignmentPage() {
  const { user } = useAuthContext();
  const canManageAssignments = user?.roleCode === "Admin" || user?.roleCode === "ClaimManager";

  const [dashboard, setDashboard] = useState<ClaimAssignmentDashboard | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionClaimId, setActionClaimId] = useState<number | null>(null);
  const [prioritySelections, setPrioritySelections] = useState<Record<number, ClaimPriority>>({});
  const [investigatorSelections, setInvestigatorSelections] = useState<Record<number, string>>({});
  const [adjusterSelections, setAdjusterSelections] = useState<Record<number, string>>({});

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await claimAssignmentApi.getDashboard();
      setDashboard(data);
      setMessage(null);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to load assignment dashboard.";
      setMessage(text);
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const triageQueue = dashboard?.triageQueue ?? [];
  const investigatorOptions = dashboard?.investigators ?? [];
  const adjusterOptions = dashboard?.adjusters ?? [];

  const dashboardStats = {
    queueCount: triageQueue.length,
    criticalCount: triageQueue.filter((item) => item.priority === "Critical").length,
    unassignedInvestigations: triageQueue.filter((item) => !item.investigator).length,
    unassignedAdjustments: triageQueue.filter((item) => !item.adjuster).length
  };

  const getSelectedPriority = (item: ClaimTriageItem): ClaimPriority =>
    prioritySelections[item.claimId] ?? item.priority;

  const assignInvestigator = async (claimId: number, selectedUserId?: number) => {
    setActionClaimId(claimId);
    setMessage(null);
    try {
      const result = await claimAssignmentApi.assignInvestigator(claimId, selectedUserId, "Claim manager assignment");
      setMessage(
        `Investigator assigned for ${result.claimNumber}: ${result.assignedToDisplayName} (workload: ${result.assignedUserWorkload}).`
      );
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to assign investigator.");
    } finally {
      setActionClaimId(null);
    }
  };

  const assignAdjuster = async (claimId: number, selectedUserId?: number) => {
    setActionClaimId(claimId);
    setMessage(null);
    try {
      const result = await claimAssignmentApi.assignAdjuster(claimId, selectedUserId, "Claim manager assignment");
      setMessage(
        `Adjuster assigned for ${result.claimNumber}: ${result.assignedToDisplayName} (workload: ${result.assignedUserWorkload}).`
      );
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to assign adjuster.");
    } finally {
      setActionClaimId(null);
    }
  };

  const triageClaim = async (claimId: number, priority: ClaimPriority) => {
    setActionClaimId(claimId);
    setMessage(null);
    try {
      await claimAssignmentApi.triageClaim(claimId, priority);
      setMessage(`Claim ${claimId} triaged with ${priority} priority.`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to triage claim.");
    } finally {
      setActionClaimId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Claim Triage & Assignment"
        subtitle="Assign investigators/adjusters, manage priorities, and auto-balance workload."
        endAdornment={
          <Button variant="outlined" onClick={() => void refresh()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {!canManageAssignments ? (
        <Alert severity="warning">Only Admin and Claim Manager can manage triage and assignments.</Alert>
      ) : null}
      {message ? <Alert severity="info">{message}</Alert> : null}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Triage Queue
            </Typography>
            <Typography variant="h5">{dashboardStats.queueCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Critical Priority
            </Typography>
            <Typography variant="h5">{dashboardStats.criticalCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Missing Investigator
            </Typography>
            <Typography variant="h5">{dashboardStats.unassignedInvestigations}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Missing Adjuster
            </Typography>
            <Typography variant="h5">{dashboardStats.unassignedAdjustments}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Investigator Workload
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Active Assignments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investigatorOptions.map((item) => (
                    <TableRow key={item.userId}>
                      <TableCell>{item.displayName}</TableCell>
                      <TableCell>{item.roleCode}</TableCell>
                      <TableCell>{item.activeAssignments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Adjuster Workload
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Active Assignments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjusterOptions.map((item) => (
                    <TableRow key={item.userId}>
                      <TableCell>{item.displayName}</TableCell>
                      <TableCell>{item.roleCode}</TableCell>
                      <TableCell>{item.activeAssignments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent sx={{ display: "grid", gap: 2 }}>
          <Typography variant="h6">Claim Manager Queue</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim</TableCell>
                  <TableCell>Claimant</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Investigator</TableCell>
                  <TableCell>Adjuster</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {triageQueue.map((item) => (
                  <TableRow key={item.claimId} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">{item.claimNumber}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.policyNumber} • ${item.estimatedLossAmount.toLocaleString()}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.claimantName}</TableCell>
                    <TableCell>{item.statusName}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getSelectedPriority(item)}
                        color={priorityColorMap[getSelectedPriority(item)]}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        size="small"
                        select
                        value={getSelectedPriority(item)}
                        onChange={(event) =>
                          setPrioritySelections((prev) => ({
                            ...prev,
                            [item.claimId]: event.target.value as ClaimPriority
                          }))
                        }
                        fullWidth
                      >
                        {priorityOptions.map((priority) => (
                          <MenuItem key={priority} value={priority}>
                            {priority}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="caption">{item.investigator?.displayName || "Unassigned"}</Typography>
                        <TextField
                          size="small"
                          select
                          value={investigatorSelections[item.claimId] ?? ""}
                          onChange={(event) =>
                            setInvestigatorSelections((prev) => ({
                              ...prev,
                              [item.claimId]: event.target.value
                            }))
                          }
                          fullWidth
                        >
                          <MenuItem value="">Select investigator</MenuItem>
                          {investigatorOptions.map((userOption) => (
                            <MenuItem key={userOption.userId} value={String(userOption.userId)}>
                              {userOption.displayName} ({userOption.activeAssignments})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="caption">{item.adjuster?.displayName || "Unassigned"}</Typography>
                        <TextField
                          size="small"
                          select
                          value={adjusterSelections[item.claimId] ?? ""}
                          onChange={(event) =>
                            setAdjusterSelections((prev) => ({
                              ...prev,
                              [item.claimId]: event.target.value
                            }))
                          }
                          fullWidth
                        >
                          <MenuItem value="">Select adjuster</MenuItem>
                          {adjusterOptions.map((userOption) => (
                            <MenuItem key={userOption.userId} value={String(userOption.userId)}>
                              {userOption.displayName} ({userOption.activeAssignments})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManageAssignments || actionClaimId === item.claimId}
                          onClick={() => void triageClaim(item.claimId, getSelectedPriority(item))}
                        >
                          Triage
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManageAssignments || actionClaimId === item.claimId}
                          onClick={() =>
                            void assignInvestigator(
                              item.claimId,
                              investigatorSelections[item.claimId] ? Number(investigatorSelections[item.claimId]) : undefined
                            )
                          }
                        >
                          Investigator
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManageAssignments || actionClaimId === item.claimId}
                          onClick={() =>
                            void assignAdjuster(
                              item.claimId,
                              adjusterSelections[item.claimId] ? Number(adjusterSelections[item.claimId]) : undefined
                            )
                          }
                        >
                          Adjuster
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {triageQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        No open claims available for triage and assignment.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
