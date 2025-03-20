import Sample from "@/public/images/sample.jpg";
import { TypographyH2 } from "@repo/ui/headline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TypographyParagraph } from "@repo/ui/text";
import NextImage from "next/image";
import { TypewriterEffect } from "./typewriter-effect";
import { AnimatedCamera, AnimatedLogo } from "./ui/animated-icons";

const TextImageSection = () => {
  return (
    <section className="h-full w-full container mx-auto my-16 space-y-8">
      <div className="space-y-4 px-[5vw] md:px-6">
        <TypographyH2>Here is the intros</TypographyH2>
        <TypographyParagraph>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </TypographyParagraph>
      </div>
      <div className="w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)] h-[50svh] md:h-svh overflow-hidden rounded-3xl mx-[5vw] md:mx-6 relative">
        <NextImage
          src={Sample}
          alt="Text Image Section Test"
          className="w-full h-full object-cover absolute top-0 left-0"
        />
        <div className="relative z-10 h-full w-full p-[5vw] md:p-6">
          <Tabs defaultValue="report">
            <div className="flex justify-center items-center">
              <TabsList className="">
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="check">Check</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="report">
              <div className="absolute bottom-[5vw] md:bottom-6 space-y-4">
                <div className="flex justify-start items-start gap-2 w-full">
                  <AnimatedCamera />

                  <TypewriterEffect
                    text="This is a long text that will wrap naturally across multiple lines while maintaining the typewriter effect."
                    speed={50}
                  />
                </div>
                <div className="flex justify-start items-start gap-2 w-full">
                  <AnimatedLogo />

                  <TypewriterEffect
                    text="Thank you we go it from here"
                    speed={50}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="check">empty</TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TextImageSection;
