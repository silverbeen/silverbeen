export { ApiError, fetcher } from './client';
export type { FetcherOptions } from './client';

import { resumeApi } from './resume';
import { portfolioApi } from './portfolio';
import { postsApi as blogsApi } from './posts';
import { tagsApi } from './tags';
import { usersApi } from './users';
import { statsApi } from './stats';
import { seriesApi } from './series';

export const api = {
  resume: resumeApi,
  portfolio: portfolioApi,
  blogs: blogsApi,
  tags: tagsApi,
  users: usersApi,
  stats: statsApi,
  series: seriesApi,
};
