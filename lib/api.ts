const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';

export class ApiError extends Error {
  response?: {
    data?: unknown;
    status: number;
  };

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.response = {
      data,
      status,
    };
  }
}

async function post<T>(path: string, body?: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string } | null)?.message ?? 'Request failed',
      response.status,
      data,
    );
  }

  return { data: data as T };
}

const api = {
  post,
};

export default api;