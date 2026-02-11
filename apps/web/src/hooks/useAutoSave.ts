'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { saveDraft, loadDraft, deleteDraft } from '@/utils/draft';
import type { DraftData } from '@/utils/draft';

interface UseAutoSaveOptions {
  postId?: number;
  interval?: number; // ms, default 30s
}

interface AutoSaveState {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tagIds: string[];
}

export function useAutoSave({ postId, interval = 30000 }: UseAutoSaveOptions = {}) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const stateRef = useRef<AutoSaveState>({ title: '', content: '', excerpt: '', coverImage: '', tagIds: [] });
  const initialStateRef = useRef<string>('');
  const isDirtyRef = useRef(false);

  const updateState = useCallback((state: AutoSaveState) => {
    stateRef.current = state;
    isDirtyRef.current = JSON.stringify(state) !== initialStateRef.current;
  }, []);

  const setInitialState = useCallback((state: AutoSaveState) => {
    initialStateRef.current = JSON.stringify(state);
    stateRef.current = state;
    isDirtyRef.current = false;
  }, []);

  const save = useCallback(() => {
    if (!isDirtyRef.current) return;
    const { title, content } = stateRef.current;
    if (!title.trim() && !content.trim()) return;

    saveDraft(stateRef.current, postId);
    setLastSaved(new Date().toISOString());
  }, [postId]);

  const load = useCallback((): DraftData | null => {
    return loadDraft(postId);
  }, [postId]);

  const discard = useCallback(() => {
    deleteDraft(postId);
    setLastSaved(null);
    isDirtyRef.current = false;
  }, [postId]);

  // Auto-save interval
  useEffect(() => {
    const timer = setInterval(() => {
      save();
    }, interval);

    return () => clearInterval(timer);
  }, [save, interval]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return { updateState, setInitialState, save, load, discard, lastSaved };
}
