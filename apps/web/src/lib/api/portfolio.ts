import type { PortfolioData } from '@/types/portfolio';
import { fetcher } from './client';

export const portfolioApi = {
  getPortfolio: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  updatePortfolio: (content: PortfolioData, token: string) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * @deprecated Use `getPortfolio` instead
   */
  get: (options?: { revalidate?: number }) =>
    fetcher<PortfolioData>('/portfolio', { revalidate: options?.revalidate }),

  /**
   * @deprecated Use `updatePortfolio` instead
   */
  update: (content: PortfolioData, token: string) =>
    fetcher<PortfolioData>('/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
