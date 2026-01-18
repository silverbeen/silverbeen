export { ApiError, fetcher } from './client';
export type { FetcherOptions } from './client';

import { resumeApi } from './resume';
import { postsApi as blogsApi } from './posts';
import { tagsApi } from './tags';

export const api = {
  resume: resumeApi,
  blogs: blogsApi,
  tags: tagsApi,
};
