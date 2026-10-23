"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequirementFields } from "@/components/forms/requirement-fields";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSurvey } from "@/lib/api/surveys";
import {
  CONTACT_TYPE_LABELS,
  type ContactType,
  type Survey,
} from "@/lib/types/survey";

const DESCRIPTION_MAX_LENGTH = 700;
const REWARD_DETAIL_MAX_LENGTH = 100;
const ESTIMATED_MINUTES_MAX = 999;

const REWARD_OPTIONS = [
  { value: true, label: "あり" },
  { value: false, label: "なし" },
];

const CONTACT_TYPES: ContactType[] = ["url", "email", "phone"];

const CONTACT_FIELD: Record<
  ContactType,
  {
    label: string;
    inputType: "url" | "email" | "tel";
    placeholder: string;
    notice?: string;
  }
> = {
  url: {
    label: "アンケートのURL",
    inputType: "url",
    placeholder: "https://...",
  },
  email: {
    label: "回答の送付先メールアドレス",
    inputType: "email",
    placeholder: "例）example@u.tsukuba.ac.jp",
    notice: "入力したアドレスは詳細ページで全員に公開されます",
  },
  phone: {
    label: "連絡先の電話番号",
    inputType: "tel",
    placeholder: "例）090-1234-5678",
    notice: "入力した番号は詳細ページで全員に公開されます。",
  },
};

const initialSurvey: Survey = {
  title: "",
  recruiterName: "",
  affiliation: "",
  contactType: "url",
  contactValue: "",
  description: "",
  requirements: [""],
  preferredRequirements: [""],
  hasReward: null,
  rewardDetail: "",
  estimatedMinutes: null,
};

type SurveyErrors = Partial<Record<keyof Survey, string>>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+$/;

function isValidUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function validateContact(survey: Survey): string | undefined {
  const value = survey.contactValue.trim();
  const { label } = CONTACT_FIELD[survey.contactType];

  if (!value) return `${label}を入力してください`;
  if (survey.contactType === "url" && !isValidUrl(value)) {
    return "有効なURLの形式で入力してください";
  }
  if (survey.contactType === "email" && !EMAIL_PATTERN.test(value)) {
    return "有効なメールアドレスの形式で入力してください";
  }
}

function parseEstimatedMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const minutes = Number(trimmed);
  return minutes >= 1 && minutes <= ESTIMATED_MINUTES_MAX ? minutes : null;
}

function validateSurvey(
  survey: Survey,
  estimatedMinutesInput: string,
): SurveyErrors {
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
  const contactError = validateContact(survey);
  if (contactError) {
    errors.contactValue = contactError;
  }
  if (survey.hasReward === null) {
    errors.hasReward = "謝礼の有無を選択してください";
  }
  if (parseEstimatedMinutes(estimatedMinutesInput) === null) {
    errors.estimatedMinutes = `所要時間を1〜${ESTIMATED_MINUTES_MAX}の整数（分）で入力してください`;
  }

  return errors;
}

