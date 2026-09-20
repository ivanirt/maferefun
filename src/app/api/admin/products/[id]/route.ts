import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sort: "asc" } },
      offers: { orderBy: { startsAt: "desc" } },
      _count: { select: { orderItems: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "No existe ese artículo." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const images = (body.images as string[] | undefined)?.filter(Boolean);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      category: body.category !== undefined ? String(body.category).trim() : undefined,
      orisha: body.orisha !== undefined ? String(body.orisha).trim() : undefined,
      description: body.description !== undefined ? String(body.description).trim() : undefined,
      priceMxn: body.priceMxn !== undefined ? Number(body.priceMxn) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      minStock: body.minStock !== undefined ? Number(body.minStock) : undefined,
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
      imagePath: images?.[0],
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((path, sort) => ({ path, sort })),
            },
          }
        : {}),
    },
  });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const count = await prisma.orderItem.count({ where: { productId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede borrar: el artículo ya tiene transacciones. Puedes deshabilitarlo." },
      { status: 409 },
    );
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
