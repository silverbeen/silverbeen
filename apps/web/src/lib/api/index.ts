export { ApiError, fetcher } from './client';
export type { FetcherOptions } from './client';

import { resumeApi } from './resume';

export const api = {
  resume: resumeApi,
};
