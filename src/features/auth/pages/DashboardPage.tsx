import { Box, Button, Card, CardActions, CardContent, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";

const DASHBOARD_MODULES = [
  {
    title: "Claims",
    path: "/claims",
    description: "Search, register, and track all claims with full lifecycle visibility."
  },
  {
    title: "Investigations",
    path: "/investigations",
    description: "Manage evidence, investigator notes, and progress tracking."
  },
  {
    title: "Fraud Review",
    path: "/fraud-review",
    description: "Review fraud flags, run detection, and execute fraud workflow actions."
  },
  {
    title: "Settlement Processing",
    path: "/settlements",
    description: "Calculate settlements, manage approvals, and track payment statuses."
  },
  {
    title: "Audit Trail",
    path: "/audit-trail",
    description: "Monitor user actions, claim changes, and API activity with exportable reports."
  },
  {
    title: "Reports",
    path: "/reports",
    description: "Analyze claims and export operational and finance reports."
  },
  {
    title: "User Management",
    path: "/users",
    description: "Create users and assign claim-management roles."
  },
  {
    title: "System Configuration",
    path: "/system-configuration",
    description: "Maintain insurance products, claim statuses, fraud rules, and workflow settings."
  }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          CMS Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mt: 0.5 }}>
          Welcome, {auth.fullName ?? auth.email ?? "User"}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          {auth.roles.length > 0 ? auth.roles.map((role) => (
            <Chip key={role} label={role} color="primary" variant="outlined" />
          )) : <Chip label="No roles found" color="warning" variant="outlined" />}
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2 }}>
        {DASHBOARD_MODULES.map((module) => (
          <Card key={module.path} variant="outlined" sx={{ display: "flex", flexDirection: "column", minHeight: 180 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {module.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {module.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="contained" onClick={() => navigate(module.path)}>
                Open {module.title}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
