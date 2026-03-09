import { FormEvent, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Link, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/core/auth/AuthContext";
import { RegisterRequest } from "@/core/auth/types";

const roleOptions: RegisterRequest["roleCode"][] = [
  "ClaimManager",
  "Investigator",
  "Adjuster",
  "Finance",
  "FraudAnalyst"
];

export function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    userName: "",
    displayName: "",
    email: "",
    password: "",
    roleCode: "Adjuster"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
      setMessage("User registered successfully.");
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      setError("Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(120deg, #F2F8FF 0%, #F6F7FF 60%, #E3F4F2 100%)",
        p: 2
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Register User
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Admin can create users with role access.
          </Typography>
          <Box component="form" onSubmit={onSubmit} mt={2}>
            <Stack spacing={2}>
              {message ? <Alert severity="success">{message}</Alert> : null}
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Username"
                value={form.userName}
                onChange={(event) => setForm((prev) => ({ ...prev, userName: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Display Name"
                value={form.displayName}
                onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                select
                label="Role"
                value={form.roleCode}
                onChange={(event) => setForm((prev) => ({ ...prev, roleCode: event.target.value as RegisterRequest["roleCode"] }))}
                required
                fullWidth
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Back to{" "}
                <Link component={RouterLink} to="/login">
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

