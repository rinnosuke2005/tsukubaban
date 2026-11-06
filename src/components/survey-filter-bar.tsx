import { ChevronDown } from "lucide-react";
import { Popover } from "radix-ui";
import { DateMultiPicker } from "@/components/date-multi-picker";
import { formatDates } from "@/lib/date";
import type { SurveyFilters } from "@/lib/survey-filters";
import { ANSWER_METHOD_LABELS } from "@/lib/types/survey";

type Option<V extends string> = { value: V; label: string };

const ANSWER_METHOD_OPTIONS = [
  { value: "all", label: "すべて" },
  ...Object.entries(ANSWER_METHOD_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
] as Option<SurveyFilters["answerMethod"]>[];

const REWARD_OPTIONS: Option<SurveyFilters["reward"]>[] = [
  { value: "all", label: "すべて" },
  { value: "yes", label: "あり" },
  { value: "no", label: "なし" },
];

const controlClass = "border-input rounded-md border bg-white px-3 py-2";

function FilterSelect<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (value: V) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const option = options.find((o) => o.value === e.target.value);
          if (option) onChange(option.value);
        }}
        className={controlClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type SurveyFilterBarProps = {
  filters: SurveyFilters;
  setFilter: <K extends keyof SurveyFilters>(
    key: K,
    value: SurveyFilters[K],
  ) => void;
  clearFilters: () => void;
  isDefault: boolean;
};

export function SurveyFilterBar({
  filters,
  setFilter,
  clearFilters,
  isDefault,
}: SurveyFilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FilterSelect
          label="回答方法"
          value={filters.answerMethod}
          options={ANSWER_METHOD_OPTIONS}
          onChange={(value) => setFilter("answerMethod", value)}
        />
        <FilterSelect
          label="謝礼"
          value={filters.reward}
          options={REWARD_OPTIONS}
          onChange={(value) => setFilter("reward", value)}
        />
        <div className="flex flex-col gap-1 text-sm">
          <span id="filter-dates-label" className="font-medium">
            参加したい日
          </span>
          <Popover.Root>
            <Popover.Trigger
              aria-labelledby="filter-dates-label"
              className={`${controlClass} flex items-center justify-between gap-2 text-left`}
            >
              <span className="min-w-0 truncate">
                {filters.dates.length > 0
                  ? formatDates(filters.dates)
                  : "すべて"}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={4}
                className="z-50 w-72 rounded-lg bg-white p-2 shadow-lg"
              >
                <DateMultiPicker
                  labelledBy="filter-dates-label"
                  value={filters.dates}
                  onChange={(dates) => setFilter("dates", dates)}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          disabled={isDefault}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          条件をクリア
        </button>
      </div>
    </div>
  );
}
