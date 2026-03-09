import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { authApi } from "@/core/auth/authApi";
import { clearSession, getCurrentUser, getRefreshToken, setSession } from "@/core/auth/authStorage";
import { AuthUser, RegisterRequest } from "@/core/auth/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userNameOrEmail: string, password: string) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (userNameOrEmail: string, password: string) => {
        const payload = await authApi.login({ userNameOrEmail, password });
        setSession(payload);
        setUser(payload.user);
      },
      register: async (request: RegisterRequest) => {
        await authApi.register(request);
      },
      logout: async () => {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            await authApi.revoke(refreshToken);
          } catch {
            // Intentional no-op: local session must still be cleared.
          }
        }
        clearSession();
        setUser(null);
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
}

