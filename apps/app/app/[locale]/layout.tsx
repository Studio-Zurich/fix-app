import { routing } from "@/i18n/routing";
import "@repo/ui/globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { Toaster } from "@repo/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
const brockmannRegular = localFont({
  src: "./../fonts/brockmann-regular.woff2",
  variable: "--font-brockmann-regular",
});

const brockmannMedium = localFont({
  src: "./../fonts/brockmann-medium.woff2",
  variable: "--font-brockmann-medium",
});

const brockmannSemiBold = localFont({
  src: "./../fonts/brockmann-semibold.woff2",
  variable: "--font-brockmann-semibold",
});

const brockmannBold = localFont({
  src: "./../fonts/brockmann-bold.woff2",
  variable: "--font-brockmann-bold",
});

export const metadata: Metadata = {
  title: "FIX App",
  description: "Deine Stadt, Deine Initiative",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-title" content="FIX App" />
      </head>
      <body
        className={`${brockmannRegular.variable} ${brockmannMedium.variable} ${brockmannSemiBold.variable} ${brockmannBold.variable} antialiased`}
      >
        <Toaster />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
