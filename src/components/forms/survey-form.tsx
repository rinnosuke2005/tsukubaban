"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const contactError = validateContact(survey);
  if (contactError) {
    errors.contactValue = contactError;
  }

  return errors;
}

export function SurveyForm() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [errors, setErrors] = useState<SurveyErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requirementInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingFocusRequirementIndex = useRef<number | null>(null);

  useEffect(() => {
    const index = pendingFocusRequirementIndex.current;
    if (index === null) return;

    requirementInputRefs.current[index]?.focus();
    pendingFocusRequirementIndex.current = null;
  }, [survey.requirements.length]);

  const contactField = CONTACT_FIELD[survey.contactType];

  function changeContactType(contactType: ContactType) {
    if (contactType === survey.contactType) return;
    setSurvey({ ...survey, contactType, contactValue: "" });
    setErrors((prev) => ({ ...prev, contactValue: undefined }));
  }

  function addRequirement() {
    pendingFocusRequirementIndex.current = survey.requirements.length;
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

  function handleRequirementKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (
      event.nativeEvent.isComposing ||
      (event.key !== "Enter" && event.key !== "NumpadEnter")
    ) {
      return;
    }

    event.preventDefault();

    if (!survey.requirements[index].trim()) return;

    const nextInput = requirementInputRefs.current[index + 1];
    if (nextInput) {
      nextInput.focus();
      return;
    }

    addRequirement();
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
      await createSurvey({
        ...survey,
        contactValue: survey.contactValue.trim(),
        description: survey.description.trim(),
        requirements: trimmedRequirements,
      });
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

          <Field>
            <FieldLabel htmlFor="survey-description">
              アンケートの概要
            </FieldLabel>
            <Textarea
              id="survey-description"
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder={
                "例）卒業論文の調査として、学習習慣と睡眠時間の関係を調べています。\n所要時間：約5分\n回答期間：11月15日まで"
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

          <Field>
            <FieldLabel>募集要項（応募条件）</FieldLabel>
            <div className="flex flex-col gap-2">
              {survey.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    ref={(element) => {
                      requirementInputRefs.current[index] = element;
                    }}
                    type="text"
                    placeholder="例）大学生であること"
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    onKeyDown={(event) =>
                      handleRequirementKeyDown(event, index)
                    }
                  />
                  {survey.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      削除
                    </Button>
                  )}
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
            <FieldDescription>
              条件を入力してEnterキーを押すと、次の入力欄を追加できます
            </FieldDescription>
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
