import axios, { AxiosRequestConfig, isAxiosError } from "axios";

const httpClient = axios.create();

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("cms_access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function readBlobErrorMessage(blob: Blob): Promise<string | null> {
  try {
    const text = await blob.text();
    if (!text) {
      return null;
    }

    try {
      const parsed = JSON.parse(text) as { message?: string; title?: string; error?: string };
      if (typeof parsed.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }

      if (typeof parsed.title === "string" && parsed.title.trim()) {
        return parsed.title;
      }

      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return parsed.error;
      }

      return text;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

async function toErrorMessage(error: unknown): Promise<string> {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Request failed.";
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const blobMessage = await readBlobErrorMessage(data);
    if (blobMessage) {
      return blobMessage;
    }
  }

  if (data && typeof data === "object") {
    const typed = data as { message?: string; title?: string; error?: string };
    if (typeof typed.message === "string" && typed.message.trim()) {
      return typed.message;
    }

    if (typeof typed.title === "string" && typed.title.trim()) {
      return typed.title;
    }

    if (typeof typed.error === "string" && typed.error.trim()) {
      return typed.error;
    }
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return "Request failed.";
}

async function requestJson<TResponse>(config: AxiosRequestConfig): Promise<TResponse> {
  try {
    const response = await httpClient.request<TResponse>(config);
    return response.data as TResponse;
  } catch (error) {
    throw new Error(await toErrorMessage(error));
  }
}

export function getJson<TResponse>(url: string): Promise<TResponse> {
  return requestJson<TResponse>({
    method: "GET",
    url
  });
}

export function postJson<TResponse, TRequest>(url: string, payload: TRequest): Promise<TResponse> {
  return requestJson<TResponse>({
    method: "POST",
    url,
    data: payload
  });
}

export function putJson<TResponse, TRequest>(url: string, payload: TRequest): Promise<TResponse> {
  return requestJson<TResponse>({
    method: "PUT",
    url,
    data: payload
  });
}

export async function deleteJson(url: string): Promise<void> {
  await requestJson<void>({
    method: "DELETE",
    url
  });
}

export function uploadMultipart<TResponse>(url: string, formData: FormData): Promise<TResponse> {
  return requestJson<TResponse>({
    method: "POST",
    url,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export async function getBlob(url: string): Promise<Blob> {
  try {
    const response = await httpClient.request<Blob>({
      method: "GET",
      url,
      responseType: "blob"
    });

    return response.data;
  } catch (error) {
    throw new Error(await toErrorMessage(error));
  }
}
