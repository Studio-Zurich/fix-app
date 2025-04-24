"use client";
import { Button } from "@repo/ui/button";
import { TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const AboutUsSection = () => {
  const t = useTranslations("AboutUsSection");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const texts = [
    {
      key: "title",
      component: TypographyH2,
      className: "text-center text-[#64d25f]",
      size: "text-4xl",
    },
    {
      key: "description",
      component: TypographyParagraph,
      className: "text-center",
      size: "text-lg",
    },
    {
      key: "description2",
      component: TypographyParagraph,
      className: "text-center",
      size: "text-lg",
    },
    {
      key: "outro",
      component: TypographyParagraph,
      className: "text-center",
      size: "text-lg",
    },
    {
      key: "outro2",
      component: TypographyParagraph,
      className: "text-center",
      size: "text-3xl",
    },
  ];

  return (
    <section ref={containerRef} className="min-h-[600vh] relative">
      <div className="sticky top-0 h-svh flex items-center justify-center">
        <div className="container mx-auto px-[5vw] md:px-6 space-y-8">
          {texts.map((text, index) => {
            const Component = text.component;
            const isLast = index === texts.length - 1;

            if (isLast) {
              return (
                <motion.div
                  key={text.key}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    opacity: useTransform(scrollYProgress, [0.5, 0.6], [0, 1]),
                    y: useTransform(scrollYProgress, [0.5, 0.6], [50, 0]),
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Component className={text.className} size={text.size}>
                    {t(text.key)}
                  </Component>
                  <a
                    href="https://app.fixapp.ch/reports/new-report"
                    target="_blank"
                  >
                    <Button className="mt-8 border border-[#64d25f] shadow-none cursor-pointer bg-[#64d25f] hover:bg-[#64d25f]/90 text-white transition-all duration-300">
                      {t("outroButton")}
                    </Button>
                  </a>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={text.key}
                style={{
                  opacity: useTransform(
                    scrollYProgress,
                    [0, 0.2, 0.5],
                    [0, 1, 0]
                  ),
                  y: useTransform(scrollYProgress, [0, 0.2, 0.5], [50, 0, -50]),
                }}
                transition={{ duration: 0.5 }}
              >
                <Component className={text.className} size={text.size}>
                  {t(text.key)}
                </Component>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
