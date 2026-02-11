const DRAFT_PREFIX = 'post_draft_';

export interface DraftData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tagIds: string[];
  savedAt: string;
}

function getKey(postId?: number): string {
  return `${DRAFT_PREFIX}${postId ?? 'new'}`;
}

export function saveDraft(data: Omit<DraftData, 'savedAt'>, postId?: number): void {
  try {
    const draft: DraftData = { ...data, savedAt: new Date().toISOString() };
    localStorage.setItem(getKey(postId), JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable
  }
}

function isDraftData(value: unknown): value is DraftData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.excerpt === 'string' &&
    typeof obj.coverImage === 'string' &&
    Array.isArray(obj.tagIds) &&
    typeof obj.savedAt === 'string'
  );
}

export function loadDraft(postId?: number): DraftData | null {
  try {
    const raw = localStorage.getItem(getKey(postId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isDraftData(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function deleteDraft(postId?: number): void {
  try {
    localStorage.removeItem(getKey(postId));
  } catch {
    // ignore
  }
}

export function hasDraft(postId?: number): boolean {
  return !!loadDraft(postId);
}
