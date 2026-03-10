import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { logout } from "../store/authSlice";

export function DashboardPage() {
  const dispatch = useAppDispatch();
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

        <Button variant="outlined" onClick={() => dispatch(logout())} sx={{ width: "fit-content" }}>
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
