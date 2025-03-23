"use client";
import HeroImage from "@/public/images/hero.jpg";
import { TypographyH1 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TypewriterEffect } from "./typewriter-effect";
import { AnimatedCheckmark } from "./ui/animated-icons";

const Hero = () => {
  const t = useTranslations("heroPage");
  const [showCheck, setShowCheck] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const examples = t.raw("examples") as string[];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCheck(true);
      setTimeout(() => {
        setShowCheck(false);
        setCurrentTextIndex((prev) => (prev + 1) % examples.length);
      }, 3000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentTextIndex, examples.length]);

  return (
    <section className="h-svh w-full">
      <Image
        src={HeroImage}
        alt="Fixapp Hero"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="px-[5vw] md:px-6 flex flex-col justify-center items-center h-full w-full relative z-10">
        <TypographyH1 className="text-background text-center mb-8">
          {t("title")}
        </TypographyH1>
        <div className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 text-white text-center w-full max-w-[calc(100vw-10vw)] md:max-w-1/2">
          <AnimatePresence mode="wait">
            {!showCheck ? (
              <motion.div
                key={`typewriter-${currentTextIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TypewriterEffect
                  text={examples[currentTextIndex]}
                  speed={50}
                />
              </motion.div>
            ) : (
              <motion.div
                key="check"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-2"
              >
                <AnimatedCheckmark />
                <TypographyParagraph size="text-xl">
                  {t("reported")}
                </TypographyParagraph>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Hero;
