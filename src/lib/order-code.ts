import { randomBytes } from "crypto";

export function createOrderCode(): string {
  return `MF-${randomBytes(3).toString("hex").toUpperCase()}`;
}
