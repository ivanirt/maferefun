import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const priceMxn = Number(body.priceMxn);
  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);
  if (!priceMxn || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return NextResponse.json({ error: "Indica precio y un periodo válido." }, { status: 400 });
  }
  const offer = await prisma.offer.create({
    data: { productId: id, priceMxn, startsAt, endsAt },
  });
  return NextResponse.json({ offer });
}
