"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createEmptyProgress, type ProgressState } from "./leitner";
import { loadProgress, saveProgress } from "./storage";

const EMPTY_PROGRESS = createEmptyProgress();
const listeners = new Set<() => void>();
let cached: ProgressState | null = null;

function getSnapshot(): ProgressState {
  if (!cached) cached = loadProgress();
  return cached;
}

function getServerSnapshot(): ProgressState {
  return EMPTY_PROGRESS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = progress !== EMPTY_PROGRESS;

  const update = useCallback((updater: (prev: ProgressState) => ProgressState) => {
    cached = updater(cached ?? loadProgress());
    saveProgress(cached);
    emitChange();
  }, []);

  return { progress, ready, update };
}
