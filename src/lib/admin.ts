import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/acceso");
  if (user.role !== "admin") redirect("/panel");
  return user;
}

export async function requireAdminApi() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  return user;
}
