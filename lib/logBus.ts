"use client";

export type LogEntry = {
  id: number;
  at: number;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  host: string;
  path: string;
  status: number;
  latencyMs: number;
  bytes: number;
  platform?: string;
  note?: string;
};

type Listener = (entry: LogEntry) => void;

const listeners = new Set<Listener>();
let counter = 0;

export function subscribeLog(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitLog(entry: Omit<LogEntry, "id" | "at">) {
  const full: LogEntry = { ...entry, id: ++counter, at: Date.now() };
  for (const l of listeners) l(full);
  return full;
}
