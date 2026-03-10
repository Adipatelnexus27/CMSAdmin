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
          <Button variant="contained" onClick={() => navigate("/claims/new")}>Create Claim</Button>
        </Stack>

        {error ? <Typography color="error">{error}</Typography> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim Number</TableCell>
              <TableCell>Policy</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
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
                <TableCell>{claim.reporterName}</TableCell>
                <TableCell>{new Date(claim.incidentDateUtc).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => navigate(`/claims/${claim.claimId}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
