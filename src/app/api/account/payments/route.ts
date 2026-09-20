import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cardBrand, last4FromNumber, requireUserApi } from "@/lib/account";

export async function POST(request: Request) {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const number = String(body.number || "");
  const last4 = last4FromNumber(number) || String(body.last4 || "").replace(/\D/g, "").slice(-4);
  const holder = String(body.holder || "").trim();
  const expMonth = Number(body.expMonth);
  const expYear = Number(body.expYear);
  if (!last4 || last4.length < 4 || !holder || !expMonth || !expYear) {
    return NextResponse.json({ error: "Indica titular, número y vencimiento." }, { status: 400 });
  }
  const count = await prisma.paymentMethod.count({ where: { devoteeId: user.id } });
  const method = await prisma.paymentMethod.create({
    data: {
      devoteeId: user.id,
      label: String(body.label || "Tarjeta").trim() || "Tarjeta",
      brand: cardBrand(number || last4),
      last4,
      expMonth,
      expYear,
      holder,
      isDefault: count === 0 || Boolean(body.isDefault),
    },
  });
  if (method.isDefault) {
    await prisma.paymentMethod.updateMany({ where: { devoteeId: user.id }, data: { isDefault: false } });
    await prisma.paymentMethod.update({ where: { id: method.id }, data: { isDefault: true } });
  }
  return NextResponse.json({
    paymentMethod: {
      id: method.id,
      label: method.label,
      brand: method.brand,
      last4: method.last4,
      expMonth: method.expMonth,
      expYear: method.expYear,
      holder: method.holder,
      isDefault: true,
    },
  });
}
