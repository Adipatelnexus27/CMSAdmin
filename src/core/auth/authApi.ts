import { httpClient } from "@/core/api/httpClient";
import { LoginRequest, RegisterRequest, TokenPayload } from "@/core/auth/types";

export const authApi = {
  login: (request: LoginRequest) => httpClient.post<TokenPayload>("/api/auth/login", request),
  register: (request: RegisterRequest) => httpClient.post("/api/auth/register", request),
  refresh: (refreshToken: string) =>
    httpClient.post<TokenPayload>("/api/auth/refresh", {
      refreshToken
    }),
  revoke: (refreshToken: string) =>
    httpClient.post<void>("/api/auth/revoke", {
      refreshToken
    })
};

