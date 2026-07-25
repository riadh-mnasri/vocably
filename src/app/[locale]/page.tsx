"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { words } from "@/data/words";
import { BOX_COUNT, dateKey, getOrInitWord, isDue } from "@/lib/leitner";
import { useProgress } from "@/lib/use-progress";
import { clearProgress } from "@/lib/storage";
import {
  BoltIcon,
  BookIcon,
  FlameIcon,
  SparklesIcon,
  TrophyIcon,
} from "@/components/icons";

export default function HomePage() {
  const t = useTranslations("home");
  const { progress, ready, update } = useProgress();

  const dueCount = words.filter((w) => isDue(getOrInitWord(progress, w.id))).length;
  const masteredCount = Object.values(progress.words).filter(
    (p) => p.box === BOX_COUNT,
  ).length;
  const reviewsToday = progress.reviewLog[dateKey(new Date())] ?? 0;

  const boxCounts = Array.from({ length: BOX_COUNT }, (_, i) => i + 1).map(
    (box) => ({
      box,
      count: Object.values(progress.words).filter((p) => p.box === box).length,
    }),
  );
  const maxBoxCount = Math.max(1, ...boxCounts.map((b) => b.count));

  function handleReset() {
    if (window.confirm(t("resetConfirm"))) {
      clearProgress();
      update(() => ({
        words: {},
        streak: { count: 0, lastActiveDate: null },
        xp: 0,
        reviewLog: {},
      }));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8 sm:px-10 sm:py-10">
      <section className="bg-hero-gradient animate-fade-up relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl shadow-[--color-accent]/25 sm:p-12">
        <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-black/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative flex flex-col gap-5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 self-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm sm:self-start">
            <SparklesIcon className="h-3.5 w-3.5" />
            {t("subtitle")}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl">
            {t("title")}
          </h1>

          {ready && (
            <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-medium text-white/90">
                {dueCount > 0
                  ? `${t("wordsDue", { count: dueCount })} ${t("wordsDueToday")}`
                  : t("allCaughtUp")}
              </p>
              <Link
                href="/review"
                style={{ color: "var(--color-accent)" }}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-lg font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                {t("startCta")}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          icon={<FlameIcon className="h-5 w-5" />}
          label={t("stats.streak")}
          value={`${progress.streak.count}`}
          unit={t("stats.streakUnit", { count: progress.streak.count })}
          tint="var(--color-accent)"
        />
        <Stat
          icon={<TrophyIcon className="h-5 w-5" />}
          label={t("stats.mastered")}
          value={`${masteredCount}`}
          tint="var(--color-success)"
        />
        <Stat
          icon={<BookIcon className="h-5 w-5" />}
          label={t("stats.totalWords")}
          value={`${words.length}`}
          tint="#4a90c9"
        />
        <Stat
          icon={<BoltIcon className="h-5 w-5" />}
          label={t("stats.reviewsToday")}
          value={`${reviewsToday}`}
          tint="var(--color-accent-2)"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
          {t("boxes.title")}
        </h2>
        <div className="flex items-end gap-3 rounded-3xl border border-[--color-border] bg-[--color-canvas-raised] p-6 shadow-sm sm:gap-5">
          {boxCounts.map(({ box, count }) => (
            <div key={box} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-sm font-bold">{count}</span>
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className="bar-grow w-8 rounded-t-xl shadow-sm sm:w-10"
                  style={{
                    height: `${14 + (count / maxBoxCount) * 86}%`,
                    backgroundColor: `var(--color-box-${box})`,
                  }}
                />
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `var(--color-box-${box})`,
                  color: "var(--color-ink)",
                }}
              >
                {t("boxes.box", { n: box })}
              </span>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleReset}
        className="self-center text-sm text-[--color-muted] underline decoration-dotted transition-colors hover:text-[--color-danger]"
      >
        {t("resetProgress")}
      </button>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  tint: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
      style={{
        borderColor: `color-mix(in srgb, ${tint} 35%, var(--color-border))`,
        backgroundColor: `color-mix(in srgb, ${tint} 10%, var(--color-canvas-raised))`,
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
        style={{ backgroundColor: `color-mix(in srgb, ${tint} 25%, transparent)`, color: tint }}
      >
        {icon}
      </span>
      <span className="text-2xl font-extrabold">{value}</span>
      <span className="text-xs font-medium text-[--color-muted]">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
    </div>
  );
}
