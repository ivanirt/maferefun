import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { cardBrand, last4FromNumber } from "@/lib/account";
import { clearSession, createSession, getSession } from "@/lib/session";

function normalizeLogin(raw: string): string {
  return raw.trim().toLowerCase();
}

function emailFromLogin(login: string): string {
  return login.includes("@") ? login : `${login}@maferefun.com`;
}

function usernameFromLogin(login: string): string {
  return login.includes("@") ? login.split("@")[0] : login;
}

export async function GET() {
  return NextResponse.json({ user: await getSession() });
}

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

  const login = normalizeLogin(String(body.email || body.username || ""));
  const password = String(body.password || "");
  if (!login || !password) {
    return NextResponse.json({ error: "Usuario y contraseña son necesarios." }, { status: 400 });
  }

  if (action === "register") {
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "El nombre es necesario." }, { status: 400 });
    const email = emailFromLogin(login);
    const username = usernameFromLogin(login);
    const existing = await prisma.devotee.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) return NextResponse.json({ error: "Ese usuario o correo ya tiene cuenta." }, { status: 409 });
    const devotee = await prisma.devotee.create({
      data: {
        email,
        username,
        name,
        passwordHash: await hashPassword(password),
        role: "user",
        whatsapp: body.whatsapp ? String(body.whatsapp).trim() : null,
        wantsNews: body.wantsNews !== false,
      },
    });

    const address = body.address as Record<string, string> | undefined;
    if (address?.line1 && address.city && address.state && address.zip && address.phone) {
      await prisma.address.create({
        data: {
          devoteeId: devotee.id,
          label: String(address.label || "Casa").trim() || "Casa",
          line1: String(address.line1).trim(),
          city: String(address.city).trim(),
          state: String(address.state).trim(),
          zip: String(address.zip).trim(),
          phone: String(address.phone).trim(),
          isDefault: true,
        },
      });
    }

    const payment = body.payment as Record<string, string> | undefined;
    const last4 = last4FromNumber(String(payment?.number || ""));
    if (payment && last4 && payment.holder && payment.expMonth && payment.expYear) {
      await prisma.paymentMethod.create({
        data: {
          devoteeId: devotee.id,
          label: String(payment.label || "Tarjeta").trim() || "Tarjeta",
          brand: cardBrand(String(payment.number || "")),
          last4,
          expMonth: Number(payment.expMonth),
          expYear: Number(payment.expYear),
          holder: String(payment.holder).trim(),
          isDefault: true,
        },
      });
    }

    await createSession({
      id: devotee.id,
      email: devotee.email,
      name: devotee.name,
      role: devotee.role,
    });
    return NextResponse.json({ ok: true, role: devotee.role });
  }

  const email = emailFromLogin(login);
  const username = usernameFromLogin(login);
  const devotee = await prisma.devotee.findFirst({
    where: { OR: [{ email }, { username: login }, { username }] },
  });
  if (!devotee || !(await verifyPassword(password, devotee.passwordHash))) {
    return NextResponse.json({ error: "Usuario o contraseña no coinciden." }, { status: 401 });
  }
  await createSession({
    id: devotee.id,
    email: devotee.email,
    name: devotee.name,
    role: devotee.role,
  });
  return NextResponse.json({ ok: true, role: devotee.role });
}
