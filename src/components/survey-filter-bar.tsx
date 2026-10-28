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

// 選択肢が少ないため、プルダウンに隠さず全件を並べて 1 クリックで切り替えられるようにする。
// 中身は radio にして、矢印キー操作と読み上げはブラウザ標準に任せる
function FilterChips<V extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: V;
  options: Option<V>[];
  onChange: (value: V) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="peer-focus-visible:ring-ring/50 inline-block cursor-pointer rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition peer-checked:border-purple-600 peer-checked:bg-purple-600 peer-checked:text-white peer-focus-visible:ring-3 hover:bg-gray-100 peer-checked:hover:bg-purple-700">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
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
      <div className="flex flex-col gap-4">
        <FilterChips
          label="回答方法"
          name="contactType"
          value={filters.contactType}
          options={CONTACT_TYPE_OPTIONS}
          onChange={(value) => setFilter("contactType", value)}
        />
        <FilterChips
          label="謝礼"
          name="reward"
          value={filters.reward}
          options={REWARD_OPTIONS}
          onChange={(value) => setFilter("reward", value)}
        />
        <FilterChips
          label="所要時間"
          name="duration"
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
