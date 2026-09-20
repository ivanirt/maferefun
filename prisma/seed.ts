import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const COLLAR =
  "Ileke de cuentas, hecho con oficio. Si lo pides, lo consagramos antes de enviarlo.";
const MAZO =
  "Collar mazo de mayor volumen, para quien ya camina con su santo. Consagración opcional al pedir.";

const products = [
  { slug: "colla-inle", name: "Colla Inle", category: "Collar", orisha: "Inle", description: COLLAR, priceMxn: 13, imagePath: "/products/colla-inle.jpg", stock: 5, minStock: 2 },
  { slug: "collar-babalu-aye", name: "Collar Babalú Ayé", category: "Collar", orisha: "Babalú Ayé", description: COLLAR, priceMxn: 65, imagePath: "/products/collar-babalu-aye.jpg", stock: 5, minStock: 2 },
  { slug: "collar-eggun", name: "Collar Eggun", category: "Collar", orisha: "Eggun", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-eggun.jpg", stock: 30, minStock: 5 },
  { slug: "collar-elegua", name: "Collar Eleguá", category: "Collar", orisha: "Eleguá", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-elegua.jpg", stock: 20, minStock: 5 },
  { slug: "collar-obatala", name: "Collar Obatalá", category: "Collar", orisha: "Obatalá", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-obatala.jpg", stock: 20, minStock: 5 },
  { slug: "collar-oggun", name: "Collar Oggún", category: "Collar", orisha: "Oggún", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-oggun.jpg", stock: 10, minStock: 3 },
  { slug: "collar-olokun", name: "Collar Olokun", category: "Collar", orisha: "Olokun", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-olokun.jpg", stock: 5, minStock: 2 },
  { slug: "collar-orula", name: "Collar Orula", category: "Collar", orisha: "Orula", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-orula.jpg", stock: 20, minStock: 5 },
  { slug: "collar-oshun", name: "Collar Oshún", category: "Collar", orisha: "Oshún", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-oshun.jpg", stock: 5, minStock: 2 },
  { slug: "collar-mazo-elegua", name: "Collar mazo Eleguá", category: "Mazo", orisha: "Eleguá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-elegua.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-obatala", name: "Collar mazo Obatalá", category: "Mazo", orisha: "Obatalá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-obatala.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-oggun", name: "Collar mazo Oggún", category: "Mazo", orisha: "Oggún", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-oggun.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-olokun", name: "Collar mazo Olokun", category: "Mazo", orisha: "Olokun", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-olokun.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-orula", name: "Collar mazo Orula", category: "Mazo", orisha: "Orula", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-orula.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-oshun", name: "Collar mazo Oshún", category: "Mazo", orisha: "Oshún", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-oshun.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-oya", name: "Collar mazo Oyá", category: "Mazo", orisha: "Oyá", description: MAZO, priceMxn: 390, imagePath: "/products/collar-mazo-oya.jpg", stock: 2, minStock: 1 },
  { slug: "collar-mazo-shango", name: "Collar mazo Shangó", category: "Mazo", orisha: "Shangó", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-shango.jpg", stock: 9, minStock: 2 },
  { slug: "collar-mazo-yemaya", name: "Collar mazo Yemayá", category: "Mazo", orisha: "Yemayá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-yemaya.jpg", stock: 9, minStock: 2 },
];

async function main() {
  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: { ...product, enabled: true },
    });
    const images = await prisma.productImage.count({ where: { productId: saved.id } });
    if (!images) {
      await prisma.productImage.create({
        data: { productId: saved.id, path: product.imagePath, sort: 0 },
      });
    }
  }

  const passwordHashAdmin = await hashPassword("admin");
  const passwordHashUser = await hashPassword("user");

  await prisma.devotee.upsert({
    where: { email: "admin@maferefun.com" },
    update: { passwordHash: passwordHashAdmin, name: "Admin Maferefun", role: "admin", username: "admin" },
    create: {
      email: "admin@maferefun.com",
      username: "admin",
      passwordHash: passwordHashAdmin,
      name: "Admin Maferefun",
      whatsapp: "5550000001",
      role: "admin",
    },
  });
  const user = await prisma.devotee.upsert({
    where: { email: "user@maferefun.com" },
    update: { passwordHash: passwordHashUser, name: "Usuario demo", role: "user", username: "user" },
    create: {
      email: "user@maferefun.com",
      username: "user",
      passwordHash: passwordHashUser,
      name: "Usuario demo",
      whatsapp: "5550000000",
      role: "user",
    },
  });

  if (!(await prisma.address.count({ where: { devoteeId: user.id } }))) {
    await prisma.address.createMany({
      data: [
        {
          devoteeId: user.id,
          label: "Casa",
          line1: "Calle Cedro 12",
          city: "Ciudad de México",
          state: "CDMX",
          zip: "01000",
          phone: "5550000000",
          isDefault: true,
        },
        {
          devoteeId: user.id,
          label: "Trabajo",
          line1: "Av. Reforma 200",
          city: "Ciudad de México",
          state: "CDMX",
          zip: "06600",
          phone: "5550000000",
          isDefault: false,
        },
      ],
    });
  }
  if (!(await prisma.paymentMethod.count({ where: { devoteeId: user.id } }))) {
    await prisma.paymentMethod.create({
      data: {
        devoteeId: user.id,
        label: "Débito",
        brand: "Visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2028,
        holder: "Usuario Demo",
        isDefault: true,
      },
    });
  }

  const posts = [
    {
      slug: "envios-esta-semana",
      kind: "noticia",
      title: "Envíos esta semana",
      body: "Los pedidos pagados antes del jueves salen el viernes. Mazos se consagran el día anterior al envío.",
    },
    {
      slug: "collares-de-oshun",
      kind: "noticia",
      title: "Collares de Oshún",
      body: "Reponemos ilekes de Oshún. El precio unitario sigue en inventario; las ofertas se marcan aparte.",
    },
    {
      slug: "como-pedir-consagracion",
      kind: "blog",
      title: "Cómo pedir consagración",
      body: "En el carrito marca consagrar. Queda ligada al pedido y se cobra una sola vez.",
    },
    {
      slug: "cuidar-el-ileke",
      kind: "blog",
      title: "Cuidar el ileke",
      body: "Quítalo para dormir si se enreda. No lo prestes. Si se rompe, no lo tires: tráelo o escríbenos para recomponerlo con oficio.",
    },
    {
      slug: "cuando-pedir-un-mazo",
      kind: "blog",
      title: "Cuándo pedir un mazo",
      body: "El mazo no es el primer collar. Conviene cuando ya hay camino con el santo. Si dudas, pide consulta de IFA Registro.",
    },
    {
      slug: "paquetes-y-precio-unitario",
      kind: "blog",
      title: "Paquetes y precio unitario",
      body: "El paquete se cobra como una transacción. Cada pieza sigue teniendo su precio de lista en el inventario.",
    },
  ];
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, body: post.body, kind: post.kind, published: true },
      create: post,
    });
  }

  const now = new Date();
  const ends = new Date(now);
  ends.setMonth(ends.getMonth() + 2);
  const demoOffers = [
    { slug: "collar-babalu-aye", priceMxn: 45 },
    { slug: "collar-oshun", priceMxn: 10 },
  ];
  for (const demo of demoOffers) {
    const product = await prisma.product.findUnique({ where: { slug: demo.slug } });
    if (!product) continue;
    const active = await prisma.offer.findFirst({
      where: { productId: product.id, startsAt: { lte: now }, endsAt: { gte: now } },
    });
    if (!active) {
      await prisma.offer.create({
        data: { productId: product.id, priceMxn: demo.priceMxn, startsAt: now, endsAt: ends },
      });
    }
  }

  const hours = ["10:00", "16:00"];
  for (const weekday of [1, 2, 3, 4, 5]) {
    for (const startTime of hours) {
      await prisma.consultaSlot.upsert({
        where: { weekday_startTime: { weekday, startTime } },
        update: {},
        create: { weekday, startTime, durationMin: 60, modality: "ambas", enabled: true },
      });
    }
  }
  await prisma.consultaSlot.upsert({
    where: { weekday_startTime: { weekday: 6, startTime: "10:00" } },
    update: {},
    create: { weekday: 6, startTime: "10:00", durationMin: 60, modality: "presencial", enabled: true },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
