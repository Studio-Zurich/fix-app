import { EmailProps } from "@/lib/types";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { ReportOverview } from "./report-overview";

export const ReportEmail = ({
  imageCount = 0,
  locale = "de",
  reportId,
  location,
  incidentType,
  description,
  userData,
}: EmailProps) => {
  const reportUrl = `https://app.fixapp.ch/${locale}/reports/${reportId}`;

  return (
    <Html>
      <Head />
      <Preview>Your Report Has Been Received</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>
              Thank You For Your Report
              <br />#{reportId}
            </Heading>
            <Section style={thankYouSection}>
              <Text style={text}>
                Thank you for submitting your report and helping us make our
                city better.
              </Text>
              <Text style={text}>We will review it as soon as possible.</Text>
            </Section>
            <Section style={section}>
              <ReportOverview
                imageCount={imageCount}
                locale={locale}
                location={location}
                incidentType={incidentType}
                description={description}
                userData={userData}
              />
              <Section style={buttonSection}>
                <Button
                  href={reportUrl}
                  style={button}
                  className="dark:bg-white dark:text-black"
                >
                  View Your Report
                </Button>
              </Section>
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

const thankYouSection = {
  padding: "0 20px",
  marginTop: "20px",
  textAlign: "center" as const,
};

const buttonSection = {
  padding: "0 20px",
  marginTop: "20px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  dark: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  margin: "16px auto",
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
