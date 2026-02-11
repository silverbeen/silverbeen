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

export function loadDraft(postId?: number): DraftData | null {
  try {
    const raw = localStorage.getItem(getKey(postId));
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
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
