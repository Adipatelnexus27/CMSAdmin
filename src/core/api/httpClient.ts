import { env } from "@/core/config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

class HttpClient {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const token = window.localStorage.getItem("cms.auth.token");
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
}

export const httpClient = new HttpClient();

