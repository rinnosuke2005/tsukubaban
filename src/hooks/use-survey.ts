"use client";

import { useEffect, useState } from "react";
import { fetchSurvey } from "@/lib/api/surveys";
import type { Survey } from "@/lib/types/survey";

type UseSurveyResult = {
  survey: Survey | null;
  isLoading: boolean;
  error: string | null;
};

export function useSurvey(id: string): UseSurveyResult {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchSurvey(id)
      .then((data) => {
        if (!ignore) setSurvey(data);
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "募集の取得に失敗しました",
          );
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  return { survey, isLoading, error };
}
