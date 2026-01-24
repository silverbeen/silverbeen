import type { ResumeData } from '@/types/resume';
import { fetcher } from './client';

export const resumeApi = {
  getResume: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  updateResume: (content: ResumeData) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  // Legacy aliases
  get: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  update: (content: ResumeData) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
