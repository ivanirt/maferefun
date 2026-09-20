import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CONSECRATION_FEE, getShippingCost } from "@/lib/shipping";

export async function POST(request: Request) {
  const body = await request.json();
  const items = (body.items || []) as { productId: string; quantity: number }[];
  if (!items.length) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const whatsapp = String(body.whatsapp || "").trim();
  const address = String(body.address || "").trim();
  if (!name || !email || !whatsapp || !address) {
    return NextResponse.json({ error: "Completa nombre, correo, WhatsApp y dirección." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
  });
  if (products.length !== items.length) {
    return NextResponse.json({ error: "Alguna pieza ya no está disponible." }, { status: 400 });
  }

  const lineItems = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)!;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.priceMxn,
    };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = getShippingCost(subtotal, lineItems.length);
  const consecration = body.consecrate ? CONSECRATION_FEE : 0;
  const session = await getSession();

  const order = await prisma.order.create({
    data: {
      devoteeId: session?.id,
      email,
      name,
      whatsapp,
      address,
      notes: body.notes ? String(body.notes) : null,
      subtotal,
      shipping,
      consecration,
      total: subtotal + shipping + consecration,
      items: { create: lineItems },
    },
  });

  return NextResponse.json({ id: order.id });
}
