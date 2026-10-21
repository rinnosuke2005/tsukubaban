import Link from "next/link";

export function BackLink() {
  return (
    <Link
      href="/"
      className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-1 text-sm hover:underline"
    >
      <span aria-hidden>←</span>
      一覧に戻る
    </Link>
  );
}