export function SurveyForm() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  // number 入力は入力途中の空文字や未確定値を扱うため、文字列のまま保持して送信時に変換する
  const [estimatedMinutesInput, setEstimatedMinutesInput] = useState("");
  const [errors, setErrors] = useState<SurveyErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contactField = CONTACT_FIELD[survey.contactType];

  function changeContactType(contactType: ContactType) {
    if (contactType === survey.contactType) return;
    setSurvey({ ...survey, contactType, contactValue: "" });
    setErrors((prev) => ({ ...prev, contactValue: undefined }));
  }

  function changeHasReward(hasReward: boolean) {
    if (hasReward === survey.hasReward) return;
    setSurvey({
      ...survey,
      hasReward,
      rewardDetail: hasReward ? survey.rewardDetail : "",
    });
    setErrors((prev) => ({ ...prev, hasReward: undefined }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateSurvey(survey, estimatedMinutesInput);
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
      await createSurvey({
        ...survey,
        contactValue: survey.contactValue.trim(),
        description: survey.description.trim(),
        rewardDetail: survey.rewardDetail.trim(),
        estimatedMinutes: parseEstimatedMinutes(estimatedMinutesInput),
        requirements: trimmedRequirements,
        preferredRequirements: survey.preferredRequirements
          .map((r) => r.trim())
          .filter((r) => r !== ""),
      });
      setSurvey(initialSurvey);
      setEstimatedMinutesInput("");
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

          <Field data-invalid={!!errors.contactValue}>
            <FieldLabel id="survey-contact-type-label">
              回答方法<span className="text-destructive">*</span>
            </FieldLabel>
            <div
              role="group"
              aria-labelledby="survey-contact-type-label"
              className="border-input grid grid-cols-3 overflow-hidden rounded-lg border"
            >
              {CONTACT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={survey.contactType === type}
                  onClick={() => changeContactType(type)}
                  className="text-muted-foreground border-input py-2 text-sm not-first:border-l aria-pressed:bg-purple-50 aria-pressed:font-bold aria-pressed:text-purple-700"
                >
                  {CONTACT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <Input
              id="survey-contact-value"
              type={contactField.inputType}
              aria-label={contactField.label}
              placeholder={contactField.placeholder}
              value={survey.contactValue}
              onChange={(e) =>
                setSurvey({ ...survey, contactValue: e.target.value })
              }
              aria-invalid={!!errors.contactValue}
            />
            <FieldError>{errors.contactValue}</FieldError>
            {contactField.notice && (
              <FieldDescription>{contactField.notice}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.hasReward}>
            <FieldLabel id="survey-has-reward-label">
              謝礼<span className="text-destructive">*</span>
            </FieldLabel>
            <div
              role="group"
              aria-labelledby="survey-has-reward-label"
              className="border-input grid grid-cols-2 overflow-hidden rounded-lg border"
            >
              {REWARD_OPTIONS.map(({ value, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={survey.hasReward === value}
                  onClick={() => changeHasReward(value)}
                  className="text-muted-foreground border-input py-2 text-sm not-first:border-l aria-pressed:bg-purple-50 aria-pressed:font-bold aria-pressed:text-purple-700"
                >
                  {label}
                </button>
              ))}
            </div>
            {survey.hasReward && (
              <Input
                id="survey-reward-detail"
                type="text"
                aria-label="謝礼の内容"
                maxLength={REWARD_DETAIL_MAX_LENGTH}
                placeholder="例）図書カード500円"
                value={survey.rewardDetail}
                onChange={(e) =>
                  setSurvey({ ...survey, rewardDetail: e.target.value })
                }
              />
            )}
            <FieldError>{errors.hasReward}</FieldError>
          </Field>

          <Field data-invalid={!!errors.estimatedMinutes}>
            <FieldLabel htmlFor="survey-estimated-minutes">
              所要時間（分）<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="survey-estimated-minutes"
              type="number"
              inputMode="numeric"
              min={1}
              max={ESTIMATED_MINUTES_MAX}
              placeholder="例）5"
              value={estimatedMinutesInput}
              onChange={(e) => setEstimatedMinutesInput(e.target.value)}
              aria-invalid={!!errors.estimatedMinutes}
            />
            <FieldError>{errors.estimatedMinutes}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="survey-description">
              アンケートの概要
            </FieldLabel>
            <Textarea
              id="survey-description"
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder={
                "例）卒業論文の調査として、学習習慣と睡眠時間の関係を調べています。\n回答期間：11月15日まで"
              }
              value={survey.description}
              onChange={(e) =>
                setSurvey({ ...survey, description: e.target.value })
              }
            />
            <FieldDescription className="text-right tabular-nums">
              {survey.description.length} / {DESCRIPTION_MAX_LENGTH}
            </FieldDescription>
          </Field>

          <RequirementFields
            id="survey-requirements"
            label="必須条件"
            description="参加に必要な条件です。一覧には先頭3件を表示し、残りはポップアップで確認できます。条件がなければ空欄にしてください。"
            placeholder="例）大学生であること"
            values={survey.requirements}
            onChange={(requirements) => setSurvey({ ...survey, requirements })}
          />
          <RequirementFields
            id="survey-preferred-requirements"
            label="歓迎条件"
            description="満たしていなくても参加できる条件です。条件がなければ空欄にしてください。"
            placeholder="例）留学経験がある方歓迎"
            values={survey.preferredRequirements}
            onChange={(preferredRequirements) =>
              setSurvey({ ...survey, preferredRequirements })
            }
          />

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
