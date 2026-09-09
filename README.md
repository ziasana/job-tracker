# Job Tracker

A personal log of job applications: add jobs, track status, and export dated PDF reports.

## Stack

- Next.js 14 (App Router, TypeScript)
- PostgreSQL via [Neon](https://neon.tech)
- Prisma ORM
- `@react-pdf/renderer` for PDF export (chosen over Puppeteer — it's pure JS and works cleanly in Vercel's serverless functions, no headless Chrome needed)
- Tailwind for styling

## Local setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Neon project at https://console.neon.tech, and copy the pooled connection string.

3. Copy `.env.example` to `.env` and paste in your connection string:
   ```
   cp .env.example .env
   ```

4. Push the schema to your database (no migration files needed for a personal project — `db push` syncs the schema directly):
   ```
   npm run db:push
   ```

5. Run the dev server:
   ```
   npm run dev
   ```
   Open http://localhost:3000

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Import it in Vercel (https://vercel.com/new).
3. In the Vercel project's Environment Variables, add `DATABASE_URL` with your Neon pooled connection string.
4. Deploy. Vercel runs `npm run build`, which runs `prisma generate` via the `postinstall` script automatically.

If you add fields to the schema later, run `npm run db:push` again — it updates Neon directly without needing a migrations folder, which is fine for a single-user personal tool. If this ever needs to support multiple users or you want rollback safety, switch to `prisma migrate dev` instead.

## Extending later (job aggregator integration)

The `Job` model has a `sourceListingId` field, currently unused. When the job aggregator project is ready, its "Apply" action can write directly into this same `jobs` table (or call `POST /api/jobs`) with `sourceListingId` set to the aggregator's listing ID — no schema change needed to wire the two together.

## Structure

```
app/
  page.tsx                  Main log (add + view jobs)
  reports/page.tsx           Date-range report view
  api/jobs/route.ts          List / create jobs
  api/jobs/[id]/route.ts     Get / update / delete one job
  api/reports/route.ts       Aggregated report data (JSON)
  api/reports/pdf/route.tsx  PDF report generation
components/
  JobForm.tsx                Add-job form
  JobTable.tsx                Log table with inline status editing
  StatusBadge.tsx             Status indicator
lib/
  prisma.ts                   Prisma client singleton
  types.ts                    Shared status enums/labels
prisma/
  schema.prisma                Job + StatusHistory models
```
