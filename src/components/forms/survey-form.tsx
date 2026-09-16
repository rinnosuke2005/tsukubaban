"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Survey } from "@/lib/types/survey";

export function SurveyForm() {
  const [survey, setSurvey] = useState<Survey>({ url: "" });
  const [submittedUrls, setSubmittedUrls] = useState<string[]>([]);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittedUrls((prev) => [...prev, survey.url]);
    setSurvey({ url: "" });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="アンケートのURLを入力"
          value={survey.url}
          onChange={(e) => setSurvey({ ...survey, url: e.target.value })}
          required
        />
        <Button type="submit">送信</Button>
      </form>

      {/* 　データベース作成後に一覧表示は移動 */}
      {submittedUrls.length > 0 && (
        <ul className="flex flex-col gap-1">
          {submittedUrls.map((url, index) => (
            <li key={index}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary break-all underline"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
