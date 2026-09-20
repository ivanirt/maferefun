import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export async function POST(request: Request) {
  const denied = await requireAdminApi().then((u) => (u instanceof NextResponse ? u : null));
  if (denied) return denied;

  const form = await request.formData();
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (!files.length) return NextResponse.json({ error: "Selecciona una foto." }, { status: 400 });

  const dir = path.join(process.cwd(), "public", "products", "uploads");
  await mkdir(dir, { recursive: true });

  const paths: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, safe), buffer);
    paths.push(`/products/uploads/${safe}`);
  }
  return NextResponse.json({ paths });
}
