import { Button } from "@repo/ui/button";
import { TypographyH1, TypographyH2, TypographyH3 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { useTranslations } from "next-intl";

export default function ImprintPage() {
  const t = useTranslations("Imprint");

  return (
    <main className="min-h-svh">
      <section className="h-max bg-background scroll-section flex flex-col justify-center py-48 container mx-auto px-[5vw] md:px-6">
        <div className="space-y-8">
          <TypographyH1>{t("title")}</TypographyH1>
          <div className="space-y-8">
            <TypographyH2>{t("companyName")}</TypographyH2>
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <TypographyH3>{t("legalForm")}:</TypographyH3>
                <TypographyParagraph>{t("legalFormValue")}</TypographyParagraph>
              </div>
              <div className="grid gap-1.5">
                <TypographyH3>{t("commercialRegister")}:</TypographyH3>
                <TypographyParagraph>
                  {t("commercialRegisterValue")}
                </TypographyParagraph>
              </div>
              <div className="grid gap-1.5">
                <TypographyH3>{t("vatNumber")}:</TypographyH3>
                <TypographyParagraph>-</TypographyParagraph>
              </div>
              <div className="grid gap-1.5">
                <TypographyH3>{t("supervisoryAuthority")}:</TypographyH3>
                <TypographyParagraph>
                  {t("supervisoryAuthorityValue")}
                </TypographyParagraph>
              </div>
            </div>
            <div className="grid gap-1.5">
              <TypographyH3>{t("contact")}:</TypographyH3>
              <TypographyParagraph>
                Waldhof 7
                <br />
                6300 Zug
                <br />
                Schweiz
              </TypographyParagraph>
            </div>
            <a href="mailto:info@fixapp.ch">
              <Button>{t("email")}: info@fixapp.ch</Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
