import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { mockSurveys } from "@/lib/mock/surveys";

export default function Home() {
  return (
    <div className="text-foreground min-h-screen bg-white">
      <Header />

      <main className="flex justify-center p-6">
        {mockSurveys.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだ募集はありません</p>
        ) : (
          <ul className="flex w-full max-w-xl flex-col">
            {mockSurveys.map((survey, index) => (
              <li key={survey.url}>
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
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
