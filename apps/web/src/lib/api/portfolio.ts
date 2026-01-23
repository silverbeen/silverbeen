import type { PortfolioData } from '@/types/portfolio';
import { fetcher } from './client';

export const portfolioApi = {
  get: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  update: (content: PortfolioData) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
