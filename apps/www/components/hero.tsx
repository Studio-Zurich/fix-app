import HeroImage from "@/public/images/hero.jpg";
import { TypographyH1 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="h-svh w-full">
      <Image
        src={HeroImage}
        alt="Fixapp Hero"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="px-[5vw] md:px-6 flex justify-center items-center h-full w-full relative z-10">
        <TypographyH1 className="text-background">Text Text Text</TypographyH1>
        <TypographyParagraph
          className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 text-white text-center w-full"
          size="text-2xl"
        >
          more text here more text here more text here more text here more text
          here more text here more text here here more text here more text here
        </TypographyParagraph>
      </div>
    </section>
  );
};

export default Hero;
