import type { ResumeData } from '@/types/resume';
import { config } from '@/config';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetcherOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
}

async function fetcher<T>(endpoint: string, options?: FetcherOptions): Promise<T> {
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

export const api = {
  resume: {
    get: (options?: { revalidate?: number }) =>
      fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),
    update: (content: ResumeData) =>
      fetcher<ResumeData>('/resume', {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
  },
};

export { ApiError };
