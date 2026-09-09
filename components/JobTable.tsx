"use client";

import { useState } from "react";
import { JobRecord, STATUSES, STATUS_LABELS, formatSource } from "@/lib/types";

type EditForm = {
  title: string;
  company: string;
  source: string;
  dateApplied: string;
  status: string;
};

export default function JobTable({
  jobs,
  onChanged,
}: {
  jobs: JobRecord[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  function startEdit(job: JobRecord) {
    setEditingId(job.id);
    setEditForm({
      title: job.title,
      company: job.company,
      source: job.source,
      dateApplied: new Date(job.dateApplied).toISOString().slice(0, 10),
      status: job.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function updateEditField(field: keyof EditForm, value: string) {
    setEditForm((f) => (f ? { ...f, [field]: value } : f));
  }

  async function saveEdit(id: string) {
    if (!editForm) return;
    setSaving(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      setEditForm(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChanged();
  }

  async function remove(id: string) {
    setRemoving(true);
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      setDeletingId(null);
      onChanged();
    } finally {
      setRemoving(false);
    }
  }

  if (jobs.length === 0) {
    return (
      <p className="rounded-fb bg-card p-6 text-center text-sm text-muted shadow-sm">
        Nothing matches. Add your first application above, or adjust your filters.
      </p>
    );
  }

  const editInputClass =
    "w-full rounded-fb border border-hairline bg-paper px-2 py-1 text-sm outline-none focus:border-fb focus:ring-1 focus:ring-fb";

  return (
    <div className="overflow-hidden rounded-fb bg-card text-sm shadow-sm">
      <div className="flex border-b border-hairline px-4 py-2.5 text-xs font-semibold text-muted">
        <div className="w-24">Date</div>
        <div className="flex-1">Company</div>
        <div className="flex-1">Title</div>
        <div className="w-28">Source</div>
        <div className="w-36">Status</div>
        <div className="w-16"></div>
      </div>
      {jobs.map((job) =>
        deletingId === job.id ? (
          <div
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-negative/5 px-4 py-2.5 last:border-b-0"
          >
            <span>
              Delete <span className="font-medium">{job.company} — {job.title}</span> from your log? This can't be undone.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => remove(job.id)}
                disabled={removing}
                className="rounded-fb bg-negative px-3 py-1 text-xs font-semibold text-white hover:bg-negative/90 disabled:opacity-50"
              >
                {removing ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-fb px-3 py-1 text-xs font-semibold text-muted hover:bg-hairline/30"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : editingId === job.id && editForm ? (
          <div
            key={job.id}
            className="flex flex-wrap items-center gap-2 border-b border-hairline bg-fb-light/30 px-4 py-2.5 last:border-b-0"
          >
            <input
              type="date"
              value={editForm.dateApplied}
              onChange={(e) => updateEditField("dateApplied", e.target.value)}
              className={`${editInputClass} w-24`}
            />
            <input
              value={editForm.company}
              onChange={(e) => updateEditField("company", e.target.value)}
              placeholder="Company"
              className={`${editInputClass} flex-1`}
            />
            <input
              value={editForm.title}
              onChange={(e) => updateEditField("title", e.target.value)}
              placeholder="Title"
              className={`${editInputClass} flex-1`}
            />
            <input
              value={editForm.source}
              onChange={(e) => updateEditField("source", e.target.value)}
              placeholder="Source"
              className={`${editInputClass} w-28`}
            />
            <select
              value={editForm.status}
              onChange={(e) => updateEditField("status", e.target.value)}
              className={`${editInputClass} w-36`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <div className="flex w-full justify-end gap-2 sm:w-auto">
              <button
                onClick={() => saveEdit(job.id)}
                disabled={saving}
                className="rounded-fb bg-fb px-3 py-1 text-xs font-semibold text-white hover:bg-fb-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-fb px-3 py-1 text-xs font-semibold text-muted hover:bg-hairline/30"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            key={job.id}
            className="flex items-center border-b border-hairline px-4 py-2.5 last:border-b-0 hover:bg-fb-light/40"
          >
            <div className="tabular w-24 text-muted">
              {new Date(job.dateApplied).toISOString().slice(0, 10)}
            </div>
            <div className="flex-1 font-medium">{job.company}</div>
            <div className="flex-1 text-muted">{job.title}</div>
            <div className="w-28 truncate" title={job.source}>
              {/^https?:\/\//i.test(job.source) ? (
                <a
                  href={job.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fb hover:underline"
                >
                  {formatSource(job.source)}
                </a>
              ) : (
                <span className="text-muted">{job.source}</span>
              )}
            </div>
            <div className="w-36">
              <select
                value={job.status}
                onChange={(e) => updateStatus(job.id, e.target.value)}
                className="w-full rounded-full border border-hairline bg-paper px-2 py-1 text-xs font-medium outline-none focus:border-fb"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-16 justify-end gap-2">
              <button
                onClick={() => startEdit(job)}
                className="text-muted hover:text-fb"
                aria-label="Edit"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingId(job.id)}
                className="text-muted hover:text-negative"
                aria-label="Delete"
              >
                ×
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
