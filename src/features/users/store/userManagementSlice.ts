import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import { CreateUserRequest, ManagedUser } from "../types";

const USER_CACHE_KEY = "cms_admin_cached_users";

function loadCachedUsers(): ManagedUser[] {
  try {
    const rawValue = localStorage.getItem(USER_CACHE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as ManagedUser[]) : [];
  } catch {
    return [];
  }
}

function persistUsers(users: ManagedUser[]): void {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(users));
}

interface UserManagementState {
  users: ManagedUser[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  warning: string | null;
}

const initialState: UserManagementState = {
  users: loadCachedUsers(),
  isLoading: false,
  isSaving: false,
  error: null,
  warning: null
};

export const fetchUsers = createAsyncThunk<ManagedUser[], void, { rejectValue: string }>(
  "users/fetchUsers",
  async (_, thunkApi) => {
    try {
      return await userApi.listUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load users from API.";
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk<ManagedUser, CreateUserRequest, { rejectValue: string }>(
  "users/createUser",
  async (payload, thunkApi) => {
    try {
      return await userApi.createUser(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create user.";
      return thunkApi.rejectWithValue(message);
    }
  }
);

const userManagementSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserMessages(state) {
      state.error = null;
      state.warning = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.warning = null;
    });

    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
      state.warning = null;
      persistUsers(state.users);
    });

    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.warning = action.payload ?? "User list API is unavailable. Showing cached users.";
    });

    builder.addCase(createUser.pending, (state) => {
      state.isSaving = true;
      state.error = null;
      state.warning = null;
    });

    builder.addCase(createUser.fulfilled, (state, action) => {
      state.isSaving = false;
      state.error = null;

      const existingIndex = state.users.findIndex(
        (user) => user.email.toLowerCase() === action.payload.email.toLowerCase()
      );

      if (existingIndex >= 0) {
        state.users[existingIndex] = action.payload;
      } else {
        state.users.unshift(action.payload);
      }

      persistUsers(state.users);
    });

    builder.addCase(createUser.rejected, (state, action) => {
      state.isSaving = false;
      state.error = action.payload ?? "Unable to create user.";
    });
  }
});

export const { clearUserMessages } = userManagementSlice.actions;
export default userManagementSlice.reducer;
