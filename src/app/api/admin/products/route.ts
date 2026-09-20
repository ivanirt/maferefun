import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export async function GET() {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { images: { orderBy: { sort: "asc" } }, offers: true, _count: { select: { orderItems: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;

  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "El nombre es necesario." }, { status: 400 });

  let slug = slugify(String(body.slug || name));
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const images = (body.images as string[] | undefined)?.filter(Boolean) || [];
  const imagePath = images[0] || "/products/colla-inle.jpg";

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      category: String(body.category || "Collar").trim() || "Collar",
      orisha: String(body.orisha || "").trim(),
      description: String(body.description || "").trim(),
      priceMxn: Number(body.priceMxn) || 0,
      stock: Number(body.stock) || 0,
      minStock: Number(body.minStock) || 1,
      enabled: body.enabled !== false,
      imagePath,
      images: {
        create: images.map((path, sort) => ({ path, sort })),
      },
    },
  });
  return NextResponse.json({ product });
}
