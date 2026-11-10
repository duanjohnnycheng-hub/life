export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error("empty pick");
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))]!;
}

export function pickWeighted<T>(items: readonly T[], weight: (item: T) => number, rng: Rng): T {
  if (items.length === 0) throw new Error("empty weighted pick");
  let total = 0;
  for (const item of items) total += Math.max(0, weight(item));
  if (!(total > 0)) return items[0]!;
  let r = rng() * total;
  for (const item of items) {
    r -= Math.max(0, weight(item));
    if (r <= 0) return item;
  }
  return items[items.length - 1]!;
}

export function freshSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! || 1;
}
