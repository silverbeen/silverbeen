export interface Tag {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  posts?: SeriesPost[];
  _count?: { posts: number };
  createdAt: string;
  updatedAt: string;
}

export interface SeriesPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  seriesOrder?: number | null;
  createdAt?: string;
  published?: boolean;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  viewCount: number;
  likeCount: number;
  seriesId?: string | null;
  series?: Series | null;
  seriesOrder?: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface LikeStatusResponse {
  liked: boolean;
  likeCount: number;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
  createdAt?: string;
  seriesId?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
  createdAt?: string;
  seriesId?: string | null;
}

export interface CreateSeriesDto {
  title: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateSeriesDto {
  title?: string;
  description?: string;
  coverImage?: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name: string;
}

export interface AdjacentPost {
  id: number;
  title: string;
  slug: string;
}

export interface AdjacentPostsResponse {
  prevPost: AdjacentPost | null;
  nextPost: AdjacentPost | null;
}
