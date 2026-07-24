export const BOX_COUNT = 5;
const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16];

export type WordProgress = {
  box: number;
  dueAt: string;
  reviewCount: number;
  correctCount: number;
};

export type ProgressState = {
  words: Record<string, WordProgress>;
  streak: { count: number; lastActiveDate: string | null };
  xp: number;
  reviewLog: Record<string, number>;
};

export function createEmptyProgress(): ProgressState {
  return {
    words: {},
    streak: { count: 0, lastActiveDate: null },
    xp: 0,
    reviewLog: {},
  };
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function logReview(
  reviewLog: ProgressState["reviewLog"],
  now = new Date(),
): ProgressState["reviewLog"] {
  const today = dateKey(now);
  return { ...reviewLog, [today]: (reviewLog[today] ?? 0) + 1 };
}

export function getOrInitWord(state: ProgressState, wordId: string): WordProgress {
  return (
    state.words[wordId] ?? {
      box: 1,
      dueAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    }
  );
}

export function isDue(progress: WordProgress, now = new Date()): boolean {
  return new Date(progress.dueAt).getTime() <= now.getTime();
}

export function reviewWord(
  progress: WordProgress,
  correct: boolean,
  now = new Date(),
): WordProgress {
  const nextBox = correct ? Math.min(progress.box + 1, BOX_COUNT) : 1;
  const intervalDays = BOX_INTERVAL_DAYS[nextBox - 1];
  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    box: nextBox,
    dueAt: dueAt.toISOString(),
    reviewCount: progress.reviewCount + 1,
    correctCount: progress.correctCount + (correct ? 1 : 0),
  };
}

export function touchStreak(
  streak: ProgressState["streak"],
  now = new Date(),
): ProgressState["streak"] {
  const today = dateKey(now);
  if (streak.lastActiveDate === today) return streak;

  const yesterday = dateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const continued = streak.lastActiveDate === yesterday;

  return {
    count: continued ? streak.count + 1 : 1,
    lastActiveDate: today,
  };
}

export function xpForAnswer(correct: boolean): number {
  return correct ? 10 : 2;
}
