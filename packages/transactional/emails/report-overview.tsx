import { EmailProps } from "@/lib/types";
import { Heading, Text } from "@react-email/components";

type ReportOverviewProps = Pick<
  EmailProps,
  | "imageCount"
  | "locale"
  | "location"
  | "incidentType"
  | "description"
  | "userData"
> & {
  reportId?: string;
};

export const ReportOverview = ({
  imageCount,
  location,
  incidentType,
  description,
  userData,
  reportId,
}: ReportOverviewProps) => {
  return (
    <>
      {imageCount > 0 && (
        <>
          <Heading style={heading}>Images</Heading>
          <Text style={text}>
            {imageCount}{" "}
            {imageCount === 1 ? "image uploaded" : "images uploaded"}
          </Text>
        </>
      )}

      {location && (
        <>
          <Heading style={heading}>Location</Heading>
          <Text style={text}>{location}</Text>
        </>
      )}

      {incidentType && (
        <>
          <Heading style={heading}>Incident Type</Heading>
          <Text style={text}>
            {incidentType.type.name}
            {incidentType.subtype && ` - ${incidentType.subtype.name}`}
          </Text>
        </>
      )}

      {description && (
        <>
          <Heading style={heading}>Description</Heading>
          <Text style={text}>{description}</Text>
        </>
      )}

      {userData && (
        <>
          <Heading style={heading}>Reporter</Heading>
          <Text style={text}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={text}>Email: {userData.email}</Text>
          {userData.phone && <Text style={text}>Phone: {userData.phone}</Text>}
        </>
      )}

      {reportId && (
        <>
          <Heading style={heading}>Report ID</Heading>
          <Text style={text}>{reportId}</Text>
        </>
      )}
    </>
  );
};

const heading = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "1rem 0",
  fontWeight: "bold",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};
