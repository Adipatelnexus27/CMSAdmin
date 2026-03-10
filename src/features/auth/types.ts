export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
