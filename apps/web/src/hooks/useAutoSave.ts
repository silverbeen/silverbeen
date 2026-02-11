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
    // 매 키 입력마다 JSON.stringify 비교하지 않고 dirty 플래그만 설정
    // 실제 비교는 save 시점에 수행
    isDirtyRef.current = true;
  }, []);

  const setInitialState = useCallback((state: AutoSaveState) => {
    initialStateRef.current = JSON.stringify(state);
    stateRef.current = state;
    isDirtyRef.current = false;
  }, []);

  const save = useCallback((): boolean => {
    if (!isDirtyRef.current) return false;
    // save 시점에 실제 변경 여부 확인
    if (JSON.stringify(stateRef.current) === initialStateRef.current) {
      isDirtyRef.current = false;
      return false;
    }
    const { title, content } = stateRef.current;
    if (!title.trim() && !content.trim()) return false;

    saveDraft(stateRef.current, postId);
    isDirtyRef.current = false;
    setLastSaved(new Date().toISOString());
    return true;
  }, [postId]);

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

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
      saveRef.current();
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return { updateState, setInitialState, save, load, discard, lastSaved };
}
