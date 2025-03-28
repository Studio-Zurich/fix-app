"use client";

import { TypographyH1 } from "@repo/ui/headline";
import { TypographySpan } from "@repo/ui/text";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const Greeting = () => {
  const t = useTranslations();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        return t("components.greeting.morning");
      } else if (hour < 18) {
        return t("components.greeting.day");
      } else {
        return t("components.greeting.night");
      }
    };

    setGreeting(getGreeting());
  }, [t]);

  return (
    <section className="container">
      <TypographySpan size="text-lg" className="block">
        {greeting}
      </TypographySpan>
      <TypographyH1>{t("pages.dashboard.title")}</TypographyH1>
    </section>
  );
};

export default Greeting;
