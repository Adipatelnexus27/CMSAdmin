import { FormEvent, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/core/auth/AuthContext";
import { env } from "@/core/config/env";

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function LoginPage() {
  const [userNameOrEmail, setUserNameOrEmail] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const from = (location.state as LocationState | null)?.from?.pathname || "/";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(userNameOrEmail, password);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid credentials.");
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
        background: "linear-gradient(120deg, #E4ECFF 0%, #F7F9FF 60%, #E3F4F2 100%)",
        p: 2
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {env.appName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sign in to continue.
          </Typography>
          <Box component="form" onSubmit={onSubmit} mt={2}>
            <Stack spacing={2}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Username or Email"
                value={userNameOrEmail}
                onChange={(event) => setUserNameOrEmail(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Need an account?{" "}
                <Link component={RouterLink} to="/register">
                  Register user
                </Link>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

