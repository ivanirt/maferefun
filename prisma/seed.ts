import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const COLLAR =
  "Ileke de cuentas, hecho con oficio. Si lo pides, lo consagramos antes de enviarlo.";
const MAZO =
  "Collar mazo de mayor volumen, para quien ya camina con su santo. Consagración opcional al pedir.";

const products = [
  // PRECIO UNITARIO from https://docs.google.com/spreadsheets/d/17iOJNxoqkm6fEF8AdPbiQywxpNobXbsSxitZBwvd00Y
  { slug: "colla-inle", name: "Colla Inle", category: "Collar", orisha: "Inle", description: COLLAR, priceMxn: 13, imagePath: "/products/colla-inle.jpg" },
  { slug: "collar-babalu-aye", name: "Collar Babalú Ayé", category: "Collar", orisha: "Babalú Ayé", description: COLLAR, priceMxn: 65, imagePath: "/products/collar-babalu-aye.jpg" },
  { slug: "collar-eggun", name: "Collar Eggun", category: "Collar", orisha: "Eggun", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-eggun.jpg" },
  { slug: "collar-elegua", name: "Collar Eleguá", category: "Collar", orisha: "Eleguá", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-elegua.jpg" },
  { slug: "collar-obatala", name: "Collar Obatalá", category: "Collar", orisha: "Obatalá", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-obatala.jpg" },
  { slug: "collar-oggun", name: "Collar Oggún", category: "Collar", orisha: "Oggún", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-oggun.jpg" },
  { slug: "collar-olokun", name: "Collar Olokun", category: "Collar", orisha: "Olokun", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-olokun.jpg" },
  { slug: "collar-orula", name: "Collar Orula", category: "Collar", orisha: "Orula", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-orula.jpg" },
  { slug: "collar-oshun", name: "Collar Oshún", category: "Collar", orisha: "Oshún", description: COLLAR, priceMxn: 13, imagePath: "/products/collar-oshun.jpg" },
  { slug: "collar-mazo-elegua", name: "Collar mazo Eleguá", category: "Mazo", orisha: "Eleguá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-elegua.jpg" },
  { slug: "collar-mazo-obatala", name: "Collar mazo Obatalá", category: "Mazo", orisha: "Obatalá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-obatala.jpg" },
  { slug: "collar-mazo-oggun", name: "Collar mazo Oggún", category: "Mazo", orisha: "Oggún", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-oggun.jpg" },
  { slug: "collar-mazo-olokun", name: "Collar mazo Olokun", category: "Mazo", orisha: "Olokun", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-olokun.jpg" },
  { slug: "collar-mazo-orula", name: "Collar mazo Orula", category: "Mazo", orisha: "Orula", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-orula.jpg" },
  { slug: "collar-mazo-oshun", name: "Collar mazo Oshún", category: "Mazo", orisha: "Oshún", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-oshun.jpg" },
  { slug: "collar-mazo-oya", name: "Collar mazo Oyá", category: "Mazo", orisha: "Oyá", description: MAZO, priceMxn: 390, imagePath: "/products/collar-mazo-oya.jpg" },
  { slug: "collar-mazo-shango", name: "Collar mazo Shangó", category: "Mazo", orisha: "Shangó", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-shango.jpg" },
  { slug: "collar-mazo-yemaya", name: "Collar mazo Yemayá", category: "Mazo", orisha: "Yemayá", description: MAZO, priceMxn: 350, imagePath: "/products/collar-mazo-yemaya.jpg" },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  const passwordHash = await hashPassword("maferefun");
  await prisma.devotee.upsert({
    where: { email: "devoto@maferefun.com" },
    update: { passwordHash, name: "Devoto demo" },
    create: {
      email: "devoto@maferefun.com",
      passwordHash,
      name: "Devoto demo",
      whatsapp: "5550000000",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
