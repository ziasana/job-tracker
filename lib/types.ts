export const STATUSES = [
  "APPLIED",
  "PHONE_SCREEN",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type JobStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<JobStatus, string> = {
  APPLIED: "Applied",
  PHONE_SCREEN: "Phone screen",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

// Used for the small status dot in the table and PDF report.
export const STATUS_TONE: Record<JobStatus, "positive" | "pending" | "negative" | "neutral"> = {
  APPLIED: "neutral",
  PHONE_SCREEN: "pending",
  INTERVIEW: "pending",
  OFFER: "positive",
  REJECTED: "negative",
  WITHDRAWN: "negative",
};

// Job boards are often logged as a full listing URL; show a short host label instead.
export function formatSource(source: string): string {
  if (!/^https?:\/\//i.test(source)) return source;
  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return source;
  }
}

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  source: string;
  sourceListingId: string | null;
  dateApplied: string; // ISO date
  status: JobStatus;
  notes: string | null;
  tags: string[];
  contactName: string | null;
  contactEmail: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}
