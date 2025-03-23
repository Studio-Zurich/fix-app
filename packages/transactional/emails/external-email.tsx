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
import { messages } from "./messages";

interface ReportEmailProps {
  reportId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  description: string;
  imageCount: number;
  incidentType: {
    name: string;
    subtype?: string;
  };
  locale: "de" | "en";
}

// Use environment variables type-safely
declare const process: {
  env: {
    NEXT_PUBLIC_APP_URL: string;
  };
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fix-app.ch";

const defaultProps = {
  reportId: "#000000",
  reporterName: "Unknown",
  reporterEmail: "no-email@provided.com",
  location: {
    address: "No address provided",
    lat: 0,
    lng: 0,
  },
  description: "No description provided",
  imageCount: 0,
  incidentType: {
    name: "Unknown",
  },
} as const;

export const ReportEmail = ({
  reportId = defaultProps.reportId,
  reporterName = defaultProps.reporterName,
  reporterEmail = defaultProps.reporterEmail,
  reporterPhone,
  location = defaultProps.location,
  description = defaultProps.description,
  imageCount = defaultProps.imageCount,
  incidentType = defaultProps.incidentType,
  locale = "de",
}: ReportEmailProps) => {
  const safeLocation = location || defaultProps.location;
  const t = messages[locale];

  return (
    <Html>
      <Head />
      <Preview>{t.ConfirmPage.title}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>
              Fixapp.ch
              <br />
              {t.ConfirmPage.title}
            </Heading>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.summaryStepComponent.incidentType}
              </Heading>
              <Text style={text}>
                <strong>{t.summaryStepComponent.incidentType}:</strong>{" "}
                {(
                  t.incidentTypes[
                    incidentType.name as keyof typeof t.incidentTypes
                  ] as { name: string }
                )?.name || incidentType.name}
              </Text>
              {incidentType.subtype && (
                <Text style={text}>
                  <strong>{t.summaryStepComponent.incidentType}:</strong>{" "}
                  {(
                    t.incidentTypes[
                      incidentType.name as keyof typeof t.incidentTypes
                    ] as { subtypes?: Record<string, { name: string }> }
                  )?.subtypes?.[incidentType.subtype]?.name ||
                    incidentType.subtype}
                </Text>
              )}
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.summaryStepComponent.images}
              </Heading>
              <Text style={text}>
                {imageCount} {t.summaryStepComponent.images.toLowerCase()}
              </Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.summaryStepComponent.description}
              </Heading>
              <Text style={text}>{description}</Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.summaryStepComponent.location}
              </Heading>
              <Text style={text}>{safeLocation.address}</Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.summaryStepComponent.contactInformation}
              </Heading>
              <Text style={text}>
                <strong>{t.summaryStepComponent.firstName}:</strong>{" "}
                {reporterName}
              </Text>
              <Text style={text}>
                <strong>{t.summaryStepComponent.email}:</strong> {reporterEmail}
              </Text>
              {reporterPhone && (
                <Text style={text}>
                  <strong>{t.summaryStepComponent.phone}:</strong>{" "}
                  {reporterPhone}
                </Text>
              )}
            </Section>
            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.ConfirmPage.reportNumber}
              </Heading>
              <Text style={text}>{reportId}</Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                {t.ConfirmPage.nextSteps}
              </Heading>
              <Text style={text}>{t.ConfirmPage.nextStepsDescription}</Text>
            </Section>
          </Section>

          <Text style={footer}>
            © {new Date().getFullYear()} | Fix App | www.fixapp.ch
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

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "30px",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "9999px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 24px",
  transition: "background-color 150ms ease",
  gap: "8px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
