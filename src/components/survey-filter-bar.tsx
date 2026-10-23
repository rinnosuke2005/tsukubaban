import { DURATION_RANGES, type SurveyFilters } from "@/lib/survey-filters";
import { CONTACT_TYPE_LABELS } from "@/lib/types/survey";

type Option<V extends string> = { value: V; label: string };

const CONTACT_TYPE_OPTIONS = [
  { value: "all", label: "すべて" },
  ...Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
] as Option<SurveyFilters["contactType"]>[];

const REWARD_OPTIONS: Option<SurveyFilters["reward"]>[] = [
  { value: "all", label: "すべて" },
  { value: "yes", label: "あり" },
  { value: "no", label: "なし" },
];

const DURATION_OPTIONS = [
  { value: "all", label: "すべて" },
  ...Object.entries(DURATION_RANGES).map(([value, { label }]) => ({
    value,
    label,
  })),
] as Option<SurveyFilters["duration"]>[];

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
        className="border-input rounded-md border bg-white px-3 py-2"
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
          value={filters.contactType}
          options={CONTACT_TYPE_OPTIONS}
          onChange={(value) => setFilter("contactType", value)}
        />
        <FilterSelect
          label="謝礼"
          value={filters.reward}
          options={REWARD_OPTIONS}
          onChange={(value) => setFilter("reward", value)}
        />
        <FilterSelect
          label="所要時間"
          value={filters.duration}
          options={DURATION_OPTIONS}
          onChange={(value) => setFilter("duration", value)}
        />
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
