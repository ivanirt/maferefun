import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const user = await getSession();
  const posts = await prisma.post.findMany({
    where: { published: true, kind: "blog" },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Blogs</h1>
      {!user ? (
        <p className="mt-3 text-sm text-[#6D5E52]">
          Puedes leer los títulos aquí. <Link href="/acceso">Entra a tu cuenta</Link> para el texto completo.
        </p>
      ) : null}
      <ul className="mt-8 space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="border border-[#EADBCE] bg-white p-4">
            <Link href={`/blogs/${post.slug}`} className="font-serif text-2xl">
              {post.title}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm text-[#6D5E52]">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
