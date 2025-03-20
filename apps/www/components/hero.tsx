import HeroImage from "@/public/images/hero.jpg";
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
        <h1 className="text-white text-center text-4xl md:text-6xl font-bold">
          Text Text Text
        </h1>
        <p className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 text-white text-center text-4xl">
          more text here more text here more text here more text here more text
          here more text here more text here here more text here more text here
        </p>
      </div>
    </section>
  );
};

export default Hero;
