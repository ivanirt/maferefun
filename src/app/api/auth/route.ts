import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSession, createSession, getSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action as string;

  if (action === "logout") {
    await clearSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "me") {
    return NextResponse.json({ user: await getSession() });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Correo y contraseña son necesarios." }, { status: 400 });
  }

  if (action === "register") {
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "El nombre es necesario." }, { status: 400 });
    const existing = await prisma.devotee.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Ese correo ya tiene cuenta." }, { status: 409 });
    const devotee = await prisma.devotee.create({
      data: { email, name, passwordHash: await hashPassword(password) },
    });
    await createSession({ id: devotee.id, email: devotee.email, name: devotee.name });
    return NextResponse.json({ ok: true });
  }

  const devotee = await prisma.devotee.findUnique({ where: { email } });
  if (!devotee || !(await verifyPassword(password, devotee.passwordHash))) {
    return NextResponse.json({ error: "Correo o contraseña no coinciden." }, { status: 401 });
  }
  await createSession({ id: devotee.id, email: devotee.email, name: devotee.name });
  return NextResponse.json({ ok: true });
}
