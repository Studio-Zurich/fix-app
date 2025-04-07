import { Heading, Text } from "@react-email/components";
import messages from "@repo/translations/messages";
import { EmailProps } from "../../../archiv/old-app/lib/types";

type ReportOverviewProps = Pick<
  EmailProps,
  | "imageCount"
  | "locale"
  | "location"
  | "incidentType"
  | "description"
  | "userData"
>;

type IncidentTypeTranslation = {
  name: string;
  description: string;
  subtypes?: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
};

type IncidentTypesTranslation = {
  searchIncidentTypes: string;
  [key: string]: IncidentTypeTranslation | string;
};

export const ReportOverview = ({
  imageCount,
  locale,
  location,
  incidentType,
  description,
  userData,
}: ReportOverviewProps) => {
  const t = messages[locale].components.reportOverview;
  const tTypes = messages[locale]
    .incidentTypes as unknown as IncidentTypesTranslation;

  const getIncidentTypeName = (typeName: string) => {
    const typeTranslation = tTypes[typeName] as IncidentTypeTranslation;
    return typeTranslation?.name || typeName;
  };

  const getIncidentSubtypeName = (typeName: string, subtypeName: string) => {
    const typeTranslation = tTypes[typeName] as IncidentTypeTranslation;
    return typeTranslation?.subtypes?.[subtypeName]?.name || subtypeName;
  };

  return (
    <>
      {imageCount > 0 && (
        <>
          <Heading style={heading}>{t.images}</Heading>
          <Text style={text}>
            {imageCount} {imageCount === 1 ? t.imageUploaded : t.imagesUploaded}
          </Text>
        </>
      )}

      {location && (
        <>
          <Heading style={heading}>{t.location}</Heading>
          <Text style={text}>{location}</Text>
        </>
      )}
      {incidentType && (
        <>
          <Heading style={heading}>{t.incidentType}</Heading>
          <Text style={text}>
            {getIncidentTypeName(incidentType.type.name)}
            {incidentType.subtype &&
              ` - ${getIncidentSubtypeName(
                incidentType.type.name,
                incidentType.subtype.name
              )}`}
          </Text>
        </>
      )}
      {description && (
        <>
          <Heading style={heading}>{t.description}</Heading>
          <Text style={text}>{description}</Text>
        </>
      )}
      {userData && (
        <>
          <Heading style={heading}>{t.reporter}</Heading>
          <Text style={text}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={text}>
            {t.reporterEmail}: {userData.email}
          </Text>
          {userData.phone && (
            <Text style={text}>
              {t.reporterPhone}: {userData.phone}
            </Text>
          )}
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
