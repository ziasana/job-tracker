"use client";

import { useState } from "react";
import { STATUSES, STATUS_LABELS } from "@/lib/types";

export default function JobForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    source: "",
    dateApplied: new Date().toISOString().slice(0, 10),
    status: "APPLIED",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setForm({
        title: "",
        company: "",
        source: "",
        dateApplied: new Date().toISOString().slice(0, 10),
        status: "APPLIED",
        notes: "",
      });
      setOpen(false);
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-fb border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-fb focus:bg-white focus:ring-1 focus:ring-fb";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 w-full rounded-fb bg-card px-4 py-2.5 text-left text-sm font-medium text-muted shadow-sm hover:bg-hairline/30"
      >
        + Log a new application
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded-fb bg-card p-4 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Job title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Company"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Source (LinkedIn, Indeed...)"
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
          className={inputClass}
        />
        <input
          required
          type="date"
          value={form.dateApplied}
          onChange={(e) => update("dateApplied", e.target.value)}
          className={inputClass}
        />
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => update("notes", e.target.value)}
        rows={2}
        className={`w-full ${inputClass}`}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-fb bg-fb px-4 py-2 text-sm font-semibold text-white hover:bg-fb-hover disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-fb px-4 py-2 text-sm font-semibold text-muted hover:bg-hairline/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
