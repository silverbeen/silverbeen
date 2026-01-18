"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResumeData } from "@/types/resume";
import { api } from "@/lib/api";

interface UseResumeResult {
  data: ResumeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useResume(): UseResumeResult {
  const [data, setData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResume = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resumeData = await api.resume.get();
      setData(resumeData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchResume,
  };
}
