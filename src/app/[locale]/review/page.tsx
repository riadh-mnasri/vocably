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
import {
  ArrowLeftIcon,
  CheckIcon,
  FlameIcon,
  SparklesIcon,
  TrophyIcon,
  XIcon,
} from "@/components/icons";

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
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-[--color-success]/15 text-[--color-success]">
          <SparklesIcon className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-bold">{t("empty.title")}</h1>
        <p className="text-[--color-muted]">{t("empty.subtitle")}</p>
        <Link
          href="/"
          className="rounded-full bg-[--color-accent] px-6 py-3 font-semibold text-[--color-accent-ink] shadow-md shadow-[--color-accent]/30 transition-transform hover:-translate-y-0.5"
        >
          {t("empty.backHome")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-[--color-accent]/15 text-[--color-accent]">
          <TrophyIcon className="h-8 w-8" />
        </span>
        <h1 className="animate-fade-up text-3xl font-bold">{t("sessionDone.title")}</h1>
        <p className="animate-fade-up text-lg" style={{ animationDelay: "0.05s" }}>
          {t("sessionDone.score", { correct: correctCount, total: queue.length })}
        </p>
        <p
          className="animate-fade-up text-2xl font-semibold text-[--color-success]"
          style={{ animationDelay: "0.1s" }}
        >
          {t("sessionDone.xpEarned", { xp: sessionXp })}
        </p>
        {streakResult !== null && (
          <p
            className="animate-fade-up flex items-center gap-1.5 text-[--color-muted]"
            style={{ animationDelay: "0.15s" }}
          >
            <FlameIcon className="h-4 w-4 text-[--color-accent]" />
            {streakResult > 1
              ? t("sessionDone.streakKept", { count: streakResult })
              : t("sessionDone.streakStarted")}
          </p>
        )}
        <Link
          href="/"
          className="mt-2 rounded-full bg-[--color-accent] px-6 py-3 font-semibold text-[--color-accent-ink] shadow-md shadow-[--color-accent]/30 transition-transform hover:-translate-y-0.5"
        >
          {t("sessionDone.backHome")}
        </Link>
      </div>
    );
  }

  if (!current) return null;

  const progressPct = ((index + (flipped ? 0.5 : 0)) / queue.length) * 100;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-[--color-muted] transition-colors hover:text-[--color-ink]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("back")}
        </Link>
        <span className="text-sm font-medium text-[--color-muted]">
          {t("progress", { current: index + 1, total: queue.length })}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--color-border]">
        <div
          className="h-full rounded-full bg-[--color-accent] transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="card-flip-scene flex min-h-[300px] flex-1">
        <button
          onClick={() => setFlipped((f) => !f)}
          className={`card-flip-card relative w-full flex-1 ${flipped ? "is-flipped" : ""}`}
        >
          <div className="card-flip-face absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-[--color-border] bg-[--color-canvas-raised] p-8 text-center shadow-lg">
            <span className="absolute left-5 top-5 rounded-full bg-[--color-box-3]/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[--color-ink]">
              {current.level}
            </span>
            <span className="text-4xl font-extrabold tracking-tight">{current.en}</span>
          </div>
          <div className="card-flip-face card-flip-face-back absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-[--color-border] bg-[--color-canvas-raised] p-8 text-center shadow-lg">
            <span className="text-3xl font-bold text-[--color-accent]">{current.fr}</span>
            <div className="text-sm text-[--color-muted]">
              <p className="italic">&ldquo;{current.exampleEn}&rdquo;</p>
              <p>{current.exampleFr}</p>
            </div>
          </div>
        </button>
      </div>
      <p className="text-center text-xs text-[--color-muted]">{t("flipHint")}</p>

      {flipped && (
        <div className="animate-pop grid grid-cols-2 gap-4">
          <button
            onClick={() => answer(false)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-[--color-danger] px-4 py-4 font-semibold text-[--color-danger] transition-colors hover:bg-[--color-danger] hover:text-white"
          >
            <XIcon className="h-5 w-5" />
            {t("dontKnow")}
            <span className="text-xs opacity-70">{t("dontKnowHint")}</span>
          </button>
          <button
            onClick={() => answer(true)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-[--color-success] px-4 py-4 font-semibold text-[--color-success] transition-colors hover:bg-[--color-success] hover:text-white"
          >
            <CheckIcon className="h-5 w-5" />
            {t("know")}
            <span className="text-xs opacity-70">{t("knowHint")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
