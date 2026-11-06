// 日付は DB の date 型に合わせて "YYYY-MM-DD" の文字列で扱う。
// Date に変換すると UTC との時差で日付がずれるため、ローカル時刻の年月日だけを使う

export function toDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(): string {
  return toDateString(new Date());
}

function nextDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day + 1));
}

function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  return `${month}/${day}`;
}

// 連続した日はまとめて表示する。例: ["2026-11-04", "2026-11-05", "2026-11-07"] → "11/4〜11/5, 11/7"
export function formatDates(dates: string[]): string {
  const sorted = [...dates].sort();
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (const date of sorted.slice(1)) {
    if (date === nextDay(end)) {
      end = date;
      continue;
    }
    ranges.push(
      start === end
        ? formatMonthDay(start)
        : `${formatMonthDay(start)}〜${formatMonthDay(end)}`,
    );
    start = date;
    end = date;
  }
  if (start) {
    ranges.push(
      start === end
        ? formatMonthDay(start)
        : `${formatMonthDay(start)}〜${formatMonthDay(end)}`,
    );
  }

  return ranges.join(", ");
}
