import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { AuthResponse, LoginRequest } from "../types";

const ACCESS_TOKEN_KEY = "cms_access_token";
const REFRESH_TOKEN_KEY = "cms_refresh_token";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  fullName: string | null;
  roles: string[];
  permissions: string[];
}

function loadPersistedState(): Pick<AuthState, "accessToken" | "refreshToken"> {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
  };
}

const persisted = loadPersistedState();

const initialState: AuthState = {
  isAuthenticated: Boolean(persisted.accessToken),
  isLoading: false,
  error: null,
  accessToken: persisted.accessToken,
  refreshToken: persisted.refreshToken,
  email: null,
  fullName: null,
  roles: [],
  permissions: []
};

export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>("auth/login", async (payload) => {
  return authApi.login(payload);
});

export const refreshSession = createAsyncThunk<AuthResponse, string>("auth/refresh", async (refreshToken) => {
  return authApi.refresh({ refreshToken });
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.email = null;
      state.fullName = null;
      state.roles = [];
      state.permissions = [];
      state.error = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      hydrateStateWithAuth(state, action.payload);
      state.isLoading = false;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message ?? "Login failed.";
    });

    builder.addCase(refreshSession.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      hydrateStateWithAuth(state, action.payload);
    });
  }
});

function hydrateStateWithAuth(state: AuthState, payload: AuthResponse): void {
  state.isAuthenticated = true;
  state.accessToken = payload.accessToken;
  state.refreshToken = payload.refreshToken;
  state.email = payload.email;
  state.fullName = payload.fullName;
  state.roles = payload.roles;
  state.permissions = payload.permissions;
  state.error = null;

  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
}

export const { logout } = authSlice.actions;
export default authSlice.reducer;
