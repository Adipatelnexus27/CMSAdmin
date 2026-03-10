import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { claimApi } from "../api/claimApi";

export function ClaimCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [policyNumber, setPolicyNumber] = useState("POL-2026-0001");
  const [claimType, setClaimType] = useState("Property Damage");
  const [reporterName, setReporterName] = useState("");
  const [incidentDateUtc, setIncidentDateUtc] = useState(new Date().toISOString().slice(0, 16));
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [relatedClaimIdsText, setRelatedClaimIdsText] = useState("");

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const relatedClaimIds = relatedClaimIdsText
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      const createdClaim = await claimApi.registerClaim({
        policyNumber,
        claimType,
        reporterName,
        incidentDateUtc: new Date(incidentDateUtc).toISOString(),
        incidentLocation,
        incidentDescription,
        relatedClaimIds
      });

      navigate(`/claims/${createdClaim.claimId}`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Claim creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, maxWidth: 900 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Register New Claim
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="Policy Number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} required fullWidth />
              <TextField label="Claim Type" value={claimType} onChange={(e) => setClaimType(e.target.value)} required fullWidth />
            </Stack>

            <TextField label="Reporter Name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} required fullWidth />

            <TextField
              label="Incident Date"
              type="datetime-local"
              value={incidentDateUtc}
              onChange={(e) => setIncidentDateUtc(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField label="Incident Location" value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)} required fullWidth />

            <TextField
              label="Incident Description"
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              required
              fullWidth
              multiline
              minRows={3}
            />

            <TextField
              label="Related Claim IDs (comma separated UUIDs)"
              value={relatedClaimIdsText}
              onChange={(e) => setRelatedClaimIdsText(e.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Creating..." : "Create Claim"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => navigate("/claims")}>Back to List</Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
