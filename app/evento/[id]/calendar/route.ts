import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function icsDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function addDay(d: Date): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || !event.startDate) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const url = `${baseUrl}/evento/${id}`;

  const dtStart = icsDate(event.startDate);
  const dtEnd = icsDate(event.endDate ? addDay(event.endDate) : addDay(event.startDate));

  const descParts = [`Costo totale: €${event.totalCost.toFixed(2)}`];
  if (event.paymentInfo) descParts.push(event.paymentInfo);
  descParts.push(url);
  const description = escapeIcs(descParts.join("\n"));

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChesifApp//ChesifApp//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${id}@chesifapp`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcs(event.name)}`,
    `DESCRIPTION:${description}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="evento.ics"`,
    },
  });
}
