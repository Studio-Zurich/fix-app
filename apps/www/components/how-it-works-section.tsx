"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TypographyH2, TypographyH3 } from "@repo/ui/headline";
import { TypographyParagraph, TypographySpan } from "@repo/ui/text";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AnimatedCheckmark } from "./ui/animated-icons";

const HowItWorksSection = () => {
  const t = useTranslations("how-it-works-section");
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: t("steps.step1.title"),
      description: t("steps.step1.description"),
    },
    {
      title: t("steps.step2.title"),
      description: t("steps.step2.description"),
    },
    {
      title: t("steps.step3.title"),
      description: t("steps.step3.description"),
    },
    {
      title: t("steps.step4.title"),
      description: t("steps.step4.description"),
    },
    {
      title: t("steps.step5.title"),
      description: t("steps.step5.description"),
    },
    {
      title: t("steps.step6.title"),
      description: t("steps.step6.description"),
    },
  ];

  return (
    <section
      className="container mx-auto px-[5vw] md:px-6 scroll-mt-32 my-16"
      id="how-it-works"
    >
      <div className="space-y-8">
        <TypographyH2 size="text-4xl">{t("title")}</TypographyH2>
        <div className="relative w-full">
          <div className="absolute inset-0 bg-[#ff781e] rounded-3xl z-0" />

          <div className="absolute top-8 left-6 z-10">
            <TypographySpan className="text-sm text-white">
              Step {activeStep + 1}/{steps.length}
            </TypographySpan>
          </div>

          <div className="absolute bottom-8 left-6 space-y-4 md:space-y-0 z-10">
            {/* Step indicator with animated checkmark for all screens */}
            <div className="text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-center gap-2"
                >
                  <AnimatedCheckmark />
                  <TypographyParagraph size="text-sm text-white">
                    {t(`processFlow.step${activeStep + 1}`)}
                  </TypographyParagraph>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center w-max gap-4">
              <button className="swiper-button-prev">
                <CaretLeft size={24} weight="bold" className="text-white" />
              </button>
              <button className="swiper-button-next">
                <CaretRight size={24} weight="bold" className="text-white" />
              </button>
            </div>
          </div>

          <div className="w-[calc(100vw-10vw)] lg:w-full -ml-[5vw] lg:ml-0">
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
              }}
              className="w-full"
              onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
            >
              {steps.map((step, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-96 w-full px-6 py-8 ml-[5vw] lg:ml-0">
                    <div className="mt-12 space-y-2 text-white relative z-[1] max-w-xl">
                      <TypographyH3 size="text-2xl">{step.title}</TypographyH3>
                      <TypographyParagraph size="text-lg">
                        {step.description}
                      </TypographyParagraph>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-center mt-16">
        <NextLink
          href="https://app.fixapp.ch/reports/new-report"
          target="_blank"
          className="cursor-pointer"
        >
          <Button className="bg-[#ff781e] text-background hover:bg-[#ff781e]/90 w-32 cursor-pointer">
            Report
          </Button>
        </NextLink>
      </div> */}
    </section>
  );
};

export default HowItWorksSection;
