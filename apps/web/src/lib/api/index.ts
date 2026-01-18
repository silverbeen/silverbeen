export { ApiError, fetcher } from './client';
export type { FetcherOptions } from './client';

import { resumeApi } from './resume';
import { postsApi } from './posts';
import { tagsApi } from './tags';

export const api = {
  resume: resumeApi,
  posts: postsApi,
  tags: tagsApi,
};
