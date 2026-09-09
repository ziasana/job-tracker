import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, formatSource } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#1C2230", fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6B6A63", marginBottom: 18 },
  tallyRow: { flexDirection: "row", marginBottom: 18, gap: 16 },
  tallyItem: { fontSize: 10 },
  tallyNumber: { fontSize: 14 },
  sectionTitle: { fontSize: 12, marginBottom: 8, marginTop: 12 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#DCD8CC",
    paddingVertical: 5,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1C2230",
    paddingBottom: 5,
    marginBottom: 2,
  },
  colDate: { width: "12%" },
  colCompany: { width: "23%" },
  colTitle: { width: "27%" },
  colSource: { width: "16%" },
  colStatus: { width: "14%" },
  headerCell: { fontSize: 9, color: "#6B6A63" },
  sourceLink: { color: "#1877F2", textDecoration: "none" },
});

function ReportDocument({
  from,
  to,
  jobs,
  byStatus,
  responseRate,
}: {
  from: string;
  to: string;
  jobs: any[];
  byStatus: Record<string, number>;
  responseRate: number;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Job search report</Text>
        <Text style={styles.subtitle}>
          {from} to {to}
        </Text>

        <View style={styles.tallyRow}>
          <View style={styles.tallyItem}>
            <Text style={styles.tallyNumber}>{jobs.length}</Text>
            <Text>applications</Text>
          </View>
          <View style={styles.tallyItem}>
            <Text style={styles.tallyNumber}>{byStatus.INTERVIEW ?? 0}</Text>
            <Text>interviews</Text>
          </View>
          <View style={styles.tallyItem}>
            <Text style={styles.tallyNumber}>{byStatus.OFFER ?? 0}</Text>
            <Text>offers</Text>
          </View>
          <View style={styles.tallyItem}>
            <Text style={styles.tallyNumber}>{responseRate}%</Text>
            <Text>advanced past applied</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Applications</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.colDate, styles.headerCell]}>Date</Text>
          <Text style={[styles.colCompany, styles.headerCell]}>Company</Text>
          <Text style={[styles.colTitle, styles.headerCell]}>Title</Text>
          <Text style={[styles.colSource, styles.headerCell]}>Source</Text>
          <Text style={[styles.colStatus, styles.headerCell]}>Status</Text>
        </View>
        {jobs.map((job) => (
          <View style={styles.row} key={job.id}>
            <Text style={styles.colDate}>
              {new Date(job.dateApplied).toISOString().slice(0, 10)}
            </Text>
            <Text style={styles.colCompany}>{job.company}</Text>
            <Text style={styles.colTitle}>{job.title}</Text>
            <View style={styles.colSource}>
              {/^https?:\/\//i.test(job.source) ? (
                <Link src={job.source} style={styles.sourceLink}>
                  {formatSource(job.source)}
                </Link>
              ) : (
                <Text>{job.source}</Text>
              )}
            </View>
            <Text style={styles.colStatus}>
              {STATUS_LABELS[job.status as keyof typeof STATUS_LABELS] ?? job.status}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

// GET /api/reports/pdf?from=2026-09-01&to=2026-09-30
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
  for (const job of jobs) byStatus[job.status] = (byStatus[job.status] ?? 0) + 1;
  const advanced = jobs.filter((j) =>
    ["PHONE_SCREEN", "INTERVIEW", "OFFER"].includes(j.status)
  ).length;
  const responseRate = jobs.length > 0 ? Math.round((advanced / jobs.length) * 100) : 0;

  const buffer = await renderToBuffer(
    <ReportDocument from={from} to={to} jobs={jobs} byStatus={byStatus} responseRate={responseRate} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="job-report-${from}-to-${to}.pdf"`,
    },
  });
}
