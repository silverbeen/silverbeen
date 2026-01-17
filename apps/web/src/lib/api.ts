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

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  resume: {
    get: () => fetcher<ResumeData>('/resume'),
    update: (content: ResumeData) =>
      fetcher<ResumeData>('/resume', {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
  },
};

export { ApiError };
