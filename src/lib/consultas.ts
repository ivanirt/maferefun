export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
export const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
export const MODALITIES = [
  { id: "en_linea", label: "En línea" },
  { id: "presencial", label: "Presencial" },
] as const;

export type SlotModality = "en_linea" | "presencial" | "ambas";

export type ConsultaSlotRow = {
  id: string;
  weekday: number;
  startTime: string;
  durationMin: number;
  modality: string;
  enabled: boolean;
};

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function hourToStart(hour: number) {
  return `${pad2(hour)}:00`;
}

export function modalityLabel(value: string | null | undefined) {
  if (value === "en_linea") return "En línea";
  if (value === "presencial") return "Presencial";
  if (value === "ambas") return "En línea o presencial";
  return value || "";
}

export function todayMexico(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}

export function mondayOf(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const noon = Date.UTC(year, month - 1, day, 12, 0, 0);
  const jsDay = new Date(noon).getUTCDay();
  const isoWeekday = jsDay === 0 ? 7 : jsDay;
  return addDays(isoDate, 1 - isoWeekday);
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0)).toISOString().slice(0, 10);
}

export function isoWeekday(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const jsDay = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function scheduledIso(ymd: string, startTime: string) {
  return `${ymd}T${startTime}:00-06:00`;
}

export function formatScheduled(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function minutesNowMexico() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

export function isPastSlot(ymd: string, startTime: string) {
  const today = todayMexico();
  if (ymd < today) return true;
  if (ymd > today) return false;
  const [hour, minute] = startTime.split(":").map(Number);
  return hour * 60 + minute <= minutesNowMexico();
}

export function slotAllowsModality(slotModality: string, chosen: string) {
  return slotModality === "ambas" || slotModality === chosen;
}
