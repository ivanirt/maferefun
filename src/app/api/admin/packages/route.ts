import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export async function GET() {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const packages = await prisma.package.findMany({
    orderBy: { name: "asc" },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const items = (body.items || []) as { productId: string; quantity: number; unitPrice: number }[];
  if (!name) return NextResponse.json({ error: "El nombre es necesario." }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: "Añade al menos un artículo." }, { status: 400 });

  let slug = slugify(String(body.slug || name));
  const existing = await prisma.package.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const pack = await prisma.package.create({
    data: {
      slug,
      name,
      description: String(body.description || "").trim(),
      enabled: body.enabled !== false,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json({ package: pack });
}
