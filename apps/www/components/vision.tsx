"use client";

import { Button } from "@repo/ui/button";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useRef, useState } from "react";

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-3 relative">
      {children}
    </motion.span>
  );
};

const Vision = () => {
  const t = useTranslations("AboutUsSection");
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawScrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"],
  });

  const scrollYProgress = useTransform(rawScrollYProgress, [0.5, 1], [0, 1]);

  // Create a state to track when to show the button
  const [showButton, setShowButton] = useState(false);

  // Update the button visibility based on scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (latest >= 0.95) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const text = t("description");
  const words = text.split(" ");

  const text2 = t("description2");
  const words2 = text2.split(" ");

  const outroText = t("outro");
  const outroWords = outroText.split(" ");

  const outro2Text = t("outro2");
  const outro2Words = outro2Text.split(" ");

  // Calculate total words for proper sequencing
  const totalWords =
    words.length + words2.length + outroWords.length + outro2Words.length;

  // Calculate starting indices for each section
  const words2StartIndex = words.length;
  const outroStartIndex = words.length + words2.length;
  const outro2StartIndex = words.length + words2.length + outroWords.length;

  return (
    <section
      id="vision"
      ref={targetRef}
      className="h-max bg-background scroll-section flex flex-col justify-center py-48 md:py-64 px-[5vw] md:px-6"
      data-section-theme="dark"
    >
      <div className="flex flex-col md:flex-row gap-8 text-center">
        <div className="w-full text-center">
          <div className="max-w-4xl mx-auto">
            <div className="leading-tight text-foreground text-center text-2xl lg:text-3xl">
              <div className="flex flex-wrap justify-center">
                {words.map((word, i) => {
                  const start = i / totalWords;
                  const end = (i + 1) / totalWords;
                  return (
                    <Word
                      key={i}
                      progress={scrollYProgress}
                      range={[start, end]}
                    >
                      {word}
                    </Word>
                  );
                })}
              </div>
            </div>

            <div className="leading-tight text-foreground text-center text-2xl lg:text-3xl mt-8">
              <div className="flex flex-wrap justify-center">
                {words2.map((word, i) => {
                  const start = (words2StartIndex + i) / totalWords;
                  const end = (words2StartIndex + i + 1) / totalWords;
                  return (
                    <Word
                      key={i}
                      progress={scrollYProgress}
                      range={[start, end]}
                    >
                      {word}
                    </Word>
                  );
                })}
              </div>
            </div>

            <div className="leading-tight text-foreground text-center text-2xl lg:text-3xl mt-8">
              <div className="flex flex-wrap justify-center">
                {outroWords.map((word, i) => {
                  const start = (outroStartIndex + i) / totalWords;
                  const end = (outroStartIndex + i + 1) / totalWords;
                  return (
                    <Word
                      key={i}
                      progress={scrollYProgress}
                      range={[start, end]}
                    >
                      {word}
                    </Word>
                  );
                })}
              </div>
            </div>

            <div className="leading-tight text-foreground text-center text-2xl lg:text-3xl mt-8">
              <div className="flex flex-wrap justify-center">
                {outro2Words.map((word, i) => {
                  const start = (outro2StartIndex + i) / totalWords;
                  const end = (outro2StartIndex + i + 1) / totalWords;
                  return (
                    <Word
                      key={i}
                      progress={scrollYProgress}
                      range={[start, end]}
                    >
                      {word}
                    </Word>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showButton ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a href="https://app.fixapp.ch/reports/new-report" target="_blank">
            <Button className="border border-[#ff781e] shadow-none cursor-pointer bg-[#ff781e] hover:bg-[#ff781e]/90 text-white transition-all duration-300">
              {t("outroButton")}
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Vision;
