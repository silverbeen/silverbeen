import type { ResumeData } from '@silverbeen/types';
import { fetcher } from './client';

export const resumeApi = {
  getResume: (options?: { revalidate?: number }) =>
    fetcher<ResumeData>('/resume', { revalidate: options?.revalidate }),

  updateResume: (content: ResumeData) =>
    fetcher<ResumeData>('/resume', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      auth: true,
    }),
};
