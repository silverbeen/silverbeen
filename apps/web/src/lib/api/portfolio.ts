import type { PortfolioData } from '@silverbeen/types';
import { fetcher } from './client';

export const portfolioApi = {
  getPortfolio: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  updatePortfolio: (content: PortfolioData) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      auth: true,
    }),
};
