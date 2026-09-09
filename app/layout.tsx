import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "A personal log of job applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans text-ink">
        <header className="mb-6 bg-fb shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <h1 className="text-xl font-bold text-white">Job Tracker</h1>
            <nav className="flex gap-1 text-sm font-medium text-white">
              <a href="/" className="rounded-fb px-3 py-1.5 hover:bg-white/15">
                Log
              </a>
              <a href="/reports" className="rounded-fb px-3 py-1.5 hover:bg-white/15">
                Reports
              </a>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-6 pb-10">{children}</div>
      </body>
    </html>
  );
}
