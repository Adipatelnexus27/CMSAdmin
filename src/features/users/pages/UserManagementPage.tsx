import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
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
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearUserMessages, createUser, fetchUsers } from "../store/userManagementSlice";
import { USER_ROLE_OPTIONS, UserRole } from "../types";

function formatDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString();
}

export function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading, isSaving, error, warning } = useAppSelector((state) => state.users);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Claim Manager");
  const [search, setSearch] = useState("");

  useEffect(() => {
    void dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) =>
      user.fullName.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.roles.some((userRole) => userRole.toLowerCase().includes(query))
    );
  }, [search, users]);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    dispatch(clearUserMessages());

    const action = await dispatch(createUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role
    }));

    if (createUser.fulfilled.match(action)) {
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("Claim Manager");
    }
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register users and assign roles for the claim lifecycle.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => void dispatch(fetchUsers())} disabled={isLoading || isSaving}>
            {isLoading ? "Refreshing..." : "Refresh Users"}
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
        {warning ? <Alert severity="warning" sx={{ mt: 2 }}>{warning}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Temporary Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              sx={{ minWidth: 220 }}
            >
              {USER_ROLE_OPTIONS.map((roleValue) => (
                <MenuItem key={roleValue} value={roleValue}>{roleValue}</MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" disabled={isSaving} sx={{ minWidth: 160 }}>
              {isSaving ? "Creating..." : "Create User"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Users</Typography>
          <TextField
            label="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ width: { xs: "100%", md: 280 } }}
          />
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {user.roles.map((userRole) => (
                      <Chip key={`${user.userId}-${userRole}`} label={userRole} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>{user.source === "api" ? "API" : "Created Here"}</TableCell>
                <TableCell>{formatDate(user.createdAtUtc)}</TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
