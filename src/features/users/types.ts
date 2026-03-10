export const USER_ROLE_OPTIONS = [
  "Admin",
  "Claim Manager",
  "Investigator",
  "Adjuster",
  "Finance",
  "Fraud Analyst"
] as const;

export type UserRole = typeof USER_ROLE_OPTIONS[number];

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface ManagedUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAtUtc: string;
  source: "api" | "local";
}

export interface ApiUserRecord {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive?: boolean;
  createdAtUtc?: string;
}
