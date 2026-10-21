import { BackLink } from "@/components/back-link";
import { Header } from "@/components/header";
import { SurveyForm } from "@/components/forms/survey-form";

export default function NewSurveyPage() {
  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header showCreateButton={false} />

      <main className="flex flex-col items-center px-6 pt-2 pb-6">
        <div className="flex w-full max-w-md flex-col gap-2">
          <div>
            <BackLink />
          </div>
          <SurveyForm />
        </div>
      </main>
    </div>
  );
}
