import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

interface AuthUser {
  name: string;
  email: string;
  role: "Admin" | "Adjuster" | "Supervisor" | "Finance";
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "cms.auth.token";
const USER_KEY = "cms.auth.user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = window.localStorage.getItem(USER_KEY);
    return cached ? (JSON.parse(cached) as AuthUser) : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(window.localStorage.getItem(TOKEN_KEY)),
      login: async (email: string, password: string) => {
        if (!password.trim()) {
          throw new Error("Password is required.");
        }
        const nextUser: AuthUser = {
          email,
          name: "CMS Administrator",
          role: "Admin"
        };
        window.localStorage.setItem(TOKEN_KEY, "mock-jwt-token");
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
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
