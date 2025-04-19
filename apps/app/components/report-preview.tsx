"use client";

import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { TypographyH4 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { useTranslations } from "next-intl";

interface ReportPreviewProps {
  report: {
    id: string;
    incident_type_id: string;
    incident_subtype_id?: string;
    status: string;
    location_address: string;
    incident_types?: {
      name: string;
    };
    incident_subtypes?: {
      name: string;
    };
    created_at: string;
  };
}

const ReportPreview = ({ report }: ReportPreviewProps) => {
  // Get translations
  const t = useTranslations("incidentTypes");
  const tc = useTranslations("components.reportPreview");

  // Get translated type name
  const getTranslatedType = (typeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = t.raw(`types.${typeId}.name`);
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return report.incident_types?.name || tc("fallback.type");
    }
  };

  // Get translated subtype name
  const getTranslatedSubtype = (typeId: string, subtypeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = t.raw(
        `types.${typeId}.subtypes.${subtypeId}.name`
      );
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return report.incident_subtypes?.name || "";
    }
  };

  // Get translated status
  const getTranslatedStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return tc("status.open");
      case "in progress":
        return tc("status.inProgress");
      case "closed":
        return tc("status.closed");
      default:
        return status;
    }
  };

  // Format status for display
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display in Swiss German format (HH:MM, TT.MM.JJJJ)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeFormat = new Intl.DateTimeFormat("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const dateFormat = new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    return `${timeFormat}, ${dateFormat}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">
              {report.incident_type_id
                ? getTranslatedType(report.incident_type_id)
                : tc("fallback.type")}
            </CardTitle>
            {report.incident_type_id && report.incident_subtype_id && (
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                {getTranslatedSubtype(
                  report.incident_type_id,
                  report.incident_subtype_id
                )}
              </TypographyParagraph>
            )}
          </div>
          <Badge className={getStatusColor(report.status)}>
            {getTranslatedStatus(report.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3 flex-grow">
        <div>
          <TypographyH4 className="text-muted-foreground" size="text-sm">
            {tc("location")}
          </TypographyH4>

          <TypographyParagraph className="line-clamp-2">
            {report.location_address}
          </TypographyParagraph>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TypographyH4 className="text-muted-foreground" size="text-sm">
              {tc("created")}
            </TypographyH4>
          </div>
          <TypographyParagraph>
            {report.created_at && formatDate(report.created_at)}
          </TypographyParagraph>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportPreview;
