"use client";

import { useEffect, useMemo, useState } from "react";
import JobTable from "@/components/JobTable";
import { JobRecord, STATUSES, STATUS_LABELS } from "@/lib/types";

const PAGE_SIZE = 10;

function isoWeeksAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Reports() {
  const [from, setFrom] = useState(isoWeeksAgo(7));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  async function runReport() {
    setLoading(true);
    const res = await fetch(`/api/reports?from=${from}&to=${to}`);
    setReport(await res.json());
    setLoading(false);
  }

  function setPreset(days: number) {
    setFrom(isoWeeksAgo(days));
    setTo(new Date().toISOString().slice(0, 10));
  }

  useEffect(() => {
    setPage(1);
  }, [titleFilter, statusFilter, report]);

  const reportJobs: JobRecord[] = report?.jobs ?? [];

  const filteredJobs = useMemo(() => {
    return reportJobs.filter((j) => {
      if (titleFilter && !j.title.toLowerCase().includes(titleFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter && j.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [reportJobs, titleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilters = titleFilter || statusFilter;
  const filterInputClass =
    "rounded-fb border border-hairline bg-card px-3 py-1.5 text-sm outline-none focus:border-fb focus:ring-1 focus:ring-fb";

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-fb bg-card p-4 text-sm shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-fb border border-hairline bg-paper px-2 py-1.5 outline-none focus:border-fb focus:ring-1 focus:ring-fb"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-fb border border-hairline bg-paper px-2 py-1.5 outline-none focus:border-fb focus:ring-1 focus:ring-fb"
          />
        </div>
        <button
          onClick={() => setPreset(7)}
          className="rounded-fb px-2 py-1.5 text-muted hover:bg-fb-light hover:text-fb"
        >
          Last week
        </button>
        <button
          onClick={() => setPreset(30)}
          className="rounded-fb px-2 py-1.5 text-muted hover:bg-fb-light hover:text-fb"
        >
          Last month
        </button>
        <button
          onClick={runReport}
          className="ml-auto rounded-fb bg-fb px-4 py-1.5 font-semibold text-white hover:bg-fb-hover"
        >
          {loading ? "Running..." : "Run report"}
        </button>
      </div>

      {report && (
        <div>
          <p className="mb-6 tabular text-sm text-muted">
            {report.total} applications · {report.responseRate}% advanced past applied
          </p>

          <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
            <div className="rounded-fb bg-card p-4 shadow-sm">
              <h2 className="mb-2 text-xs font-semibold text-muted">By status</h2>
              {Object.entries(report.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between border-b border-hairline py-1 last:border-b-0">
                  <span>{STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}</span>
                  <span className="tabular">{count as number}</span>
                </div>
              ))}
            </div>
            <div className="rounded-fb bg-card p-4 shadow-sm">
              <h2 className="mb-2 text-xs font-semibold text-muted">By source</h2>
              {Object.entries(report.bySource).map(([source, count]) => (
                <div key={source} className="flex justify-between border-b border-hairline py-1 last:border-b-0">
                  <span className="truncate pr-2">{source}</span>
                  <span className="tabular">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href={`/api/reports/pdf?from=${from}&to=${to}`}
            className="mb-6 inline-block rounded-fb bg-fb px-4 py-1.5 text-sm font-semibold text-white hover:bg-fb-hover"
          >
            Download PDF
          </a>

          <div className="mb-4 mt-6 flex flex-wrap items-center gap-2">
            <input
              placeholder="Filter by title"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className={`${filterInputClass} min-w-[160px] flex-1`}
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
            {hasFilters && (
              <button
                onClick={() => {
                  setTitleFilter("");
                  setStatusFilter("");
                }}
                className="rounded-fb px-3 py-1.5 text-sm font-medium text-fb hover:bg-fb-light"
              >
                Clear
              </button>
            )}
          </div>

          <JobTable jobs={pagedJobs} onChanged={runReport} />

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
        </div>
      )}
    </main>
  );
}
