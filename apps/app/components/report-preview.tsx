import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { TypographyH4 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";

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
          <CardTitle className="text-lg">
            {report.incident_types?.name || "Incident Report"}
          </CardTitle>
          <Badge className={getStatusColor(report.status)}>
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3 flex-grow">
        {report.incident_subtypes && (
          <div>
            <TypographyH4 className="text-muted-foreground" size="text-sm">
              Subtype
            </TypographyH4>
            <TypographyParagraph>
              {report.incident_subtypes.name}
            </TypographyParagraph>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
            <TypographyH4 className="text-muted-foreground" size="text-sm">
              Location
            </TypographyH4>
          </div>
          <p className="line-clamp-2">{report.location_address}</p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TypographyH4 className="text-muted-foreground" size="text-sm">
              Created
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
