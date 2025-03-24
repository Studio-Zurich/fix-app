"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { TypographyH2, TypographyH3 } from "@repo/ui/headline";
import { TypographyParagraph, TypographySpan } from "@repo/ui/text";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
const ProcessFlow = ({ activeStep, t }: { activeStep: number; t: any }) => (
  <div className="relative p-8 bg-[#ff781e]/20 rounded-3xl h-full">
    <TypographyH3 size="text-xl font-semibold mb-4">
      {t("processFlow.title")}
    </TypographyH3>
    <TypographyParagraph size="text-sm">
      {t("processFlow.description")}
    </TypographyParagraph>
    <div className="relative">
      <div
        className="absolute left-6 top-6 w-0.5 bg-[#ff781e] transition-all duration-300"
        style={{
          height: `${(activeStep / 2) * 80}%`,
        }}
      />
      <div className="flex flex-col justify-between mt-8 space-y-8">
        {[1, 2, 3].map((stepNum, index) => (
          <div
            key={index}
            className={`relative flex items-center transition-colors duration-300 ${
              index > activeStep ? "opacity-50" : ""
            }`}
          >
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                transition-colors duration-300
                ${index <= activeStep ? "bg-[#ff781e] text-white" : "bg-[#ff781e]/20 text-gray-600"}
              `}
            >
              {stepNum}
            </div>
            <div className="ml-4 py-2 px-4 rounded-full">
              <TypographySpan
                size="text-base"
                className={index <= activeStep ? "" : "text-gray-600"}
              >
                {t(`processFlow.step${stepNum}`)}
              </TypographySpan>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
  ];

  return (
    <section
      className="container mx-auto px-[5vw] md:px-6 scroll-mt-32 my-16"
      id="how-it-works"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TypographyH2 size="text-4xl">{t("title")}</TypographyH2>
          <div className="relative w-full">
            <div className="absolute inset-0 bg-[#ff781e] rounded-3xl z-0" />

            <div className="absolute top-8 left-6 z-10">
              <TypographySpan className="text-sm text-white">
                Step {activeStep + 1}/{steps.length}
              </TypographySpan>
            </div>

            <div className="absolute bottom-8 left-6 flex justify-between items-center gap-4 z-10">
              <button className="swiper-button-prev">
                <CaretLeft size={24} weight="bold" className="text-white" />
              </button>
              <button className="swiper-button-next">
                <CaretRight size={24} weight="bold" className="text-white" />
              </button>
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
                        <TypographyH3 size="text-2xl">
                          {step.title}
                        </TypographyH3>
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
        <ProcessFlow activeStep={activeStep} t={t} />
      </div>
      <div className="flex justify-center mt-16">
        <NextLink
          href="https://app.fixapp.ch"
          target="_blank"
          className="cursor-pointer"
        >
          <Button className="w-32 cursor-pointer">Report</Button>
        </NextLink>
      </div>
    </section>
  );
};

export default HowItWorksSection;
