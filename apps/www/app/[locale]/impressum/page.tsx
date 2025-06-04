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
          <TypographyH1 className="break-words hyphens-auto">
            {t("title")}
          </TypographyH1>

          {/* Company */}
          <div className="space-y-4">
            <TypographyH2>{t("company.title")}</TypographyH2>
            <TypographyParagraph>
              {t("company.name")}
              <br />
              {t("company.address")}
              <br />
              {t("company.city")}
              <br />
              {t("company.country")}
            </TypographyParagraph>
          </div>

          {/* Authorized Representatives */}
          <div className="space-y-4">
            <TypographyH2>{t("representatives.title")}</TypographyH2>
            <div className="space-y-2">
              <TypographyParagraph>
                {t("representatives.ceo")}: {t("representatives.ceoName")}
              </TypographyParagraph>
              <TypographyParagraph>
                {t("representatives.cto")}: {t("representatives.ctoName")}
              </TypographyParagraph>
            </div>
          </div>

          {/* Commercial Register */}
          <div className="space-y-4">
            <TypographyH2>{t("register.title")}</TypographyH2>
            <TypographyParagraph>
              {t("register.uid")}: {t("register.uidValue")}
            </TypographyParagraph>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <TypographyH2>{t("contact.title")}</TypographyH2>
            <div className="space-y-2">
              <TypographyParagraph>
                {t("contact.phone")}: {t("contact.phoneValue")}
              </TypographyParagraph>
              <TypographyParagraph>
                {t("contact.email")}: {t("contact.emailValue")}
              </TypographyParagraph>
              <TypographyParagraph>
                {t("contact.web")}: {t("contact.webValue")}
              </TypographyParagraph>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <TypographyH2>{t("disclaimer.title")}</TypographyH2>

            {/* Content Disclaimer */}
            <div className="space-y-2">
              <TypographyH3>{t("disclaimer.content.title")}</TypographyH3>
              <TypographyParagraph>
                {t("disclaimer.content.text")}
              </TypographyParagraph>
            </div>

            {/* External Links */}
            <div className="space-y-2">
              <TypographyH3>{t("disclaimer.externalLinks.title")}</TypographyH3>
              <TypographyParagraph>
                {t("disclaimer.externalLinks.text")}
              </TypographyParagraph>
            </div>

            {/* Copyright */}
            <div className="space-y-2">
              <TypographyH3>{t("disclaimer.copyright.title")}</TypographyH3>
              <TypographyParagraph>
                {t("disclaimer.copyright.text")}
              </TypographyParagraph>
            </div>

            {/* Changes and Errors */}
            <div className="space-y-2">
              <TypographyH3>{t("disclaimer.changes.title")}</TypographyH3>
              <TypographyParagraph>
                {t("disclaimer.changes.text")}
              </TypographyParagraph>
            </div>
          </div>

          {/* Contact Button */}
          <div className="text-center">
            <a href="mailto:info@fixapp.ch">
              <Button>{t("contact.email")}: info@fixapp.ch</Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
