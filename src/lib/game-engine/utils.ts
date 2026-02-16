const MAX_STAT = 100;

export function createId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function clamp(value: number, min = 0, max = MAX_STAT) {
  return Math.max(min, Math.min(max, value));
}

export function clampFloat(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const idx = randomInt(0, pool.length - 1);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

export function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  return shuffled;
}

export function uniqueStrings(items: string[]) {
  return [...new Set(items)];
}
