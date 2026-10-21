export type ShareType = 'RESUME' | 'PORTFOLIO';

export interface ShareLink {
  id: string;
  slug: string;
  type: ShareType;
  label?: string | null;
  active: boolean;
  viewCount: number;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareLinkDto {
  type: ShareType;
  label?: string;
  expiresAt?: string;
}
