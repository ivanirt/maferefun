import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const pack = await prisma.package.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, _count: { select: { orderItems: true } } },
  });
  if (!pack) return NextResponse.json({ error: "No existe ese paquete." }, { status: 404 });
  return NextResponse.json({ package: pack });
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const items = body.items as { productId: string; quantity: number; unitPrice: number }[] | undefined;

  const pack = await prisma.package.update({
    where: { id },
    data: {
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      description: body.description !== undefined ? String(body.description).trim() : undefined,
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
      ...(items
        ? {
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.unitPrice) || 0,
              })),
            },
          }
        : {}),
    },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json({ package: pack });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const count = await prisma.orderItem.count({ where: { packageId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede borrar: el paquete ya tiene transacciones. Puedes deshabilitarlo." },
      { status: 409 },
    );
  }
  await prisma.package.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
