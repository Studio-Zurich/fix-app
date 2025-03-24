import Sample from "@/public/images/sample.jpg";
import { TypographyH2 } from "@repo/ui/headline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TypographyParagraph } from "@repo/ui/text";
import { useTranslations } from "next-intl";
import NextImage from "next/image";

const TextImageSection = ({ id }: { id: string }) => {
  const t = useTranslations("how-it-works-section");
  return (
    <section
      className="h-full w-full container mx-auto my-16 space-y-8 scroll-mt-32"
      id={id}
    >
      <div className="space-y-4 px-[5vw] md:px-6 text-center">
        <TypographyH2 size="text-4xl">{t("title")}</TypographyH2>
        <TypographyParagraph size="text-lg">
          {t("description")}
        </TypographyParagraph>
      </div>
      <div className="w-full h-96 relative px-[5vw] md:px-6">
        <NextImage
          src={Sample}
          alt="Text Image Section Test"
          className="rounded-3xl object-cover w-full h-full"
        />

        <div className="absolute top-0 left-0 z-10 h-full w-full p-[5vw] md:p-6">
          <Tabs defaultValue="report">
            <div className="flex justify-center items-center">
              <TabsList className="">
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="check">Check</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="report">
              <div className="absolute bottom-[5vw] md:bottom-6 space-y-4">
                test
              </div>
            </TabsContent>
            <TabsContent value="check">
              <div className="absolute bottom-[5vw] md:bottom-6 space-y-4">
                test 2
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TextImageSection;
