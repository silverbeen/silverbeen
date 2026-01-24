import type { PortfolioData } from '@/types/portfolio';
import { fetcher } from './client';

export const portfolioApi = {
  getPortfolio: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  updatePortfolio: (content: PortfolioData) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  /**
   * @deprecated Use `getPortfolio` instead
   */
  get: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  /**
   * @deprecated Use `updatePortfolio` instead
   */
  update: (content: PortfolioData) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
