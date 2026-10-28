import { DURATION_LIMITS, type SurveyFilters } from "@/lib/survey-filters";
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

const DURATION_OPTIONS: Option<SurveyFilters["duration"]>[] = [
  { value: "all", label: "すべて" },
  ...DURATION_LIMITS.map((value) => ({ value, label: `${value}分以下` })),
];

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
    // fieldset は既定で min-width: min-content のため、min-w-0 がないと横スクロールせず幅が広がる
    <fieldset className="min-w-0">
      {/* legend は flex で横並びにできないため、読み上げ用に残して見た目のラベルは span で出す */}
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="w-14 shrink-0 text-xs text-gray-500 sm:mr-1 sm:w-auto"
        >
          {label}
        </span>
        {/* スマホでは折り返すと行ごとに崩れるため 1 行に固定して横スクロールにする */}
        <div className="flex min-w-0 [scrollbar-width:none] gap-1.5 overflow-x-auto py-1 sm:flex-wrap sm:overflow-visible">
          {options.map((option) => (
            <label key={option.value} className="shrink-0">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:ring-ring/50 inline-block cursor-pointer rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs whitespace-nowrap text-gray-700 transition peer-checked:border-purple-600 peer-checked:bg-purple-600 peer-checked:text-white peer-focus-visible:ring-3 hover:bg-gray-100 peer-checked:hover:bg-purple-700">
                {option.label}
              </span>
            </label>
          ))}
        </div>
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
    // 主役はアンケート一覧なので、絞り込みは 1〜2 行の帯に収めて一覧を上に寄せる
    <div className="mb-6 flex flex-col border-b border-gray-200 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
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
      {!isDefault && (
        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer self-end text-xs text-gray-500 underline-offset-2 transition hover:text-purple-700 hover:underline sm:ml-auto sm:self-auto"
        >
          条件をクリア
        </button>
      )}
    </div>
  );
}
