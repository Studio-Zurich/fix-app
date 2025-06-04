import { Button } from "@repo/ui/button";
import { TypographyH1, TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { useTranslations } from "next-intl";

export default function DataPrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <main className="min-h-svh">
      <section className="h-max bg-background scroll-section flex flex-col justify-center py-48 container mx-auto px-[5vw] md:px-6">
        <div className="space-y-8">
          <TypographyH1 className="break-words hyphens-auto">
            {t("title")}
          </TypographyH1>

          {/* Responsible Party */}
          <div className="space-y-4">
            <TypographyH2>{t("responsibleParty.title")}</TypographyH2>
            <div className="grid gap-1.5">
              <TypographyParagraph>
                {t("responsibleParty.companyName")}
                <br />
                {t("responsibleParty.address")}
                <br />
                {t("responsibleParty.city")}
                <br />
                {t("responsibleParty.country")}
              </TypographyParagraph>
              <TypographyParagraph>
                {t("responsibleParty.email")}:{" "}
                {t("responsibleParty.emailValue")}
                <br />
                {t("responsibleParty.website")}:{" "}
                {t("responsibleParty.websiteValue")}
              </TypographyParagraph>
            </div>
          </div>

          {/* General Information */}
          <div className="space-y-4">
            <TypographyH2>{t("generalInfo.title")}</TypographyH2>
            <TypographyParagraph>
              {t("generalInfo.content")}
            </TypographyParagraph>
          </div>

          {/* Data Collection */}
          <div className="space-y-4">
            <TypographyH2>{t("dataCollection.title")}</TypographyH2>
            <TypographyParagraph>
              {t("dataCollection.intro")}
            </TypographyParagraph>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <TypographyParagraph>
                  {t("dataCollection.activities.website")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.activities.service")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.activities.contact")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.activities.services")}
                </TypographyParagraph>
              </li>
            </ul>
            <TypographyParagraph>
              {t("dataCollection.dataTypes.intro")}
            </TypographyParagraph>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.name")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.email")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.phone")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.ip")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.location")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataCollection.dataTypes.usage")}
                </TypographyParagraph>
              </li>
            </ul>
          </div>

          {/* Purpose of Processing */}
          <div className="space-y-4">
            <TypographyH2>{t("purpose.title")}</TypographyH2>
            <TypographyParagraph>{t("purpose.intro")}</TypographyParagraph>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <TypographyParagraph>
                  {t("purpose.items.services")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("purpose.items.communication")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("purpose.items.reporting")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("purpose.items.analysis")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("purpose.items.legal")}
                </TypographyParagraph>
              </li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div className="space-y-4">
            <TypographyH2>{t("dataSharing.title")}</TypographyH2>
            <TypographyParagraph>{t("dataSharing.intro")}</TypographyParagraph>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <TypographyParagraph>
                  {t("dataSharing.recipients.serviceProviders")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataSharing.recipients.clients")}
                </TypographyParagraph>
              </li>
              <li>
                <TypographyParagraph>
                  {t("dataSharing.recipients.authorities")}
                </TypographyParagraph>
              </li>
            </ul>
          </div>

          {/* International Transfer */}
          <div className="space-y-4">
            <TypographyH2>{t("internationalTransfer.title")}</TypographyH2>
            <TypographyParagraph>
              {t("internationalTransfer.content")}
            </TypographyParagraph>
          </div>

          {/* Cookies */}
          <div className="space-y-4">
            <TypographyH2>{t("cookies.title")}</TypographyH2>
            <TypographyParagraph>{t("cookies.content")}</TypographyParagraph>
          </div>

          {/* Storage Duration */}
          <div className="space-y-4">
            <TypographyH2>{t("storageDuration.title")}</TypographyH2>
            <TypographyParagraph>
              {t("storageDuration.content")}
            </TypographyParagraph>
          </div>

          {/* Your Rights */}
          <div className="space-y-4">
            <TypographyH2>{t("rights.title")}</TypographyH2>
            <TypographyParagraph>{t("rights.content")}</TypographyParagraph>
          </div>

          {/* Changes */}
          <div className="space-y-4">
            <TypographyH2>{t("changes.title")}</TypographyH2>
            <TypographyParagraph>{t("changes.content")}</TypographyParagraph>
          </div>

          {/* Original company info section */}
          <div className="space-y-8 text-center">
            <a href="mailto:info@fixapp.ch">
              <Button>{t("email")}: info@fixapp.ch</Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
