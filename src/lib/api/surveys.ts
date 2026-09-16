import { supabase } from "@/lib/supabase/client";
import type { Survey } from "@/lib/types/survey";

type SurveyRow = {
  id: string;
  title: string;
  recruiter_name: string;
  affiliation: string;
  url: string;
  created_at: string;
};

function toSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    recruiterName: row.recruiter_name,
    affiliation: row.affiliation,
    url: row.url,
    createdAt: row.created_at,
  };
}

export async function fetchSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase.rpc("get_surveys");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SurveyRow[]).map(toSurvey);
}
