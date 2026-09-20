import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserApi } from "@/lib/account";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const existing = await prisma.paymentMethod.findFirst({ where: { id, devoteeId: user.id } });
  if (!existing) return NextResponse.json({ error: "No existe ese método de pago." }, { status: 404 });
  const body = await request.json();
  if (body.isDefault) {
    await prisma.paymentMethod.updateMany({ where: { devoteeId: user.id }, data: { isDefault: false } });
    await prisma.paymentMethod.update({ where: { id }, data: { isDefault: true } });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const existing = await prisma.paymentMethod.findFirst({ where: { id, devoteeId: user.id } });
  if (!existing) return NextResponse.json({ error: "No existe ese método de pago." }, { status: 404 });
  await prisma.paymentMethod.delete({ where: { id } });
  if (existing.isDefault) {
    const next = await prisma.paymentMethod.findFirst({ where: { devoteeId: user.id } });
    if (next) await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return NextResponse.json({ ok: true });
}
