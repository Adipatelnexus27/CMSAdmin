import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/core/auth/AuthContext";

export function AuthGuard() {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

