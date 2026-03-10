export async function postJson<TResponse, TRequest>(url: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Request failed.";
    throw new Error(message);
  }

  return data as TResponse;
}
