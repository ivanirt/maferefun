import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserApi } from "@/lib/account";

export async function GET() {
  const user = await requireUserApi();
  if (user instanceof NextResponse) return user;
  const devotee = await prisma.devotee.findUnique({
    where: { id: user.id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { label: "asc" }] },
      paymentMethods: { orderBy: [{ isDefault: "desc" }, { label: "asc" }] },
    },
  });
  if (!devotee) return NextResponse.json({ error: "No encontramos la cuenta." }, { status: 404 });
  return NextResponse.json({
    user: { id: devotee.id, name: devotee.name, email: devotee.email, username: devotee.username, role: devotee.role, whatsapp: devotee.whatsapp },
    addresses: devotee.addresses,
    paymentMethods: devotee.paymentMethods.map((method) => ({
      id: method.id,
      label: method.label,
      brand: method.brand,
      last4: method.last4,
      expMonth: method.expMonth,
      expYear: method.expYear,
      holder: method.holder,
      isDefault: method.isDefault,
    })),
  });
}
