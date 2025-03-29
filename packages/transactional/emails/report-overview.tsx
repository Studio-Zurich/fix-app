import { Section, Text } from "@react-email/components";
import messages from "@repo/translations/messages";
import { EmailProps } from "../../../apps/app/lib/types";

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
    <Section style={section}>
      <Text style={text}>
        {imageCount} {imageCount === 1 ? t.imageUploaded : t.imagesUploaded}
      </Text>
      {location && (
        <Text style={text}>
          {t.location}: {location}
        </Text>
      )}
      {incidentType && (
        <Text style={text}>
          {t.incidentType}: {getIncidentTypeName(incidentType.type.name)}
          {incidentType.subtype &&
            ` - ${getIncidentSubtypeName(
              incidentType.type.name,
              incidentType.subtype.name
            )}`}
        </Text>
      )}
      {description && (
        <Text style={text}>
          {t.description}: {description}
        </Text>
      )}
      {userData && (
        <>
          <Text style={text}>
            {t.reporter}: {userData.firstName} {userData.lastName}
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
