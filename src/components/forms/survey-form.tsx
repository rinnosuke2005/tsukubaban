"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSurvey } from "@/lib/api/surveys";
import type { Survey } from "@/lib/types/survey";

const initialSurvey: Survey = {
  title: "",
  recruiterName: "",
  affiliation: "",
  url: "",
  requirements: [],
};

type SurveyErrors = Partial<Record<keyof Survey, string>>;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateSurvey(survey: Survey): SurveyErrors {
  const errors: SurveyErrors = {};

  if (!survey.title.trim()) {
    errors.title = "アンケートのタイトルを入力してください";
  }
  if (!survey.recruiterName.trim()) {
    errors.recruiterName = "投稿者名を入力してください";
  }
  if (!survey.affiliation.trim()) {
    errors.affiliation = "所属を入力してください";
  }
  if (!survey.url.trim()) {
    errors.url = "アンケートのURLを入力してください";
  } else if (!isValidUrl(survey.url)) {
    errors.url = "有効なURLの形式で入力してください";
  }

  return errors;
}

export function SurveyForm() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [errors, setErrors] = useState<SurveyErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addRequirement() {
    setSurvey({ ...survey, requirements: [...survey.requirements, ""] });
  }

  function updateRequirement(index: number, value: string) {
    setSurvey({
      ...survey,
      requirements: survey.requirements.map((r, i) =>
        i === index ? value : r,
      ),
    });
  }

  function removeRequirement(index: number) {
    setSurvey({
      ...survey,
      requirements: survey.requirements.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateSurvey(survey);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const trimmedRequirements = survey.requirements
      .map((r) => r.trim())
      .filter((r) => r !== "");

    try {
      await createSurvey({ ...survey, requirements: trimmedRequirements });
      setSurvey(initialSurvey);
      router.push("/");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "アンケートの投稿に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="survey-title">
              アンケートのタイトル<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="survey-title"
              type="text"
              placeholder="例）大学生の学習習慣に関するアンケート"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              aria-invalid={!!errors.title}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.recruiterName}>
              <FieldLabel htmlFor="survey-recruiter-name">
                投稿者名<span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="survey-recruiter-name"
                type="text"
                placeholder="例）筑波 太郎"
                value={survey.recruiterName}
                onChange={(e) =>
                  setSurvey({ ...survey, recruiterName: e.target.value })
                }
                aria-invalid={!!errors.recruiterName}
              />
            </Field>

            <Field data-invalid={!!errors.affiliation}>
              <FieldLabel htmlFor="survey-affiliation">
                所属<span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="survey-affiliation"
                type="text"
                placeholder="例）筑波大学 情報学群"
                value={survey.affiliation}
                onChange={(e) =>
                  setSurvey({ ...survey, affiliation: e.target.value })
                }
                aria-invalid={!!errors.affiliation}
              />
            </Field>
          </div>

          <Field data-invalid={!!errors.url}>
            <FieldLabel htmlFor="survey-url">
              アンケートのURL<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="survey-url"
              type="url"
              placeholder="https://..."
              value={survey.url}
              onChange={(e) => setSurvey({ ...survey, url: e.target.value })}
              aria-invalid={!!errors.url}
            />
          </Field>

          <Field>
            <FieldLabel>募集要項（応募条件）</FieldLabel>
            <div className="flex flex-col gap-2">
              {survey.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="例）大学生であること"
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={addRequirement}
            >
              ＋ 条件を追加
            </Button>
          </Field>

          {submitError && (
            <p className="text-destructive text-sm">{submitError}</p>
          )}

          <Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-500 px-5 text-base text-white hover:bg-purple-600"
            >
              {isSubmitting ? "送信中..." : "送信"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
