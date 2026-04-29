const API_BASE = `${import.meta.env.BASE_URL}api`;

interface ApiErrorBody {
  message?: string;
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as
    | TResponse
    | ApiErrorBody
    | null;

  if (!response.ok) {
    const message =
      (data as ApiErrorBody | null)?.message ?? "Request failed";
    throw new Error(message);
  }

  if (data === null) {
    throw new Error(
      "Falha ao processar resposta do servidor. Tente novamente.",
    );
  }

  return data as TResponse;
}

export function apiGet<TResponse>(path: string): Promise<TResponse> {
  return request<TResponse>(path, { method: "GET" });
}

export function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  return request<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
