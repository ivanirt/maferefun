"use client";

import { useEffect, useState } from "react";
import {
  ConsultaSlotRow,
  formatScheduled,
  hourToStart,
  HOURS,
  modalityLabel,
  WEEKDAY_LABELS,
} from "@/lib/consultas";

const CYCLE: Array<string | null> = [null, "ambas", "en_linea", "presencial"];

type Upcoming = {
  id: string;
  name: string;
  kind: string;
  modality: string | null;
  scheduledAt: string | null;
  status: string;
};

export function ConsultaHoursAdmin() {
  const [slots, setSlots] = useState<ConsultaSlotRow[]>([]);
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/consulta-slots");
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo cargar.");
      return;
    }
    setSlots(data.slots || []);
    setUpcoming(data.upcoming || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function cycle(weekday: number, startTime: string) {
    const current = slots.find((item) => item.weekday === weekday && item.startTime === startTime);
    const index = CYCLE.indexOf(current?.modality ?? null);
    const next = CYCLE[(index + 1) % CYCLE.length];
    const res = await fetch("/api/admin/consulta-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekday, startTime, modality: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
      return;
    }
    await load();
  }

  function cell(weekday: number, startTime: string) {
    const slot = slots.find((item) => item.weekday === weekday && item.startTime === startTime);
    if (!slot) return { label: "Cerrada", className: "text-[#C4B8AA]" };
    if (slot.modality === "en_linea") return { label: "En línea", className: "bg-[#241B16] text-[#FAF7F2]" };
    if (slot.modality === "presencial") return { label: "Presencial", className: "bg-[#8B3A2A] text-[#FAF7F2]" };
    return { label: "Ambas", className: "bg-[#3D5A4C] text-[#FAF7F2]" };
  }

  return (
    <div>
      <p className="text-sm text-[#6D5E52]">
        Toca una casilla para abrirla: cerrada → ambas → en línea → presencial → cerrada. El horario es de México.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="w-16 border border-[#EADBCE] bg-[#F3EEE6] px-2 py-2 text-xs font-normal uppercase tracking-wider text-[#6D5E52]">
                Hora
              </th>
              {WEEKDAY_LABELS.map((label) => (
                <th key={label} className="border border-[#EADBCE] bg-[#F3EEE6] px-2 py-2 text-xs font-normal uppercase tracking-wider text-[#6D5E52]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => {
              const startTime = hourToStart(hour);
              return (
                <tr key={startTime}>
                  <td className="border border-[#EADBCE] bg-[#F3EEE6] px-2 py-1 text-xs text-[#6D5E52]">{startTime}</td>
                  {WEEKDAY_LABELS.map((_, index) => {
                    const weekday = index + 1;
                    const look = cell(weekday, startTime);
                    return (
                      <td key={`${weekday}-${startTime}`} className="border border-[#EADBCE] p-1">
                        <button
                          type="button"
                          onClick={() => cycle(weekday, startTime)}
                          className={`w-full px-1 py-2 text-xs ${look.className}`}
                        >
                          {look.label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {message ? <p className="mt-3 text-sm text-[#8B3A2A]">{message}</p> : null}

      <h3 className="mt-10 font-serif text-xl">Próximas citas</h3>
      {upcoming.length === 0 ? (
        <p className="mt-2 text-sm text-[#6D5E52]">Nadie ha tomado hora todavía.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {upcoming.map((item) => (
            <li key={item.id} className="border border-[#EADBCE] bg-white p-3 text-sm">
              {item.scheduledAt ? formatScheduled(item.scheduledAt) : "Sin hora"} · {modalityLabel(item.modality)} · {item.kind} · {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
