import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, isoWeekday, mondayOf, scheduledIso } from "@/lib/consultas";

export async function GET(request: Request) {
  const weekParam = new URL(request.url).searchParams.get("weekStart");
  const weekStart = mondayOf(weekParam || new Date().toISOString().slice(0, 10));
  const weekEnd = addDays(weekStart, 7);

  const [slots, booked] = await Promise.all([
    prisma.consultaSlot.findMany({
      where: { enabled: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.consulta.findMany({
      where: {
        scheduledAt: { gte: new Date(scheduledIso(weekStart, "00:00")), lt: new Date(scheduledIso(weekEnd, "00:00")) },
        status: { not: "cancelada" },
      },
      select: { scheduledAt: true },
    }),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return { date, weekday: isoWeekday(date) };
  });

  return NextResponse.json({
    weekStart,
    days,
    slots,
    booked: booked.map((item) => item.scheduledAt?.toISOString()).filter(Boolean),
  });
}
