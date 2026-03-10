import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loginUser } from "../store/authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(120deg, #e9f5f7 0%, #f7f9fb 100%)",
        p: 2
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <Typography variant="h5" fontWeight={700}>
              Claim Management Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to CMS Admin.
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
