"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatDates, toDateString, today } from "@/lib/date";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type DateMultiPickerProps = {
  value: string[];
  onChange: (dates: string[]) => void;
  labelledBy?: string;
};

// 1日ずつタップして複数の日付を選ぶカレンダー。今日より前の日は選べない。
// 投稿フォームの実施日と、一覧の「参加したい日」の絞り込みで使う
export function DateMultiPicker({
  value,
  onChange,
  labelledBy,
}: DateMultiPickerProps) {
  const now = new Date();
  const [month, setMonth] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const todayString = today();
  const selected = new Set(value);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = month.getDay();
  const isCurrentMonth =
    year === now.getFullYear() && monthIndex === now.getMonth();

  function toggle(date: string) {
    const next = new Set(selected);
    if (next.has(date)) {
      next.delete(date);
    } else {
      next.add(date);
    }
    onChange([...next].sort());
  }

  function moveMonth(offset: number) {
    setMonth(new Date(year, monthIndex + offset, 1));
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-labelledby={labelledBy}
        className="border-input rounded-lg border p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={isCurrentMonth}
            aria-label="前の月"
            className="rounded-md p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-bold">
            {year}年{monthIndex + 1}月
          </span>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="次の月"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="text-muted-foreground py-1 text-xs">
              {weekday}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = toDateString(new Date(year, monthIndex, i + 1));
            const isSelected = selected.has(date);
            const isPast = date < todayString;
            return (
              <button
                key={date}
                type="button"
                onClick={() => toggle(date)}
                disabled={isPast && !isSelected}
                aria-pressed={isSelected}
                aria-label={`${monthIndex + 1}月${i + 1}日`}
                className="aspect-square rounded-md hover:bg-purple-50 disabled:text-gray-300 disabled:hover:bg-transparent aria-pressed:bg-purple-500 aria-pressed:font-bold aria-pressed:text-white"
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex items-start justify-between gap-2 text-sm">
          <p className="min-w-0 break-words">
            選択中：{formatDates(value)}（{value.length}日）
          </p>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-muted-foreground shrink-0 hover:underline"
          >
            クリア
          </button>
        </div>
      )}
    </div>
  );
}
