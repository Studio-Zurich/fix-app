import { Section, Text } from "@react-email/components";
import messages from "@repo/translations/messages";
import { EmailProps } from "../../../apps/app/lib/types";

type ReportOverviewProps = Pick<
  EmailProps,
  "imageCount" | "locale" | "location"
>;

export const ReportOverview = ({
  imageCount,
  locale,
  location,
}: ReportOverviewProps) => {
  const t = messages[locale].components.reportOverview;

  return (
    <Section style={section}>
      <Text style={text}>
        {imageCount === 1 ? t.image : t.images} {t.imagesUploaded}
      </Text>
      {location && (
        <Text style={text}>
          {t.location}: {location}
        </Text>
      )}
    </Section>
  );
};

const section = {
  padding: "0 20px",
  marginTop: "20px",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 10px",
};
