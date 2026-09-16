import { Header } from "@/components/header";
import { SurveyForm } from "@/components/forms/survey-form";

export default function NewSurveyPage() {
  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header showBackLink />

      <main className="flex justify-center p-6">
        <SurveyForm />
      </main>
    </div>
  );
}
