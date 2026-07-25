import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/locale-switcher";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return {
    title: `${t("brand")} · ${t("tagline")}`,
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("footer");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[--color-canvas] text-[--color-ink]">
        <NextIntlClientProvider>
          <header className="sticky top-0 z-10 border-b border-[--color-border]/60 bg-[--color-canvas]/80 backdrop-blur-md">
            <div className="h-1 bg-hero-gradient" />
            <div className="flex items-center justify-between px-6 py-4 sm:px-10">
              <span className="flex items-center gap-2.5">
                <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md shadow-[--color-accent]/30">
                  V
                </span>
                <span className="text-lg font-bold tracking-tight">Vocably</span>
              </span>
              <LocaleSwitcher locale={locale} />
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="px-6 py-6 text-center text-sm text-[--color-muted] sm:px-10">
            {t("copyright", { year: new Date().getFullYear() })}
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
