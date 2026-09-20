import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserApi } from "@/lib/account";

async function setDefaultAddress(devoteeId: string, id: string) {
  await prisma.$transaction([
    prisma.address.updateMany({ where: { devoteeId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
}

export async function POST(request: Request) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const line1 = String(body.line1 || "").trim();
  const city = String(body.city || "").trim();
  const state = String(body.state || "").trim();
  const zip = String(body.zip || "").trim();
  const phone = String(body.phone || "").trim();
  if (!line1 || !city || !state || !zip || !phone) {
    return NextResponse.json({ error: "Completa calle, ciudad, estado, CP y teléfono." }, { status: 400 });
  }
  const count = await prisma.address.count({ where: { devoteeId: user.id } });
  const address = await prisma.address.create({
    data: {
      devoteeId: user.id,
      label: String(body.label || "Casa").trim() || "Casa",
      line1,
      city,
      state,
      zip,
      phone,
      isDefault: count === 0 || Boolean(body.isDefault),
    },
  });
  if (address.isDefault) await setDefaultAddress(user.id, address.id);
  return NextResponse.json({ address });
}
