import { env } from "@/core/config/env";
import { clearSession, getAccessToken, getCurrentUser, getRefreshToken, setSession } from "@/core/auth/authStorage";
import { TokenPayload } from "@/core/auth/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  retryOnUnauthorized?: boolean;
}

class HttpClient {
  private refreshPromise: Promise<TokenPayload> | null = null;

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${env.apiBaseUrl}${url}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (response.status === 401 && options.retryOnUnauthorized !== false && !this.isAuthEndpoint(url)) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request<T>(url, { ...options, retryOnUnauthorized: false });
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>(url, { method: "POST", body });
  }

  put<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>(url, { method: "PUT", body });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes("/api/auth/login") || url.includes("/api/auth/refresh");
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return false;
    }

    try {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshRequest(refreshToken);
      }
      const payload = await this.refreshPromise;
      const currentUser = getCurrentUser();
      setSession({
        ...payload,
        user: payload.user ?? currentUser!
      });
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async refreshRequest(refreshToken: string): Promise<TokenPayload> {
    const response = await fetch(`${env.apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error("Refresh token request failed.");
    }

    return (await response.json()) as TokenPayload;
  }
}

export const httpClient = new HttpClient();

