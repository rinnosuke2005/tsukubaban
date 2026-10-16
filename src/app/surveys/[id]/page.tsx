"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/header";
import { useSurvey } from "@/hooks/use-survey";
import { CONTACT_TYPE_LABELS, type Survey } from "@/lib/types/survey";

const actionButtonClass =
  "flex h-12 w-full items-center justify-center rounded-full bg-purple-500 px-5 text-base font-bold text-white hover:bg-purple-600 md:h-14";

function formatDate(iso: string | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function ContactAction({ survey }: { survey: Survey }) {
  const [isPhoneShown, setIsPhoneShown] = useState(false);

  switch (survey.contactType) {
    case "url":
      return (
        <>
          <a
            href={survey.contactValue}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClass}
          >
            回答画面にすすむ
          </a>
          <p className="text-muted-foreground hidden text-xs md:block">
            外部サイトが新しいタブで開きます。
          </p>
        </>
      );
    case "email":
      return (
        <>
          <a
            href={`mailto:${survey.contactValue}`}
            className={actionButtonClass}
          >
            メールで回答する
          </a>
          <div className="hidden text-xs md:block">
            <p className="text-muted-foreground">宛先</p>
            <p className="text-sm font-medium break-all">
              {survey.contactValue}
            </p>
            <p className="text-muted-foreground mt-1">
              メールアプリが開きます。開かない場合は宛先をコピーしてください。
            </p>
          </div>
        </>
      );
    case "phone":
      return isPhoneShown ? (
        <>
          <a
            href={`tel:${survey.contactValue}`}
            className="flex h-12 w-full items-center justify-center rounded-full bg-purple-50 px-5 text-xl font-bold text-purple-700 md:h-14"
          >
            {survey.contactValue}
          </a>
          <p className="text-muted-foreground hidden text-xs md:block">
            スマートフォンではタップで発信できます。連絡可能な時間帯は概要を確認してください。
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsPhoneShown(true)}
            className={actionButtonClass}
          >
            電話番号を表示する
          </button>
          <p className="text-muted-foreground hidden text-xs md:block">
            番号はボタンを押すと表示されます。
          </p>
        </>
      );
  }
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xl font-bold md:text-2xl">{children}</h2>;
}

function SurveyDetail({ survey }: { survey: Survey }) {
  const postedAt = formatDate(survey.createdAt);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6 md:pb-16">
      <h1 className="text-2xl font-bold break-words md:text-3xl">
        {survey.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="rounded bg-gray-100 px-2.5 py-0.5 text-sm font-medium">
          {CONTACT_TYPE_LABELS[survey.contactType]}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12">
        <main className="min-w-0">
          <dl className="flex flex-col gap-2 border-y border-gray-200 py-4">
            {[
              ["募集者", survey.recruiterName],
              ["所属", survey.affiliation],
              ...(postedAt ? [["投稿日", postedAt]] : []),
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4"
              >
                <dt className="w-fit rounded bg-gray-100 px-2 text-[13px] font-medium">
                  {label}
                </dt>
                <dd className="break-words">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <SectionHeading>応募条件</SectionHeading>
            {survey.requirements.length > 0 ? (
              <ul className="border-t border-gray-200">
                {survey.requirements.map((requirement, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 border-b border-gray-200 py-2.5 break-words"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="mt-1.5 size-3.5 shrink-0 text-purple-500"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground/50 text-sm">なし</p>
            )}
          </section>

          {survey.description && (
            <section className="mt-10">
              <SectionHeading>アンケートの概要</SectionHeading>
              <p className="max-w-[65ch] break-words whitespace-pre-wrap">
                {survey.description}
              </p>
            </section>
          )}
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:sticky md:inset-auto md:top-6 md:border-0 md:p-0">
          <ContactAction survey={survey} />
        </div>
      </div>
    </div>
  );
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { survey, isLoading, error } = useSurvey(id);

  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header showBackLink />

      {isLoading ? (
        <p className="text-muted-foreground px-4 py-6 text-sm sm:px-8">
          読み込み中...
        </p>
      ) : error ? (
        <p className="text-destructive px-4 py-6 text-sm sm:px-8">{error}</p>
      ) : !survey ? (
        <p className="text-muted-foreground px-4 py-6 text-sm sm:px-8">
          募集が見つかりませんでした
        </p>
      ) : (
        <SurveyDetail survey={survey} />
      )}
    </div>
  );
}
