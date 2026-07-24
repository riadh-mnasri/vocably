import { createEmptyProgress, type ProgressState } from "./leitner";

const STORAGE_KEY = "vocably:progress:v1";

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return createEmptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      words: parsed.words ?? {},
      streak: parsed.streak ?? { count: 0, lastActiveDate: null },
      xp: parsed.xp ?? 0,
      reviewLog: parsed.reviewLog ?? {},
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
