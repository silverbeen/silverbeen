import type { ResumeData } from '@/types/resume';
import { fetcher } from './client';

export const resumeApi = {
  getResume: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  updateResume: (content: ResumeData, token: string) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * @deprecated Use `getResume` instead
   */
  get: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  /**
   * @deprecated Use `updateResume` instead
   */
  update: (content: ResumeData, token: string) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
