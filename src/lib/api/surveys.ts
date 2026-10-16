import { supabase } from "@/lib/supabase/client";
import type { ContactType, Survey } from "@/lib/types/survey";

type SurveyRow = {
  id: string;
  title: string;
  recruiter_name: string;
  affiliation: string;
  contact_type: ContactType;
  contact_value: string;
  description: string;
  requirements: string[];
  created_at: string;
};

function toSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    recruiterName: row.recruiter_name,
    affiliation: row.affiliation,
    contactType: row.contact_type,
    contactValue: row.contact_value,
    description: row.description ?? "",
    requirements: row.requirements ?? [],
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

export async function fetchSurvey(id: string): Promise<Survey | null> {
  const { data, error } = await supabase.rpc("get_survey", { p_id: id });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SurveyRow[];
  return rows.length > 0 ? toSurvey(rows[0]) : null;
}

export async function createSurvey(
  survey: Pick<
    Survey,
    | "title"
    | "recruiterName"
    | "affiliation"
    | "contactType"
    | "contactValue"
    | "description"
    | "requirements"
  >,
): Promise<Survey> {
  const { data, error } = await supabase.rpc("create_survey", {
    p_title: survey.title,
    p_recruiter_name: survey.recruiterName,
    p_affiliation: survey.affiliation,
    p_contact_type: survey.contactType,
    p_contact_value: survey.contactValue,
    p_description: survey.description,
    p_requirements: survey.requirements,
  });

  if (error) {
    throw new Error(error.message);
  }

  return toSurvey(data as SurveyRow);
}
