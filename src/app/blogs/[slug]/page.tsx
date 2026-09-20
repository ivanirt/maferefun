import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSession();
  const post = await prisma.post.findFirst({ where: { slug, kind: "blog", published: true } });
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-[#6D5E52]">Blog</p>
      <h1 className="mt-2 font-serif text-4xl">{post.title}</h1>
      {user ? (
        <p className="mt-6 whitespace-pre-wrap text-[#6D5E52]">{post.body}</p>
      ) : (
        <p className="mt-6 text-[#6D5E52]">
          Esta nota es para quien tiene cuenta. <Link href="/acceso">Entra</Link> para leerla completa.
        </p>
      )}
    </article>
  );
}
