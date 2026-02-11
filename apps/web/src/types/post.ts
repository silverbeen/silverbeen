export interface Tag {
  id: string;
  name: string;
  _count?: {
    posts: number;
  };
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
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
  createdAt?: string;
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
