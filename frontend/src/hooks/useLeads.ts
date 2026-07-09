"use client";

import { useState, useEffect, useCallback } from "react";
import type { TargetLead } from "@/types/interface";
import { fetchLeads, ApiError } from "@/services/api";

interface UseLeadsReturn {
  leads: TargetLead[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook that fetches and manages leads from the backend.
 * Loads leads on mount and exposes a refetch function for manual refresh.
 */
export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<TargetLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data: TargetLead[] = await fetchLeads();
      setLeads(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load leads."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeads();
    }, 0);
    return (): void => clearTimeout(timer);
  }, [loadLeads]);

  return {
    leads,
    isLoading,
    error,
    refetch: loadLeads,
  };
}
