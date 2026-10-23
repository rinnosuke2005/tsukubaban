"use client";

import { useMemo, useState } from "react";
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
    <li className="text-foreground flex items-start gap-2 rounded-md bg-white px-2 py-1.5 text-base break-words shadow-sm">
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
        className={preview ? "min-w-0 truncate" : "min-w-0 whitespace-pre-wrap"}
        title={preview ? requirement : undefined}
      >
        {requirement}
      </span>
    </li>
  );
}

export default function Home() {
  const { surveys, isLoading, error } = useSurveys();

  const [contactFilter, setContactFilter] = useState<
    "all" | "url" | "email" | "phone"
  >("all");

  const [rewardFilter, setRewardFilter] = useState<
    "all" | "yes" | "no"
  >("all");

  const [durationFilter, setDurationFilter] = useState<
    "all" | "5-or-less" | "5-10" | "10-30" | "30-60" | "60-plus"
  >("all");

  const clearFilters = () => {
    setContactFilter("all");
    setRewardFilter("all");
    setDurationFilter("all");
  };

  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey) => {
      const matchesContact =
        contactFilter === "all" ||
        survey.contactType === contactFilter;

      const matchesReward =
        rewardFilter === "all" ||
        (rewardFilter === "yes" && survey.hasReward === true) ||
        (rewardFilter === "no" && survey.hasReward === false);

      const matchesDuration =
        durationFilter === "all" ||
        (survey.estimatedMinutes !== null &&
          (durationFilter === "5-or-less"
            ? survey.estimatedMinutes <= 5
            : durationFilter === "5-10"
              ? survey.estimatedMinutes > 5 &&
                survey.estimatedMinutes <= 10
              : durationFilter === "10-30"
                ? survey.estimatedMinutes > 10 &&
                  survey.estimatedMinutes <= 30
                : durationFilter === "30-60"
                  ? survey.estimatedMinutes > 30 &&
                    survey.estimatedMinutes < 60
                  : survey.estimatedMinutes >= 60));

      return matchesContact && matchesReward && matchesDuration;
    });
  }, [surveys, contactFilter, rewardFilter, durationFilter]);

  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header />

      <main className="px-4 py-6 sm:px-8 lg:px-30">
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">回答方法</span>
            <select
              value={contactFilter}
              onChange={(e) =>
                setContactFilter(
                  e.target.value as "all" | "url" | "email" | "phone",
                )
              }
              className="border-input rounded-md border bg-white px-3 py-2"
            >
              <option value="all">すべて</option>
              <option value="url">Web回答</option>
              <option value="email">メール回答</option>
              <option value="phone">電話回答</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">謝礼</span>
            <select
              value={rewardFilter}
              onChange={(e) =>
                setRewardFilter(
                  e.target.value as "all" | "yes" | "no",
                )
              }
              className="border-input rounded-md border bg-white px-3 py-2"
            >
              <option value="all">すべて</option>
              <option value="yes">あり</option>
              <option value="no">なし</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">所要時間</span>
            <select
              value={durationFilter}
              onChange={(e) =>
                setDurationFilter(
                  e.target.value as
                    | "all"
                    | "5-or-less"
                    | "5-10"
                    | "10-30"
                    | "30-60"
                    | "60-plus",
                )
              }
              className="border-input rounded-md border bg-white px-3 py-2"
            >
              <option value="all">すべて</option>
              <option value="5-or-less">5分以下</option>
              <option value="5-10">5〜10分</option>
              <option value="10-30">10〜30分</option>
              <option value="30-60">30〜60分</option>
              <option value="60-plus">60分以上</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={
              contactFilter === "all" &&
              rewardFilter === "all" &&
              durationFilter === "all"
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            条件をクリア
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-base">読み込み中...</p>
        ) : error ? (
          <p className="text-destructive text-base">{error}</p>
        ) : surveys.length === 0 ? (
          <p className="text-muted-foreground text-base">
            まだ募集はありません
          </p>
        ) : filteredSurveys.length === 0 ? (
          <p className="text-muted-foreground text-base">
            条件に一致する募集はありません
          </p>
        ) : (
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSurveys.map((survey) => {
              const reward = formatReward(survey);
              const previewRequirements = survey.requirements.slice(
                0,
                REQUIREMENTS_PREVIEW_COUNT,
              );

              return (
                <li key={survey.id}>
                  <Card className="group relative h-full min-h-[26rem] transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 min-w-0 text-xl font-bold break-words transition-colors group-hover:text-purple-700">
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="focus-visible:after:ring-ring/50 cursor-pointer outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3"
                        >
                          {survey.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1 flex min-w-0 flex-col gap-1 text-base">
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
                        <span className="flex min-w-0 items-center gap-1.5 truncate text-sm">
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
                          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm">
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
                          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm">
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
                    <CardContent className="-mb-(--card-spacing) flex flex-1 flex-col">
                      <span className="mb-3 w-fit rounded-md bg-purple-50 px-2.5 py-1 text-base text-purple-700">
                        {CONTACT_TYPE_LABELS[survey.contactType]}
                      </span>
                      <div className="-mx-(--card-spacing) mt-auto flex h-56 shrink-0 flex-col gap-2 border-t border-gray-200 bg-gray-100 px-(--card-spacing) py-2.5">
                        <p className="text-foreground/70 shrink-0 text-sm font-semibold tracking-wide">
                          必須条件
                        </p>
                        {survey.requirements.length > 0 ? (
                          <ul className="flex min-w-0 shrink-0 flex-col gap-2">
                            {previewRequirements.map((requirement, i) => (
                              <RequirementItem
                                key={i}
                                requirement={requirement}
                                preview
                              />
                            ))}
                          </ul>
                        ) : (
                          <p className="text-foreground/50 text-sm">なし</p>
                        )}
                        <div className="mt-auto flex flex-col items-start gap-1">
                          {survey.requirements.length >
                            REQUIREMENTS_PREVIEW_COUNT && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={`${survey.title}の必須条件をすべて見る`}
                                  className="text-foreground/60 focus-visible:ring-ring/50 relative z-10 w-fit cursor-pointer rounded-sm text-sm font-medium transition-colors outline-none hover:text-purple-700 hover:underline focus-visible:ring-3"
                                >
                                  必須条件をすべて見る（残り
                                  {survey.requirements.length -
                                    REQUIREMENTS_PREVIEW_COUNT}
                                  件） &gt;
                                </button>
                              </DialogTrigger>
                              <DialogContent
                                className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto"
                                aria-describedby={undefined}
                              >
                                <DialogHeader className="min-w-0 pr-6">
                                  <DialogTitle className="leading-snug break-words">
                                    {survey.title}の必須条件
                                  </DialogTitle>
                                </DialogHeader>
                                <ul className="flex min-w-0 flex-col gap-2">
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
