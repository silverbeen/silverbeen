import type { ResumeData } from '@/types/resume';
import { fetcher } from './client';

export const resumeApi = {
  get: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  update: (content: ResumeData) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
