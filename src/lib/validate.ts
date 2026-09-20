export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return false;
  if (email.includes("..")) return false;
  return /^[a-z0-9._%+\-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = phoneDigits(value);
  if (digits.length === 10) return true;
  if (digits.startsWith("52") && (digits.length === 12 || digits.length === 13)) return true;
  if (digits.length >= 10 && digits.length <= 15 && !/^0+$/.test(digits)) return true;
  return false;
}
