import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { statusHistory: { orderBy: { changedAt: "asc" } } },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existing = await prisma.job.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const statusChanged = body.status && body.status !== existing.status;

  const job = await prisma.job.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      company: body.company ?? existing.company,
      source: body.source ?? existing.source,
      sourceListingId: body.sourceListingId ?? existing.sourceListingId,
      dateApplied: body.dateApplied ? new Date(body.dateApplied) : existing.dateApplied,
      status: body.status ?? existing.status,
      notes: body.notes ?? existing.notes,
      tags: body.tags ?? existing.tags,
      contactName: body.contactName ?? existing.contactName,
      contactEmail: body.contactEmail ?? existing.contactEmail,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : existing.followUpDate,
      ...(statusChanged
        ? { statusHistory: { create: { status: body.status, note: body.statusNote ?? null } } }
        : {}),
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
