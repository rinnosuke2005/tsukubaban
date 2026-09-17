"use client";

import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { useSurveys } from "@/hooks/use-surveys";

export default function Home() {
  const { surveys, isLoading, error } = useSurveys();

  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header />

      <main className="flex justify-center p-6">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : surveys.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだ募集はありません</p>
        ) : (
          <ul className="flex w-full max-w-xl flex-col">
            {surveys.map((survey, index) => (
              <li key={survey.id ?? survey.url}>
                {index > 0 && <Separator className="my-4" />}
                <p className="font-medium">{survey.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {survey.recruiterName}（{survey.affiliation}）
                </p>
                <a
                  href={survey.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-2 inline-block text-sm hover:underline"
                >
                  {survey.url}
                </a>
                {survey.requirements.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {survey.requirements.map((requirement, i) => (
                      <li
                        key={i}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {requirement}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
