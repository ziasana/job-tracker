"use client";

import { useEffect, useState } from "react";

function buildBookmarkletHref(origin: string): string {
  const code = `(function(){
    var u = new URL(${JSON.stringify("/")}, ${JSON.stringify(origin)});
    u.searchParams.set("source", window.location.href);
    u.searchParams.set("titleGuess", document.title || "");
    u.searchParams.set("notes", (window.getSelection ? window.getSelection().toString() : "") || "");
    window.open(u.toString(), "_blank");
  })();`;
  return "javascript:" + encodeURIComponent(code);
}

export default function BookmarkletPage() {
  const [href, setHref] = useState("");

  useEffect(() => {
    setHref(buildBookmarkletHref(window.location.origin));
  }, []);

  return (
    <main className="max-w-xl">
      <h2 className="mb-2 text-lg font-bold">Add Job bookmarklet</h2>
      <p className="mb-4 text-sm text-muted">
        Drag the button below to your bookmarks bar. On any job posting page,
        optionally select the description text, then click it to open Job
        Tracker with the application form pre-filled from that page.
      </p>

      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        className="inline-block cursor-grab rounded-fb bg-fb px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fb-hover"
      >
        + Add Job
      </a>

      <ol className="mt-6 list-decimal space-y-1 pl-5 text-sm text-muted">
        <li>Make sure your bookmarks bar is visible.</li>
        <li>Drag the "+ Add Job" button above onto the bookmarks bar.</li>
        <li>On a job posting page, select the job description text (optional).</li>
        <li>Click the bookmarklet — a new tab opens here with the form pre-filled.</li>
        <li>Review and fill in the company, then save.</li>
      </ol>
    </main>
  );
}
