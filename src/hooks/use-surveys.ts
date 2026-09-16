"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSurveys } from "@/lib/api/surveys";
import type { Survey } from "@/lib/types/survey";

type UseSurveysResult = {
  surveys: Survey[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "アンケートの取得に失敗しました";
}

export function useSurveys(): UseSurveysResult {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchSurveys()
      .then((data) => {
        if (!ignore) setSurveys(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refetchToken]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRefetchToken((token) => token + 1);
  }, []);

  return { surveys, isLoading, error, refetch };
}
