import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import messages from "@repo/translations/messages";
import { EmailProps } from "../../../archiv/old-app/lib/types";

import { ReportOverview } from "./report-overview";

const defaultProps: EmailProps = {
  imageCount: 0,
  locale: "de",
  reportId: "",
};

export const ReportEmail = ({
  imageCount = defaultProps.imageCount,
  locale = defaultProps.locale,
  location,
  incidentType,
  description,
  userData,
}: EmailProps) => {
  const t = messages[locale].mails.internal;

  return (
    <Html>
      <Head />
      <Preview>{t.subject}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>
              {t.title}
              <br />
              {t.newReport}
            </Heading>

            <Section style={section}>
              <ReportOverview
                imageCount={imageCount}
                locale={locale}
                location={location}
                incidentType={incidentType}
                description={description}
                userData={userData}
              />
            </Section>
          </Section>

          <Text style={footer}>
            info@fixapp.ch <br />© {new Date().getFullYear()} | Fix App |
            www.fixapp.ch
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReportEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const content = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 0",
  borderRadius: "5px",
  border: "1px solid #e9e9e9",
};

const header = {
  fontSize: "24px",
  lineHeight: "30px",
  textAlign: "center" as const,
  padding: "0 20px",
};

const section = {
  padding: "0 20px",
  marginTop: "20px",
};

const sectionHeader = {
  fontSize: "20px",
  lineHeight: "24px",
  marginBottom: "10px",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
