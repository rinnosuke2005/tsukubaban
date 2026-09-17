"use client";

import { cn } from "cn";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSurveys } from "@/hooks/use-surveys";

export default function Home() {
  const { surveys, isLoading, error } = useSurveys();

  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header />

      <main className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : surveys.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだ募集はありません</p>
        ) : (
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {surveys.map((survey) => (
              <li key={survey.id ?? survey.url}>
                <Card className="h-80">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {survey.title}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-0.5">
                      <span className="text-foreground/70 truncate">
                        {survey.recruiterName}
                      </span>
                      <span className="truncate text-xs">
                        {survey.affiliation}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className={cn(
                      "flex min-h-0 flex-1 flex-col",
                      survey.requirements.length > 0 && "-mb-(--card-spacing)",
                    )}
                  >
                    <a
                      href={survey.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      {survey.url}
                    </a>
                    {survey.requirements.length > 0 && (
                      <div className="-mx-(--card-spacing) mt-auto flex min-h-0 flex-col gap-1.5 border-t border-purple-100 bg-purple-50/60 px-(--card-spacing) py-2">
                        <p className="text-foreground/70 shrink-0 text-xs font-medium">
                          応募条件
                        </p>
                        <ul
                          className={cn(
                            "flex h-28 shrink-0 flex-wrap content-start gap-1.5 overflow-y-auto pr-1",
                            "scrollbar-thin [scrollbar-color:var(--color-purple-300)_transparent]",
                            "[&::-webkit-scrollbar]:w-1.5",
                            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-300",
                            "[&::-webkit-scrollbar-track]:bg-transparent",
                          )}
                        >
                          {survey.requirements.map((requirement, i) => (
                            <li
                              key={i}
                              className="text-foreground/80 max-w-full min-w-0 rounded-full border border-purple-200 bg-white px-2 py-0.5 text-xs break-words"
                            >
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
