import type { LifeRecord } from "@/lib/types";

const CURRENT = "life.current.v1";
const ARCHIVE = "life.archive.v1";

function parse(raw: string | null): LifeRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as LifeRecord;
    if (!value || !value.being || !Array.isArray(value.chapters)) return null;
    return value;
  } catch {
    return null;
  }
}

export function loadCurrent(): LifeRecord | null {
  if (typeof sessionStorage === "undefined") return null;
  return parse(sessionStorage.getItem(CURRENT));
}

export function saveCurrent(life: LifeRecord | null) {
  if (life) sessionStorage.setItem(CURRENT, JSON.stringify(life));
  else sessionStorage.removeItem(CURRENT);
}

export function loadArchive(): LifeRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(ARCHIVE) ?? "[]") as LifeRecord[];
    return Array.isArray(value) ? value.filter((item) => item?.being && Array.isArray(item.chapters)) : [];
  } catch {
    return [];
  }
}

export function upsertArchive(life: LifeRecord) {
  const next = [life, ...loadArchive().filter((item) => item.id !== life.id)].slice(0, 24);
  localStorage.setItem(ARCHIVE, JSON.stringify(next));
}

export function removeArchive(id: string) {
  localStorage.setItem(ARCHIVE, JSON.stringify(loadArchive().filter((item) => item.id !== id)));
}
