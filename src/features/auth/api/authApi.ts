import { API_BASE_URL } from "../../../constants/api";
import { postJson } from "../../../services/http/httpClient";
import { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from "../types";

export const authApi = {
  login: (payload: LoginRequest): Promise<AuthResponse> =>
    postJson<AuthResponse, LoginRequest>(`${API_BASE_URL}/auth/login`, payload),

  register: (payload: RegisterRequest): Promise<AuthResponse> =>
    postJson<AuthResponse, RegisterRequest>(`${API_BASE_URL}/auth/register`, payload),

  refresh: (payload: RefreshTokenRequest): Promise<AuthResponse> =>
    postJson<AuthResponse, RefreshTokenRequest>(`${API_BASE_URL}/auth/refresh`, payload)
};
