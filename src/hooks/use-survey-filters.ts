"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_SURVEY_FILTERS,
  isDefaultFilters,
  parseSurveyFilters,
  toSearchParams,
  type SurveyFilters,
} from "@/lib/survey-filters";

type UseSurveyFiltersResult = {
  filters: SurveyFilters;
  setFilter: <K extends keyof SurveyFilters>(
    key: K,
    value: SurveyFilters[K],
  ) => void;
  clearFilters: () => void;
  isDefault: boolean;
};

// 条件は URL クエリに持たせ、リロード・共有・戻る/進むで保持されるようにする
export function useSurveyFilters(): UseSurveyFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseSurveyFilters(searchParams),
    [searchParams],
  );

  // push だと条件変更のたびに履歴が積まれ、戻るで前のページに戻れなくなるため replace
  const replaceFilters = useCallback(
    (next: SurveyFilters) => {
      const query = toSearchParams(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  const setFilter = useCallback(
    <K extends keyof SurveyFilters>(key: K, value: SurveyFilters[K]) => {
      replaceFilters({ ...filters, [key]: value });
    },
    [filters, replaceFilters],
  );

  const clearFilters = useCallback(() => {
    replaceFilters(DEFAULT_SURVEY_FILTERS);
  }, [replaceFilters]);

  return {
    filters,
    setFilter,
    clearFilters,
    isDefault: isDefaultFilters(filters),
  };
}
