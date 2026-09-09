import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs?status=INTERVIEW&from=2026-09-01&to=2026-09-30
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(from || to
        ? {
            dateApplied: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { dateApplied: "desc" },
  });

  return NextResponse.json(jobs);
}

// POST /api/jobs
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.title || !body.company || !body.source || !body.dateApplied) {
    return NextResponse.json(
      { error: "title, company, source and dateApplied are required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      title: body.title,
      company: body.company,
      source: body.source,
      sourceListingId: body.sourceListingId ?? null,
      dateApplied: new Date(body.dateApplied),
      status: body.status ?? "APPLIED",
      notes: body.notes ?? null,
      tags: body.tags ?? [],
      contactName: body.contactName ?? null,
      contactEmail: body.contactEmail ?? null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      statusHistory: {
        create: { status: body.status ?? "APPLIED", note: "Application logged" },
      },
    },
  });

  return NextResponse.json(job, { status: 201 });
}
