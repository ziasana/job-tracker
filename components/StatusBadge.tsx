import { JobStatus, STATUS_LABELS, STATUS_TONE } from "@/lib/types";

const DOT_COLOR: Record<string, string> = {
  positive: "bg-positive",
  pending: "bg-pending",
  negative: "bg-negative",
  neutral: "bg-muted",
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[tone]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
