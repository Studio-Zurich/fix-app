import { Section, Text } from "@react-email/components";
import { EmailProps } from "../../../apps/app/lib/types";

type ReportOverviewProps = Pick<EmailProps, "imageCount" | "locale">;

export const ReportOverview = ({ imageCount, locale }: ReportOverviewProps) => {
  return (
    <Section style={section}>
      <Text style={text}>{imageCount} TRANSLATION hochgeladen</Text>
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
