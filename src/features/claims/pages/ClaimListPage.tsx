import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { claimApi } from "../api/claimApi";
import { ClaimSummary } from "../types";

export function ClaimListPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setClaims(await claimApi.getClaims());
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : "Unable to load claims.");
      }
    })();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Claim List</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/claims/triage")}>Triage & Assignment</Button>
            <Button variant="outlined" onClick={() => navigate("/investigations")}>Investigation Dashboard</Button>
            <Button variant="outlined" onClick={() => navigate("/fraud-review")}>Fraud Review</Button>
            <Button variant="contained" onClick={() => navigate("/claims/new")}>Create Claim</Button>
          </Stack>
        </Stack>

        {error ? <Typography color="error">{error}</Typography> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim Number</TableCell>
              <TableCell>Policy</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Workflow Step</TableCell>
              <TableCell>Investigator</TableCell>
              <TableCell>Adjuster</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Incident Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.claimId}>
                <TableCell>{claim.claimNumber}</TableCell>
                <TableCell>{claim.policyNumber}</TableCell>
                <TableCell>{claim.claimType}</TableCell>
                <TableCell>{claim.claimStatus}</TableCell>
                <TableCell>{claim.priority}</TableCell>
                <TableCell>{claim.workflowStep}</TableCell>
                <TableCell>{claim.investigatorUserId ?? "-"}</TableCell>
                <TableCell>{claim.adjusterUserId ?? "-"}</TableCell>
                <TableCell>{claim.reporterName}</TableCell>
                <TableCell>{new Date(claim.incidentDateUtc).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => navigate(`/claims/${claim.claimId}`)}>
                      View
                    </Button>
                    <Button size="small" variant="contained" onClick={() => navigate(`/claims/triage?claimId=${claim.claimId}`)}>
                      Triage
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
