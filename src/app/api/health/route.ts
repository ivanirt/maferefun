import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, posts] = await Promise.all([prisma.product.count(), prisma.post.count()]);
    return NextResponse.json({ ok: true, products, posts });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "db" },
      { status: 500 },
    );
  }
}
