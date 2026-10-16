export type ContactType = "url" | "email" | "phone";

export type Survey = {
  id?: string;
  title: string;
  recruiterName: string;
  affiliation: string;
  contactType: ContactType;
  contactValue: string;
  description: string;
  requirements: string[];
  createdAt?: string;
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  url: "Web回答",
  email: "メール回答",
  phone: "電話回答",
};
