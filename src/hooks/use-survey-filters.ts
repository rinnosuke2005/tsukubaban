"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_SURVEY_FILTERS,
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

export function useSurveyFilters(): UseSurveyFiltersResult {
  const [filters, setFilters] = useState<SurveyFilters>(DEFAULT_SURVEY_FILTERS);

  const setFilter = useCallback(
    <K extends keyof SurveyFilters>(key: K, value: SurveyFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_SURVEY_FILTERS);
  }, []);

  const isDefault = (
    Object.keys(DEFAULT_SURVEY_FILTERS) as (keyof SurveyFilters)[]
  ).every((key) => filters[key] === DEFAULT_SURVEY_FILTERS[key]);

  return { filters, setFilter, clearFilters, isDefault };
}
