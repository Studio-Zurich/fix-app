"use client";

import { cn } from "@repo/ui/lib/utils";
import { TypographyParagraph } from "@repo/ui/text";
import { useAnimate, useInView } from "motion/react";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  text,
  className,
  cursorClassName,
  speed = 50,
}: {
  text: string;
  className?: string;
  cursorClassName?: string;
  speed?: number;
}) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isInView && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isInView, text, speed]);

  return (
    <div className={cn("relative", className)}>
      <div ref={scope} className="whitespace-pre-wrap">
        <TypographyParagraph className="text-background">
          {displayedText}
        </TypographyParagraph>
      </div>
    </div>
  );
};
