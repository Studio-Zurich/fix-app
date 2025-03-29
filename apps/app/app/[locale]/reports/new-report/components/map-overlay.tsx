"use client";

import { MapOverlayProps } from "@/lib/types";
import { ArrowsOutCardinal } from "@phosphor-icons/react";
import { TypographySpan } from "@repo/ui/text";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MapOverlay({ onInteraction, text }: MapOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 backdrop-blur-xs w-full h-full z-10 flex flex-col justify-center items-center space-y-4 p-6 text-center"
        >
          <ArrowsOutCardinal size={48} />
          <TypographySpan className="block font-regular" size="text-lg">
            {text}
          </TypographySpan>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
