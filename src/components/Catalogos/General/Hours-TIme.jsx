"use client";

import React, { useEffect, useMemo, useState } from "react";

export const defaultSchedule = [
  {
    dia: "Domingo",
    apertura: "2026-01-18T00:00:00Z",
    cierre: "2026-01-18T00:00:00Z",
  },
  {
    dia: "Lunes",
    apertura: "2026-01-19T00:00:00Z",
    cierre: "2026-01-20T00:00:00Z",
  },
  {
    dia: "Martes",
    apertura: "2026-01-20T00:00:00Z",
    cierre: "2026-01-21T00:00:00Z",
  },
  {
    dia: "Miercoles",
    apertura: "2026-01-21T00:00:00Z",
    cierre: "2026-01-22T00:00:00Z",
  },
  {
    dia: "Jueves",
    apertura: "2026-01-15T00:00:00Z",
    cierre: "2026-01-16T00:00:00Z",
  },
  {
    dia: "Viernes",
    apertura: "2026-01-16T00:00:00Z",
    cierre: "2026-01-17T00:00:00Z",
  },
  {
    dia: "Sabado",
    apertura: "2026-01-17T08:00:00Z",
    cierre: "2026-01-17T20:00:00Z",
  },
];

// --- Helpers ---
function parseIntervals(schedule) {
  return schedule
    .map((s) => ({
      start: new Date(s.apertura).getTime(),
      end: new Date(s.cierre).getTime(),
      raw: s,
    }))
    .filter(
      (it) =>
        !Number.isNaN(it.start) && !Number.isNaN(it.end) && it.end >= it.start
    )
    .sort((a, b) => a.start - b.start);
}

function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const merged = [];
  let cur = { ...intervals[0] };
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next.start <= cur.end) {
      cur.end = Math.max(cur.end, next.end);
    } else {
      merged.push(cur);
      cur = { ...next };
    }
  }
  merged.push(cur);
  return merged;
}

// Return a Spanish human-friendly relative label for a target date, relative to `now`

// detect consecutive 24h groups
function consecutive24hGroups(intervals) {
  const groups = [];
  const THRESH = 23.9 * 3600 * 1000; // ms
  let curGroup = null;
  for (const it of intervals) {
    const dur = it.end - it.start;
    const is24h = dur >= THRESH;
    if (!is24h) {
      if (curGroup) {
        groups.push({
          start: curGroup.start,
          end: curGroup.end,
          days: curGroup.count,
        });
        curGroup = null;
      }
      continue;
    }
    if (!curGroup) {
      curGroup = { start: it.start, end: it.end, count: 1 };
    } else {
      if (it.start === curGroup.end) {
        curGroup.end = it.end;
        curGroup.count += 1;
      } else {
        groups.push({
          start: curGroup.start,
          end: curGroup.end,
          days: curGroup.count,
        });
        curGroup = { start: it.start, end: it.end, count: 1 };
      }
    }
  }
  if (curGroup)
    groups.push({
      start: curGroup.start,
      end: curGroup.end,
      days: curGroup.count,
    });
  return groups;
}

// --- Reusable hook ---
function useScheduleStatus(schedule) {
  const intervals = useMemo(
    () => parseIntervals(schedule).map((i) => ({ start: i.start, end: i.end })),
    [schedule]
  );

  const merged = useMemo(() => mergeIntervals(intervals), [intervals]);
  const consecGroups = useMemo(() => consecutive24hGroups(merged), [merged]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = merged.find((it) => now >= it.start && now < it.end) || null;
  const next = merged.find((it) => it.start > now) || null;

  // 🔑 NUEVO: detectar 24/7
  const isOpen24x7 = consecGroups.some((g) => g.days >= 7);

  return { now, merged, current, next, consecGroups, isOpen24x7 };
}

// --- Named components ---
export function StoreState({ schedule = defaultSchedule }) {
  const { current } = useScheduleStatus(schedule);
  return (
    <div className="flex items-center gap-1">
      <div
        className={`size-2 rounded-full ${current ? "bg-green-500" : "bg-red-500"}`}
        aria-hidden
      />
      <div className="text-xs font-semibold">
        {current ? "Abierta" : "Cerrada"}
      </div>
    </div>
  );
}

// --- NextChange rebuilt using @github/relative-time-element ---
// IMPORTANT: install dependency once in your project:
//   npm install @github/relative-time-element
// and import it at least once on the client (this file already does).

import "@github/relative-time-element";

export function NextChange({ schedule = defaultSchedule }) {
  const { current, isOpen24x7 } = useScheduleStatus(schedule);

  if (isOpen24x7) {
    return (
      <div className="flex items-center justify-center text-[10px] font-semibold text-green-600">
        Abierta las 24 horas, toda la semana
      </div>
    );
  }

  if (current) {
    // Detectar si el intervalo actual es de ~24 horas
    const THRESH = 23.9 * 3600 * 1000;
    const duration = current.end - current.start;
    const is24h = duration >= THRESH;

    if (is24h) {
      return (
        <div className="flex items-center justify-center text-[10px] font-semibold text-green-600">
          Abierto 24 horas hoy
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center text-[10px] gap-1">
        <span>Cierra</span>
        <relative-time
          datetime={new Date(current.end).toISOString()}
          tense="future"
          format="relative"
          lang="es"
        />
      </div>
    );
  }
}
// --- Default composite export ---
export default function ShopOpenStatus({ schedule = defaultSchedule }) {
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-md text-sm">
      <h3 className="text-lg font-semibold mb-2">Estado de la tienda</h3>

      <div className="mb-3">
        <StoreState schedule={schedule} />
      </div>

      <div className="mb-3">
        <NextChange schedule={schedule} />
      </div>
    </div>
  );
}
