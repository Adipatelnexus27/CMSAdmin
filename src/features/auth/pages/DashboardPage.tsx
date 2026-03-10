import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { logout } from "../store/authSlice";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>CMS Admin</Typography>
        <Typography variant="body1">Welcome, {auth.fullName ?? auth.email ?? "User"}</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {auth.roles.map((role) => (
            <Chip key={role} label={`Role: ${role}`} color="primary" variant="outlined" />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {auth.permissions.map((permission) => (
            <Chip key={permission} label={permission} size="small" />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button variant="contained" onClick={() => navigate("/claims")}>Open Claims</Button>
          <Button variant="contained" onClick={() => navigate("/claims/triage")}>Open Claim Triage</Button>
          <Button variant="contained" onClick={() => navigate("/investigations")}>Open Investigation Dashboard</Button>
          <Button variant="contained" onClick={() => navigate("/configurations")}>Open System Configuration</Button>
          <Button variant="outlined" onClick={() => dispatch(logout())}>Logout</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
