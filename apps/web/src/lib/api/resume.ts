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

  /**
   * @deprecated Use `getResume` instead
   */
  get: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  /**
   * @deprecated Use `updateResume` instead
   */
  update: (content: ResumeData) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
