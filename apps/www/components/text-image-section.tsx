import Sample from "@/public/images/sample.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import NextImage from "next/image";
import { TypewriterEffectSmooth } from "./typewriter-effect";

const TextImageSection = () => {
  const words = [
    { text: "Ich" },
    { text: "möchte" },
    { text: "gernen" },
    { text: "einen" },
    { text: "umgefallenen" },
    { text: "Baum" },
    { text: "melden." },
  ];
  return (
    <section className="h-full w-full container mx-auto my-16 space-y-8">
      <div className="space-y-4 px-[5vw] md:px-6">
        <h2 className="text-4xl font-bold text-center">Here is the intros</h2>
        <p className="text-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </div>
      <div className="w-[calc(100vw-10vw)] md:w-[calc(100vw-3rem)] h-[50svh] md:h-svh overflow-hidden rounded-3xl mx-[5vw] md:mx-6 relative">
        <NextImage
          src={Sample}
          alt="Text Image Section Test"
          className="w-full h-full object-cover absolute top-0 left-0"
        />
        <div className="relative z-10 h-full w-full p-[5vw] md:p-6">
          <Tabs defaultValue="report" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="check">Check</TabsTrigger>
            </TabsList>
            <TabsContent value="report">
              <div className="flex items-start gap-2">
                <span className="bg-white w-5 h-5 rounded-full block flex-shrink-0 mt-2" />

                <TypewriterEffectSmooth words={words} />
              </div>
            </TabsContent>
            <TabsContent value="check">
              <div className="flex items-start gap-2">
                <span className="bg-white w-5 h-5 rounded-full block flex-shrink-0 mt-2" />
                <p className="text-white text-2xl font-bold text-end">
                  dfsfsdfsdfsdfsdfsdf
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TextImageSection;
