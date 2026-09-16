import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  showBackLink?: boolean;
  showCreateButton?: boolean;
};

export function Header({
  showBackLink = false,
  showCreateButton = true,
}: HeaderProps) {
  return (
    <header className="border-border relative border-b px-6 py-7">
      <div className="absolute top-24 right-6 flex items-center gap-4">
        {showBackLink && (
          <Link
            href="/"
            className="text-muted-foreground inline-flex h-11 w-32 items-center justify-center text-sm hover:underline"
          >
            一覧に戻る
          </Link>
        )}
        {showCreateButton && (
          <Button
            asChild
            className="text-bold h-11 w-32 bg-purple-500 px-5 text-base text-white hover:bg-purple-600"
          >
            <Link href="/new">募集作成</Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <Image
          src="/title.png"
          alt="つくばばん"
          width={763}
          height={238}
          className="h-20 w-auto object-contain"
        />
        <p className="text-muted-foreground text-center text-xs">
          「データがない！」を「集まった！」に変える
          <br />
          アンケートの募集者と回答者を繋ぐアプリです
        </p>
      </div>
    </header>
  );
}
