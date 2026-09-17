"use client";

import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSurveys } from "@/hooks/use-surveys";

const REQUIREMENTS_PREVIEW_COUNT = 3;

function RequirementItem({ requirement }: { requirement: string }) {
  return (
    <li className="text-foreground flex items-start gap-2 rounded-md bg-white px-2 py-1.5 text-sm break-words shadow-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="mt-0.5 size-3.5 shrink-0 text-purple-500"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="m8 12 3 3 5-6" />
      </svg>
      <span className="line-clamp-2">{requirement}</span>
    </li>
  );
}

export default function Home() {
  const { surveys, isLoading, error } = useSurveys();

  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header />

      <main className="px-4 py-6 sm:px-8 lg:px-30">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : surveys.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだ募集はありません</p>
        ) : (
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {surveys.map((survey) => {
              const previewRequirements = survey.requirements.slice(
                0,
                REQUIREMENTS_PREVIEW_COUNT,
              );
              const hiddenCount =
                survey.requirements.length - previewRequirements.length;

              return (
                <li key={survey.id ?? survey.url}>
                  <Card className="h-96 transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg font-bold">
                        {survey.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-col gap-1">
                        <span className="text-foreground/70 flex items-center gap-1.5 truncate">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="size-3.5 shrink-0"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                          </svg>
                          {survey.recruiterName}
                        </span>
                        <span className="flex items-center gap-1.5 truncate text-xs">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="size-3.5 shrink-0"
                          >
                            <rect x="4" y="3" width="16" height="18" rx="1" />
                            <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
                          </svg>
                          {survey.affiliation}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="-mb-(--card-spacing) flex min-h-0 flex-1 flex-col">
                      <a
                        href={survey.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-3 flex w-fit max-w-full items-center gap-1.5 truncate rounded-md bg-purple-50 px-2.5 py-1.5 text-sm text-purple-700 hover:bg-purple-100"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="size-3.5 shrink-0"
                        >
                          <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                          <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                        </svg>
                        <span className="truncate">{survey.url}</span>
                      </a>
                      <div className="-mx-(--card-spacing) mt-auto flex min-h-0 flex-col gap-2 border-t border-gray-200 bg-gray-100 px-(--card-spacing) py-2.5">
                        <p className="text-foreground/70 shrink-0 text-xs font-semibold tracking-wide">
                          応募条件
                        </p>
                        {previewRequirements.length > 0 ? (
                          <ul className="flex h-32 shrink-0 flex-col gap-2 overflow-hidden">
                            {previewRequirements.map((requirement, i) => (
                              <RequirementItem
                                key={i}
                                requirement={requirement}
                              />
                            ))}
                          </ul>
                        ) : (
                          <p className="text-foreground/50 h-32 shrink-0 text-xs">
                            なし
                          </p>
                        )}
                        <div className="h-4 shrink-0">
                          {hiddenCount > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  className="text-foreground/60 hover:text-foreground text-xs font-medium hover:underline"
                                >
                                  すべて見る（{survey.requirements.length}件）
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>応募条件</DialogTitle>
                                </DialogHeader>
                                <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
                                  {survey.requirements.map((requirement, i) => (
                                    <RequirementItem
                                      key={i}
                                      requirement={requirement}
                                    />
                                  ))}
                                </ul>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
