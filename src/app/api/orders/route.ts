import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderCode } from "@/lib/order-code";
import { getSession } from "@/lib/session";
import { CONSECRATION_FEE, getShippingCost } from "@/lib/shipping";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Indica el número de pedido." }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "No encontramos ese pedido." }, { status: 404 });

  return NextResponse.json({
    code: order.code,
    status: order.status,
    paymentId: order.paymentId,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
    })),
  });
}

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

  let order = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      order = await prisma.order.create({
        data: {
          code: createOrderCode(),
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
      break;
    } catch (error) {
      const duplicate = typeof error === "object" && error && "code" in error && error.code === "P2002";
      if (!duplicate || attempt === 4) throw error;
    }
  }

  if (!order) return NextResponse.json({ error: "No se pudo confirmar el pedido." }, { status: 500 });

  return NextResponse.json({
    id: order.id,
    code: order.code,
    status: order.status,
    total: order.total,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Falta el número de pedido." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order) return NextResponse.json({ error: "No encontramos ese pedido." }, { status: 404 });
  if (order.status !== "pendiente_pago") {
    return NextResponse.json({ code: order.code, status: order.status, paymentId: order.paymentId });
  }

  const paid = await prisma.order.update({
    where: { code },
    data: {
      status: "pagado",
      paymentId: String(body.paymentId || `MP-SIM-${Date.now()}`),
    },
  });

  return NextResponse.json({ code: paid.code, status: paid.status, paymentId: paid.paymentId });
}
