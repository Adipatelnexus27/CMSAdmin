export interface AuthUser {
  userId: number;
  userName: string;
  displayName: string;
  email: string;
  roleCode: "Admin" | "ClaimManager" | "Investigator" | "Adjuster" | "Finance" | "FraudAnalyst";
  roleName: string;
  permissions: string[];
}

export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  displayName: string;
  email: string;
  password: string;
  roleCode: AuthUser["roleCode"];
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

