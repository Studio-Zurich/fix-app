import { Section, Text } from "@react-email/components";
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
  const translations = {
    de: {
      imagesUploaded: "Bilder hochgeladen",
      location: "Standort",
    },
    en: {
      imagesUploaded: "Images uploaded",
      location: "Location",
    },
  };

  const t = translations[locale];

  return (
    <Section style={section}>
      <Text style={text}>
        {imageCount} {t.imagesUploaded}
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
