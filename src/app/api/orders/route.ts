import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentSalePrice } from "@/lib/catalog";
import { createOrderCode } from "@/lib/order-code";
import { getSession } from "@/lib/session";
import { CONSECRATION_FEE, getShippingCost } from "@/lib/shipping";

type IncomingItem = {
  kind?: "product" | "package";
  productId?: string;
  packageId?: string;
  quantity: number;
};

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Indica el número de pedido." }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: { include: { product: true, package: true } } },
  });
  if (!order) return NextResponse.json({ error: "No encontramos ese pedido." }, { status: 404 });

  return NextResponse.json({
    code: order.code,
    status: order.status,
    paymentId: order.paymentId,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      name: item.package ? `${item.package.name}: ${item.product.name}` : item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const items = (body.items || []) as IncomingItem[];
  if (!items.length) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const whatsapp = String(body.whatsapp || "").trim();
  const address = String(body.address || "").trim();
  const session = await getSession();
  let resolvedAddress = address;
  let resolvedWhatsapp = whatsapp;

  if (session && body.addressId) {
    const saved = await prisma.address.findFirst({
      where: { id: String(body.addressId), devoteeId: session.id },
    });
    if (!saved) return NextResponse.json({ error: "Ese domicilio no está en tu cuenta." }, { status: 400 });
    resolvedAddress = `${saved.label}: ${saved.line1}, ${saved.city}, ${saved.state} ${saved.zip}`;
    if (!resolvedWhatsapp) resolvedWhatsapp = saved.phone;
  }

  if (session && body.paymentMethodId) {
    const savedPay = await prisma.paymentMethod.findFirst({
      where: { id: String(body.paymentMethodId), devoteeId: session.id },
    });
    if (!savedPay) return NextResponse.json({ error: "Ese método de pago no está en tu cuenta." }, { status: 400 });
  }

  if (!name || !email || !resolvedWhatsapp || !resolvedAddress) {
    return NextResponse.json({ error: "Completa nombre, correo, WhatsApp y dirección." }, { status: 400 });
  }

  const lineItems: { productId: string; packageId?: string; quantity: number; unitPrice: number }[] = [];

  for (const item of items) {
    const quantity = Number(item.quantity) || 0;
    if (quantity < 1) continue;

    if (item.kind === "package" && item.packageId) {
      const pack = await prisma.package.findUnique({
        where: { id: item.packageId },
        include: { items: true },
      });
      if (!pack || !pack.enabled) {
        return NextResponse.json({ error: "Algún paquete ya no está disponible." }, { status: 400 });
      }
      for (const part of pack.items) {
        lineItems.push({
          productId: part.productId,
          packageId: pack.id,
          quantity: part.quantity * quantity,
          unitPrice: part.unitPrice,
        });
      }
      continue;
    }

    if (!item.productId) {
      return NextResponse.json({ error: "Falta un artículo." }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { offers: true },
    });
    if (!product || !product.enabled) {
      return NextResponse.json({ error: "Alguna pieza ya no está disponible." }, { status: 400 });
    }
    const sale = currentSalePrice(product.priceMxn, product.offers);
    lineItems.push({
      productId: product.id,
      quantity,
      unitPrice: sale.priceMxn,
    });
  }

  if (!lineItems.length) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  const needed = new Map<string, number>();
  for (const line of lineItems) {
    needed.set(line.productId, (needed.get(line.productId) || 0) + line.quantity);
  }
  const stockRows = await prisma.product.findMany({
    where: { id: { in: [...needed.keys()] } },
  });
  for (const row of stockRows) {
    if (row.stock < (needed.get(row.id) || 0)) {
      return NextResponse.json({ error: `No hay inventario suficiente de ${row.name}.` }, { status: 400 });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = getShippingCost(subtotal, items.length);
  const consecration = body.consecrate ? CONSECRATION_FEE : 0;

  let order = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      order = await prisma.order.create({
        data: {
          code: createOrderCode(),
          devoteeId: session?.id,
          email,
          name,
          whatsapp: resolvedWhatsapp,
          address: resolvedAddress,
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

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "No encontramos ese pedido." }, { status: 404 });
  if (order.status !== "pendiente_pago") {
    return NextResponse.json({ code: order.code, status: order.status, paymentId: order.paymentId });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    await tx.order.update({
      where: { code },
      data: {
        status: "pagado",
        paymentId: String(body.paymentId || `MP-SIM-${Date.now()}`),
      },
    });
  });

  const paid = await prisma.order.findUnique({ where: { code } });
  return NextResponse.json({ code: paid?.code, status: paid?.status, paymentId: paid?.paymentId });
}
