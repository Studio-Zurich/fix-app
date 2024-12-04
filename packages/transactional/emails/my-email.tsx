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
  incidentType: {
    name: string;
    subtype?: string;
  } | null;
  imageCount: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fix-app.ch";

const defaultProps: Partial<ReportEmailProps> = {
  reportId: "#000000",
  reporterName: "Unknown",
  reporterEmail: "no-email@provided.com",
  location: {
    address: "No address provided",
    lat: 0,
    lng: 0,
  },
  description: "No description provided",
  incidentType: {
    name: "Unknown incident",
  },
  imageCount: 0,
};

export const ReportEmail = ({
  reportId = defaultProps.reportId,
  reporterName = defaultProps.reporterName,
  reporterEmail = defaultProps.reporterEmail,
  reporterPhone,
  location = defaultProps.location,
  description = defaultProps.description,
  incidentType = defaultProps.incidentType,
  imageCount = defaultProps.imageCount,
}: ReportEmailProps) => {
  const safeIncidentType = incidentType || defaultProps.incidentType;
  const safeLocation = location || defaultProps.location;

  return (
    <Html>
      <Head />
      <Preview>New Report Submitted #{reportId}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>New Report Submitted #{reportId}</Heading>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                Incident Details
              </Heading>
              <Text style={text}>
                <strong>Type:</strong> {safeIncidentType?.name || "Unknown"}
              </Text>
              {safeIncidentType?.subtype && (
                <Text style={text}>
                  <strong>Subtype:</strong> {safeIncidentType.subtype}
                </Text>
              )}
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                Location
              </Heading>
              <Text style={text}>{safeLocation.address}</Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                Description
              </Heading>
              <Text style={text}>{description}</Text>
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                Reporter Information
              </Heading>
              <Text style={text}>
                <strong>Name:</strong> {reporterName}
              </Text>
              <Text style={text}>
                <strong>Email:</strong> {reporterEmail}
              </Text>
              {reporterPhone && (
                <Text style={text}>
                  <strong>Phone:</strong> {reporterPhone}
                </Text>
              )}
            </Section>

            <Section style={section}>
              <Heading as="h2" style={sectionHeader}>
                Images
              </Heading>
              <Text style={text}>
                {imageCount} image(s) attached to the report
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button href={`${baseUrl}/reports/${reportId}`} style={button}>
                View Report
              </Button>
            </Section>
          </Section>

          <Text style={footer}>
            © {new Date().getFullYear()} | Fix App | www.fix-app.ch
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
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
