import { routing } from "@/i18n/routing";
import "@repo/ui/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

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

export const metadata: Metadata = {
  title: "Fix App",
  description: "Deine Stadt, Deine Initiative",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Fix App" />
      </head>
      <body
        className={`${brockmannRegular.variable} ${brockmannMedium.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <main className="h-max w-full flex flex-col container mx-auto">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
