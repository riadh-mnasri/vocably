"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { words, type Word } from "@/data/words";
import {
  getOrInitWord,
  isDue,
  logReview,
  reviewWord,
  touchStreak,
  xpForAnswer,
} from "@/lib/leitner";
import { useProgress } from "@/lib/use-progress";

export default function ReviewPage() {
  const t = useTranslations("review");
  const { progress, ready, update } = useProgress();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [done, setDone] = useState(false);
  const [streakResult, setStreakResult] = useState<number | null>(null);

  const [queue, setQueue] = useState<Word[] | null>(null);
  if (ready && queue === null) {
    setQueue(words.filter((w) => isDue(getOrInitWord(progress, w.id))));
  }

  const current = queue && !done ? queue[index] : null;

  const answer = useMemo(
    () => (correct: boolean) => {
      if (!current) return;
      update((prev) => {
        const prevWordProgress = getOrInitWord(prev, current.id);
        const nextWordProgress = reviewWord(prevWordProgress, correct);
        const nextStreak = touchStreak(prev.streak);
        setStreakResult(nextStreak.count);
        return {
          ...prev,
          words: { ...prev.words, [current.id]: nextWordProgress },
          streak: nextStreak,
          xp: prev.xp + xpForAnswer(correct),
          reviewLog: logReview(prev.reviewLog),
        };
      });
      setSessionXp((xp) => xp + xpForAnswer(correct));
      if (correct) setCorrectCount((c) => c + 1);

      setFlipped(false);
      if (queue && index + 1 < queue.length) {
        setIndex((i) => i + 1);
      } else {
        setDone(true);
      }
    },
    [current, index, queue, update],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current || done) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.code === "ArrowRight") {
        answer(true);
      } else if (flipped && e.code === "ArrowLeft") {
        answer(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, done, flipped, answer]);

  if (!ready || queue === null) {
    return <div className="flex-1" />;
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">{t("empty.title")}</h1>
        <p className="text-[--color-muted]">{t("empty.subtitle")}</p>
        <Link
          href="/"
          className="rounded-full bg-[--color-accent] px-6 py-3 font-semibold text-[--color-accent-ink]"
        >
          {t("empty.backHome")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className="text-3xl font-bold">{t("sessionDone.title")}</h1>
        <p className="text-lg">
          {t("sessionDone.score", { correct: correctCount, total: queue.length })}
        </p>
        <p className="text-2xl font-semibold text-[--color-success]">
          {t("sessionDone.xpEarned", { xp: sessionXp })}
        </p>
        {streakResult !== null && (
          <p className="text-[--color-muted]">
            {streakResult > 1
              ? t("sessionDone.streakKept", { count: streakResult })
              : t("sessionDone.streakStarted")}
          </p>
        )}
        <Link
          href="/"
          className="mt-4 rounded-full bg-[--color-accent] px-6 py-3 font-semibold text-[--color-accent-ink]"
        >
          {t("sessionDone.backHome")}
        </Link>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[--color-muted] hover:text-[--color-ink]">
          ← {t("back")}
        </Link>
        <span className="text-sm text-[--color-muted]">
          {t("progress", { current: index + 1, total: queue.length })}
        </span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-[--color-border] bg-[--color-canvas-raised] p-8 text-center shadow-sm transition-transform active:scale-[0.99]"
      >
        {!flipped ? (
          <span className="text-4xl font-bold tracking-tight">{current.en}</span>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-3xl font-bold text-[--color-accent]">
              {current.fr}
            </span>
            <div className="text-sm text-[--color-muted]">
              <p className="italic">&ldquo;{current.exampleEn}&rdquo;</p>
              <p>{current.exampleFr}</p>
            </div>
          </div>
        )}
      </button>
      <p className="text-center text-xs text-[--color-muted]">{t("flipHint")}</p>

      {flipped && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => answer(false)}
            className="rounded-2xl border-2 border-[--color-danger] px-4 py-4 font-semibold text-[--color-danger] transition-colors hover:bg-[--color-danger] hover:text-white"
          >
            {t("dontKnow")}
            <span className="mt-1 block text-xs opacity-70">{t("dontKnowHint")}</span>
          </button>
          <button
            onClick={() => answer(true)}
            className="rounded-2xl border-2 border-[--color-success] px-4 py-4 font-semibold text-[--color-success] transition-colors hover:bg-[--color-success] hover:text-white"
          >
            {t("know")}
            <span className="mt-1 block text-xs opacity-70">{t("knowHint")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
