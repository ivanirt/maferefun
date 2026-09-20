import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, kind: "noticia", published: true } });
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-[#6D5E52]">Noticia</p>
      <h1 className="mt-2 font-serif text-4xl">{post.title}</h1>
      <p className="mt-6 whitespace-pre-wrap text-[#6D5E52]">{post.body}</p>
    </article>
  );
}
