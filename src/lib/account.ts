import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireUserApi() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Entra a tu cuenta." }, { status: 401 });
  return user;
}

export function formatAddress(address: {
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}): string {
  return `${address.label}: ${address.line1}, ${address.city}, ${address.state} ${address.zip}. Tel ${address.phone}`;
}

export function last4FromNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-4);
}

export function cardBrand(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("5")) return "Mastercard";
  if (digits.startsWith("3")) return "Amex";
  return "Tarjeta";
}
