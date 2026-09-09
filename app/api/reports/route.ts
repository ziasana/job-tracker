import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports?from=2026-09-01&to=2026-09-30
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required (YYYY-MM-DD)" }, { status: 400 });
  }

  const jobs = await prisma.job.findMany({
    where: { dateApplied: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { dateApplied: "asc" },
  });

  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  for (const job of jobs) {
    byStatus[job.status] = (byStatus[job.status] ?? 0) + 1;
    bySource[job.source] = (bySource[job.source] ?? 0) + 1;
  }

  const total = jobs.length;
  const advanced = jobs.filter((j) =>
    ["PHONE_SCREEN", "INTERVIEW", "OFFER"].includes(j.status)
  ).length;
  const responseRate = total > 0 ? Math.round((advanced / total) * 100) : 0;

  return NextResponse.json({
    range: { from, to },
    total,
    byStatus,
    bySource,
    responseRate,
    jobs,
  });
}
