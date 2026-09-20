import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isPastSlot, MODALITIES, slotAllowsModality } from "@/lib/consultas";
import { isValidEmail, isValidPhone } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const whatsapp = String(body.whatsapp || "").trim();
  const kind = String(body.kind || "").trim();
  const modality = String(body.modality || "").trim();
  const date = String(body.date || "").trim();
  const startTime = String(body.startTime || "").trim();

  if (!name || !whatsapp) {
    return NextResponse.json({ error: "El nombre y el WhatsApp son necesarios." }, { status: 400 });
  }
  if (!isValidPhone(whatsapp)) {
    return NextResponse.json({ error: "El WhatsApp no parece un teléfono válido." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "El correo es necesario." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "El correo no es válido." }, { status: 400 });
  }
  if (!kind) {
    return NextResponse.json({ error: "Elige el tipo de consulta." }, { status: 400 });
  }
  if (!MODALITIES.some((item) => item.id === modality)) {
    return NextResponse.json({ error: "Elige si la consulta es en línea o presencial." }, { status: 400 });
  }
  if (!date || !startTime) {
    return NextResponse.json({ error: "Elige fecha y hora en el calendario." }, { status: 400 });
  }
  if (isPastSlot(date, startTime)) {
    return NextResponse.json({ error: "Esa hora ya pasó. Elige otra." }, { status: 400 });
  }

  const weekday = (() => {
    const [y, m, d] = date.split("-").map(Number);
    const jsDay = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
    return jsDay === 0 ? 7 : jsDay;
  })();

  const slot = await prisma.consultaSlot.findUnique({
    where: { weekday_startTime: { weekday, startTime } },
  });
  if (!slot || !slot.enabled || !slotAllowsModality(slot.modality, modality)) {
    return NextResponse.json({ error: "Esa hora no está abierta para esa modalidad." }, { status: 400 });
  }

  const scheduledAt = new Date(`${date}T${startTime}:00-06:00`);
  const taken = await prisma.consulta.findFirst({
    where: { scheduledAt, status: { not: "cancelada" } },
  });
  if (taken) {
    return NextResponse.json({ error: "Esa hora ya está tomada. Elige otra." }, { status: 409 });
  }

  const session = await getSession();
  const consulta = await prisma.consulta.create({
    data: {
      devoteeId: session?.id,
      name,
      email,
      whatsapp,
      kind,
      modality,
      scheduledAt,
      message: body.message ? String(body.message) : null,
    },
  });

  return NextResponse.json({ id: consulta.id });
}
