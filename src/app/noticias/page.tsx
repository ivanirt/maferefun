import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const posts = await prisma.post.findMany({
    where: { published: true, kind: "noticia" },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Noticias</h1>
      <ul className="mt-8 space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="border border-[#EADBCE] bg-white p-4">
            <Link href={`/noticias/${post.slug}`} className="font-serif text-2xl">
              {post.title}
            </Link>
            <p className="mt-2 text-sm text-[#6D5E52]">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
