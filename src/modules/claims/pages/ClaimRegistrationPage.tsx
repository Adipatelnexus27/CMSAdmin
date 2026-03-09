import { FormEvent, useState } from "react";
import { Alert, Button, Card, CardContent, Grid, Stack, TextField } from "@mui/material";
import { claimsApi } from "@/modules/claims/api/claimsApi";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";

export function ClaimRegistrationPage() {
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimantName, setClaimantName] = useState("");
  const [lossDate, setLossDate] = useState("");
  const [lossDescription, setLossDescription] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);
    try {
      const result = await claimsApi.create({
        policyNumber,
        claimantName,
        lossDate,
        lossDescription
      });
      setResponseMessage(`Claim registered successfully: ${result.claimNumber}`);
      setPolicyNumber("");
      setClaimantName("");
      setLossDate("");
      setLossDescription("");
    } catch {
      setResponseMessage("Claim service is unavailable. Check backend and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Claim Registration (FNOL)"
        subtitle="Capture first notice of loss and initialize the claim workflow."
      />
      <Card>
        <CardContent>
          <Stack component="form" onSubmit={onSubmit} spacing={2}>
            {responseMessage ? <Alert severity="info">{responseMessage}</Alert> : null}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Policy Number"
                  value={policyNumber}
                  onChange={(event) => setPolicyNumber(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Claimant Name"
                  value={claimantName}
                  onChange={(event) => setClaimantName(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Loss Date"
                  type="date"
                  value={lossDate}
                  onChange={(event) => setLossDate(event.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Loss Description"
                  value={lossDescription}
                  onChange={(event) => setLossDescription(event.target.value)}
                  required
                  fullWidth
                  multiline
                  minRows={4}
                />
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Claim"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
