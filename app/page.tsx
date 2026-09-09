"use client";

import { useEffect, useMemo, useState } from "react";
import JobForm from "@/components/JobForm";
import JobTable from "@/components/JobTable";
import { JobRecord, STATUSES, STATUS_LABELS } from "@/lib/types";

const PAGE_SIZE = 10;

export default function Home() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/jobs");
    setJobs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [titleFilter, statusFilter, dateFilter]);

  const interviewing = jobs.filter((j) => j.status === "INTERVIEW").length;
  const offers = jobs.filter((j) => j.status === "OFFER").length;
  const dueFollowUp = jobs.filter(
    (j) => j.followUpDate && new Date(j.followUpDate) <= new Date()
  ).length;

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (titleFilter && !j.title.toLowerCase().includes(titleFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter && j.status !== statusFilter) {
        return false;
      }
      if (dateFilter && new Date(j.dateApplied).toISOString().slice(0, 10) !== dateFilter) {
        return false;
      }
      return true;
    });
  }, [jobs, titleFilter, statusFilter, dateFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilters = titleFilter || statusFilter || dateFilter;
  const filterInputClass =
    "rounded-fb border border-hairline bg-card px-3 py-1.5 text-sm outline-none focus:border-fb focus:ring-1 focus:ring-fb";

  return (
    <main>
      <p className="mb-4 tabular text-sm text-muted">
        {jobs.length} applied · {interviewing} interviewing · {offers} offer
        {offers === 1 ? "" : "s"}
        {dueFollowUp > 0 && <span className="text-pending"> · {dueFollowUp} need follow-up</span>}
      </p>

      <JobForm onAdded={load} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className={`${filterInputClass} flex-1 min-w-[160px]`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={filterInputClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={filterInputClass}
        />
        {hasFilters && (
          <button
            onClick={() => {
              setTitleFilter("");
              setStatusFilter("");
              setDateFilter("");
            }}
            className="rounded-fb px-3 py-1.5 text-sm font-medium text-fb hover:bg-fb-light"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : (
        <>
          <JobTable jobs={pagedJobs} onChanged={load} />

          {filteredJobs.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">
                Page {currentPage} of {pageCount} · {filteredJobs.length} result
                {filteredJobs.length === 1 ? "" : "s"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-fb border border-hairline bg-card px-3 py-1.5 font-medium hover:bg-fb-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="rounded-fb border border-hairline bg-card px-3 py-1.5 font-medium hover:bg-fb-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
