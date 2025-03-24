import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import { TypographyH2, TypographyH3 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { useTranslations } from "next-intl";

const FaqSection = () => {
  const t = useTranslations("FaqSection");

  return (
    <section className="container mx-auto px-[5vw] md:px-6 py-16 space-y-8">
      <TypographyH2 className="text-center">{t("title")}</TypographyH2>
      <Accordion type="single" collapsible className="space-y-4">
        {t
          .raw("items")
          .map((item: { question: string; answer: string }, index: number) => (
            <AccordionItem key={`faq-${index}`} value={`item-${index + 1}`}>
              <AccordionTrigger className="rounded-full">
                <TypographyH3 size="text-sm text-start md:text-lg">
                  {item.question}
                </TypographyH3>
              </AccordionTrigger>
              <AccordionContent>
                <TypographyParagraph size="text-sm">
                  {item.answer}
                </TypographyParagraph>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </section>
  );
};

export default FaqSection;
