import { config } from '@/config';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FetcherOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
}

export async function fetcher<T>(endpoint: string, options?: FetcherOptions): Promise<T> {
  const { revalidate, tags, ...fetchOptions } = options || {};

  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    next: revalidate !== undefined || tags ? { revalidate, tags } : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}
