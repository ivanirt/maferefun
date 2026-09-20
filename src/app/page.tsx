import { CatalogHome } from "@/components/CatalogHome";
import { featuredProducts, toCatalogProduct } from "@/lib/featured";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const [products, packages, news, blogs] = await Promise.all([
      prisma.product.findMany({
        where: { enabled: true },
        orderBy: { name: "asc" },
        include: { offers: true, images: { orderBy: { sort: "asc" } } },
      }),
      prisma.package.findMany({
        where: { enabled: true },
        orderBy: { name: "asc" },
        include: { items: { include: { product: true } } },
      }),
      prisma.post.findMany({
        where: { published: true, kind: "noticia" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.post.findMany({
        where: { published: true, kind: "blog" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
    let featured = { title: "Destacados", products: [] as ReturnType<typeof toCatalogProduct>[] };
    try {
      featured = await featuredProducts();
    } catch (error) {
      console.error("featuredProducts", error);
    }
    return (
      <CatalogHome
        products={products.map(toCatalogProduct)}
        packages={packages.map((pack) => {
          const priceMxn = pack.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
          const listTotal = pack.items.reduce((sum, item) => sum + item.product.priceMxn * item.quantity, 0);
          return {
            id: pack.id,
            slug: pack.slug,
            name: pack.name,
            description: pack.description,
            priceMxn,
            compareAtMxn: listTotal > priceMxn ? listTotal : null,
            imagePath: pack.items[0]?.product.imagePath || "",
            items: pack.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              listPrice: item.product.priceMxn,
            })),
          };
        })}
        news={news.map((item) => ({
          slug: item.slug,
          title: item.title,
          body: item.body,
          createdAt: item.createdAt.toISOString(),
          href: `/noticias/${item.slug}`,
        }))}
        blogs={blogs.map((item) => ({
          slug: item.slug,
          title: item.title,
          body: item.body,
          createdAt: item.createdAt.toISOString(),
          href: `/blogs/${item.slug}`,
        }))}
        featured={featured.products}
        featuredTitle={featured.title}
      />
    );
  } catch {
    return <CatalogHome products={[]} packages={[]} news={[]} blogs={[]} featured={[]} featuredTitle="Destacados" />;
  }
}
