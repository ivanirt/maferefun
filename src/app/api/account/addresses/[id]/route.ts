import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserApi } from "@/lib/account";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const existing = await prisma.address.findFirst({ where: { id, devoteeId: user.id } });
  if (!existing) return NextResponse.json({ error: "No existe ese domicilio." }, { status: 404 });
  const body = await request.json();
  const address = await prisma.address.update({
    where: { id },
    data: {
      label: body.label !== undefined ? String(body.label).trim() : undefined,
      line1: body.line1 !== undefined ? String(body.line1).trim() : undefined,
      city: body.city !== undefined ? String(body.city).trim() : undefined,
      state: body.state !== undefined ? String(body.state).trim() : undefined,
      zip: body.zip !== undefined ? String(body.zip).trim() : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
    },
  });
  if (body.isDefault) {
    await prisma.address.updateMany({ where: { devoteeId: user.id }, data: { isDefault: false } });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });
  }
  return NextResponse.json({ address });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const existing = await prisma.address.findFirst({ where: { id, devoteeId: user.id } });
  if (!existing) return NextResponse.json({ error: "No existe ese domicilio." }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({ where: { devoteeId: user.id } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return NextResponse.json({ ok: true });
}
