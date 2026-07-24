"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { words } from "@/data/words";
import { BOX_COUNT, dateKey, getOrInitWord, isDue } from "@/lib/leitner";
import { useProgress } from "@/lib/use-progress";
import { clearProgress } from "@/lib/storage";

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-10 sm:px-10">
      <section className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-lg text-[--color-muted]">{t("subtitle")}</p>
      </section>

      {ready && (
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-[--color-border] bg-[--color-canvas-raised] p-8 text-center">
          <p className="text-xl font-semibold">
            {dueCount > 0
              ? `${t("wordsDue", { count: dueCount })} ${t("wordsDueToday")}`
              : t("allCaughtUp")}
          </p>
          <Link
            href="/review"
            className="rounded-full bg-[--color-accent] px-8 py-3 text-lg font-semibold text-[--color-accent-ink] shadow-sm transition-transform hover:scale-105"
          >
            {t("startCta")}
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t("stats.streak")} value={`${progress.streak.count}`} unit={t("stats.streakUnit", { count: progress.streak.count })} />
        <Stat label={t("stats.mastered")} value={`${masteredCount}`} />
        <Stat label={t("stats.totalWords")} value={`${words.length}`} />
        <Stat label={t("stats.reviewsToday")} value={`${reviewsToday}`} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
          {t("boxes.title")}
        </h2>
        <div className="flex items-end gap-3 rounded-2xl border border-[--color-border] bg-[--color-canvas-raised] p-6">
          {boxCounts.map(({ box, count }) => (
            <div key={box} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${8 + (count / maxBoxCount) * 80}px`,
                  backgroundColor: `var(--color-box-${box})`,
                }}
              />
              <span className="text-xs text-[--color-muted]">{count}</span>
              <span className="text-xs text-[--color-muted]">
                {t("boxes.box", { n: box })}
              </span>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleReset}
        className="self-center text-sm text-[--color-muted] underline decoration-dotted hover:text-[--color-danger]"
      >
        {t("resetProgress")}
      </button>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-[--color-border] bg-[--color-canvas-raised] p-4 text-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-[--color-muted]">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
    </div>
  );
}
