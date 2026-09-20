"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  ConsultaSlotRow,
  formatScheduled,
  hourToStart,
  HOURS,
  isPastSlot,
  mondayOf,
  scheduledIso,
  slotAllowsModality,
  todayMexico,
  WEEKDAY_LABELS,
} from "@/lib/consultas";

type Day = { date: string; weekday: number };

export function ConsultaWeekPicker({
  modality,
  selected,
  onSelect,
}: {
  modality: string;
  selected: { date: string; startTime: string } | null;
  onSelect: (slot: { date: string; startTime: string } | null) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayMexico()));
  const [slots, setSlots] = useState<ConsultaSlotRow[]>([]);
  const [booked, setBooked] = useState<string[]>([]);

  const thisMonday = mondayOf(todayMexico());
  const days: Day[] = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ date: addDays(weekStart, i), weekday: i + 1 })),
    [weekStart],
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/consultas/availability?weekStart=${weekStart}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots || []);
        setBooked(data.booked || []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setBooked([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const bookedSet = useMemo(() => {
    return new Set(
      booked.map((value) => new Date(value).toISOString()),
    );
  }, [booked]);

  function isBooked(date: string, startTime: string) {
    return bookedSet.has(new Date(scheduledIso(date, startTime)).toISOString());
  }

  const weekLabel = days.length
    ? `${days[0].date} — ${days[6].date}`
    : weekStart;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={weekStart <= thisMonday}
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="border border-[#EADBCE] px-3 py-1 text-xs uppercase tracking-wider disabled:opacity-40"
        >
          Semana anterior
        </button>
        <p className="text-sm text-[#6D5E52]">{weekLabel}</p>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="border border-[#EADBCE] px-3 py-1 text-xs uppercase tracking-wider"
        >
          Semana siguiente
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="w-16 border border-[#EADBCE] bg-[#F3EEE6] px-2 py-2 text-xs font-normal uppercase tracking-wider text-[#6D5E52]">
                Hora
              </th>
              {(days.length ? days : Array.from({ length: 7 }, (_, i) => ({ date: addDays(weekStart, i), weekday: i + 1 }))).map(
                (day, index) => (
                  <th key={day.date} className="border border-[#EADBCE] bg-[#F3EEE6] px-2 py-2 text-xs font-normal">
                    <span className="uppercase tracking-wider text-[#6D5E52]">{WEEKDAY_LABELS[index]}</span>
                    <span className="mt-1 block text-[#241B16]">{day.date.slice(8)}</span>
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => {
              const startTime = hourToStart(hour);
              return (
                <tr key={startTime}>
                  <td className="border border-[#EADBCE] bg-[#F3EEE6] px-2 py-1 text-xs text-[#6D5E52]">{startTime}</td>
                  {(days.length ? days : []).map((day) => {
                    const slot = slots.find((item) => item.weekday === day.weekday && item.startTime === startTime);
                    const open = Boolean(slot && slotAllowsModality(slot.modality, modality));
                    const past = isPastSlot(day.date, startTime);
                    const taken = isBooked(day.date, startTime);
                    const active = selected?.date === day.date && selected.startTime === startTime;
                    const disabled = !open || past || taken;
                    return (
                      <td key={`${day.date}-${startTime}`} className="border border-[#EADBCE] p-1">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onSelect(active ? null : { date: day.date, startTime })}
                          className={`w-full px-1 py-2 text-xs ${
                            active
                              ? "bg-[#241B16] text-[#FAF7F2]"
                              : disabled
                                ? "text-[#C4B8AA]"
                                : "bg-white text-[#241B16] hover:bg-[#F3EEE6]"
                          }`}
                        >
                          {taken ? "Tomada" : open && !past ? "Libre" : "—"}
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
      {selected ? (
        <p className="mt-3 text-sm text-[#6D5E52]">
          Elegiste {formatScheduled(scheduledIso(selected.date, selected.startTime))}.
        </p>
      ) : (
        <p className="mt-3 text-sm text-[#6D5E52]">Toca una hora libre.</p>
      )}
    </div>
  );
}
