import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { hourToStart, HOURS } from "@/lib/consultas";

const MODALITIES = new Set(["en_linea", "presencial", "ambas"]);

export async function GET() {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;

  const [slots, upcoming] = await Promise.all([
    prisma.consultaSlot.findMany({ orderBy: [{ weekday: "asc" }, { startTime: "asc" }] }),
    prisma.consulta.findMany({
      where: { scheduledAt: { gte: new Date() }, status: { not: "cancelada" } },
      orderBy: { scheduledAt: "asc" },
      take: 40,
    }),
  ]);
  return NextResponse.json({ slots, upcoming });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;

  const body = await request.json();
  const weekday = Number(body.weekday);
  const startTime = String(body.startTime || "").trim() || hourToStart(Number(body.hour));
  const modality = body.modality == null || body.modality === "" ? null : String(body.modality);

  if (weekday < 1 || weekday > 7 || !HOURS.some((hour) => hourToStart(hour) === startTime)) {
    return NextResponse.json({ error: "Día u hora no válidos." }, { status: 400 });
  }

  if (!modality) {
    await prisma.consultaSlot.deleteMany({ where: { weekday, startTime } });
    return NextResponse.json({ ok: true, removed: true });
  }
  if (!MODALITIES.has(modality)) {
    return NextResponse.json({ error: "Modalidad no válida." }, { status: 400 });
  }

  const slot = await prisma.consultaSlot.upsert({
    where: { weekday_startTime: { weekday, startTime } },
    update: { modality, enabled: true, durationMin: 60 },
    create: { weekday, startTime, modality, enabled: true, durationMin: 60 },
  });
  return NextResponse.json({ slot });
}
