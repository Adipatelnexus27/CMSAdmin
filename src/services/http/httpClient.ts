function buildHeaders(includeContentType: boolean = true): HeadersInit {
  const token = localStorage.getItem("cms_access_token");

  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Request failed.";
    throw new Error(message);
  }

  return data as TResponse;
}

export async function getJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders()
  });

  return parseResponse<TResponse>(response);
}

export async function postJson<TResponse, TRequest>(url: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  return parseResponse<TResponse>(response);
}

export async function putJson<TResponse, TRequest>(url: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  return parseResponse<TResponse>(response);
}

export async function deleteJson(url: string): Promise<void> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders()
  });

  await parseResponse<void>(response);
}

export async function uploadMultipart<TResponse>(url: string, formData: FormData): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(false),
    body: formData
  });

  return parseResponse<TResponse>(response);
}

export async function getBlob(url: string): Promise<Blob> {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(false)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = typeof data?.message === "string" ? data.message : "Request failed.";
    throw new Error(message);
  }

  return response.blob();
}
