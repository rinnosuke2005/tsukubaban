"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSurveys } from "@/hooks/use-surveys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CONTACT_TYPE_LABELS, formatReward } from "@/lib/types/survey";

const REQUIREMENTS_PREVIEW_COUNT = 3;

function RequirementItem({
  requirement,
  preview = false,
}: {
  requirement: string;
  preview?: boolean;
}) {
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
      <span
        className={
          preview ? "line-clamp-1 min-w-0" : "min-w-0 whitespace-pre-wrap"
        }
      >
        {requirement}
      </span>
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

              const reward = formatReward(survey);

              return (
                <li key={survey.id}>
                  <Card className="group relative h-[26rem] transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 min-w-0 text-lg font-bold break-words transition-colors group-hover:text-purple-700">
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="focus-visible:after:ring-ring/50 cursor-pointer outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3"
                        >
                          {survey.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1 flex min-w-0 flex-col gap-1">
                        <span className="text-foreground/70 flex min-w-0 items-center gap-1.5 truncate">
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
                        <span className="flex min-w-0 items-center gap-1.5 truncate text-xs">
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
                        {reward && (
                          <span className="flex min-w-0 items-center gap-1.5 truncate text-xs">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              className="size-3.5 shrink-0"
                            >
                              <rect x="3" y="8" width="18" height="4" rx="1" />
                              <path d="M5 12v8h14v-8M12 8v12M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0c0 1 0 3 0 3Zm0 0c2 0 4-1 4-3a2 2 0 0 0-4 0" />
                            </svg>
                            謝礼：{reward}
                          </span>
                        )}
                        {survey.estimatedMinutes !== null && (
                          <span className="flex min-w-0 items-center gap-1.5 truncate text-xs">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              className="size-3.5 shrink-0"
                            >
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" />
                            </svg>
                            所要時間：約{survey.estimatedMinutes}分
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="-mb-(--card-spacing) flex min-h-0 flex-1 flex-col">
                      <span className="mb-3 w-fit rounded-md bg-purple-50 px-2.5 py-1 text-sm text-purple-700">
                        {CONTACT_TYPE_LABELS[survey.contactType]}
                      </span>
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
                                preview
                              />
                            ))}
                          </ul>
                        ) : (
                          <p className="text-foreground/50 h-32 shrink-0 text-xs">
                            なし
                          </p>
                        )}
                        <div className="h-4 shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                aria-label={`${survey.title}の応募条件をすべて見る`}
                                className="text-foreground/60 focus-visible:ring-ring/50 relative z-10 cursor-pointer rounded-sm text-xs font-medium transition-colors outline-none group-hover:text-purple-700 group-hover:underline hover:underline focus-visible:ring-3"
                              >
                                詳細を見る &gt;
                              </button>
                            </DialogTrigger>
                            <DialogContent
                              className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto"
                              aria-describedby={undefined}
                            >
                              <DialogHeader className="min-w-0 pr-6">
                                <DialogTitle className="leading-snug break-words">
                                  {survey.title}の応募条件
                                </DialogTitle>
                              </DialogHeader>
                              {survey.requirements.length > 0 ? (
                                <ul className="flex min-w-0 flex-col gap-2">
                                  {survey.requirements.map((requirement, i) => (
                                    <RequirementItem
                                      key={i}
                                      requirement={requirement}
                                    />
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-foreground/50 text-sm">
                                  なし
                                </p>
                              )}
                            </DialogContent>
                          </Dialog>
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
