import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RequirementFields({
  id,
  label,
  description,
  placeholder,
  values,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingFocusIndex = useRef<number | null>(null);

  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null) return;
    inputRefs.current[index]?.focus();
    pendingFocusIndex.current = null;
  }, [values.length]);

  function addRequirement() {
    pendingFocusIndex.current = values.length;
    onChange([...values, ""]);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (
      event.nativeEvent.isComposing ||
      (event.key !== "Enter" && event.key !== "NumpadEnter")
    )
      return;
    event.preventDefault();
    if (!values[index].trim()) return;
    const nextInput = inputRefs.current[index + 1];
    if (nextInput) nextInput.focus();
    else addRequirement();
  }

  return (
    <Field>
      <FieldLabel htmlFor={`${id}-0`}>{label}</FieldLabel>
      <FieldDescription id={`${id}-description`}>
        {description}
      </FieldDescription>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <Input
              id={`${id}-${index}`}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              aria-label={`${label} ${index + 1}`}
              aria-describedby={`${id}-description`}
              placeholder={placeholder}
              value={value}
              onChange={(event) =>
                onChange(
                  values.map((item, i) =>
                    i === index ? event.target.value : item,
                  ),
                )
              }
              onKeyDown={(event) => handleKeyDown(event, index)}
            />
            {values.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`${label} ${index + 1}を削除`}
                onClick={() => {
                  pendingFocusIndex.current = Math.min(
                    index,
                    values.length - 2,
                  );
                  onChange(values.filter((_, i) => i !== index));
                }}
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
        ＋ {label}を追加
      </Button>
      <FieldDescription>
        条件を入力してEnterキーを押すと、次の入力欄を追加できます
      </FieldDescription>
    </Field>
  );
}
