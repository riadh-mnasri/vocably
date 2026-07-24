"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-[--color-border] bg-[--color-canvas-raised] p-1 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`rounded-full px-3 py-1 transition-colors ${
            loc === locale
              ? "bg-[--color-accent] text-[--color-accent-ink]"
              : "text-[--color-muted] hover:text-[--color-ink]"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
