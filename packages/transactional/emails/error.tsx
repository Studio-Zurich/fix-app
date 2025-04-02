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
import { EmailProps } from "../../../apps/app/lib/types";

const defaultProps: EmailProps = {
  imageCount: 0,
  locale: "de",
  reportId: "",
};

export const ReportEmail = ({
  imageCount = defaultProps.imageCount,
  locale = defaultProps.locale,
  reportId = defaultProps.reportId,
  errorType,
  errorMessage,
}: EmailProps & {
  errorType: "internal_mail" | "external_mail" | "image_upload";
  errorMessage?: string;
}) => {
  const t = messages[locale].mails.internal;

  const getStepStatus = (step: string) => {
    switch (step) {
      case "supabase":
        return "✅ Completed";
      case "internal_mail":
        return errorType === "internal_mail" ? "❌ Failed" : "✅ Completed";
      case "external_mail":
        return errorType === "external_mail" ? "❌ Failed" : "✅ Completed";
      case "image_upload":
        return errorType === "image_upload" ? "❌ Failed" : "✅ Completed";
      default:
        return "❓ Unknown";
    }
  };

  const getStepError = (step: string) => {
    if (errorType === step && errorMessage) {
      return errorMessage;
    }
    return null;
  };

  return (
    <Html>
      <Head />
      <Preview>Error in Report Processing</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>
              Error in Report Processing
              <br />
              Report ID: {reportId}
            </Heading>
            <Section style={section}>
              <Text style={text}>Processing Steps:</Text>
              <div style={stepsContainer}>
                <div style={stepItem}>
                  <Text style={text}>
                    <strong>1. Database Creation:</strong>{" "}
                    {getStepStatus("supabase")}
                  </Text>
                </div>
                <div style={stepItem}>
                  <Text style={text}>
                    <strong>2. Internal Email:</strong>{" "}
                    {getStepStatus("internal_mail")}
                  </Text>
                </div>
                <div style={stepItem}>
                  <Text style={text}>
                    <strong>3. External Email:</strong>{" "}
                    {getStepStatus("external_mail")}
                  </Text>
                </div>
                <div style={stepItem}>
                  <Text style={text}>
                    <strong>4. Image Upload:</strong>{" "}
                    {getStepStatus("image_upload")}
                  </Text>
                </div>
              </div>
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

const stepsContainer = {
  marginTop: "20px",
  padding: "0 20px",
};

const stepItem = {
  marginBottom: "15px",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 10px",
};

const errorText = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 10px",
  color: "#dc2626",
  paddingLeft: "20px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
