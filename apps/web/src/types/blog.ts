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
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
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
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}

export interface CreateTagDto {
  name: string;
}
