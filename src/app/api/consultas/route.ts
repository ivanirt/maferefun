import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const whatsapp = String(body.whatsapp || "").trim();
  const kind = String(body.kind || "").trim();
  if (!name || !email || !whatsapp || !kind) {
    return NextResponse.json({ error: "Completa nombre, correo, WhatsApp y tipo." }, { status: 400 });
  }

  const session = await getSession();
  const consulta = await prisma.consulta.create({
    data: {
      devoteeId: session?.id,
      name,
      email,
      whatsapp,
      kind,
      message: body.message ? String(body.message) : null,
    },
  });

  return NextResponse.json({ id: consulta.id });
}
