// "use client";

// import { useReportStore } from "@/lib/store";
// import { Car, TrashSimple, Tree, Warning } from "@phosphor-icons/react";
// import { Button } from "@repo/ui/button";
// import { createClient } from "@supabase/supabase-js";
// import { useTranslations } from "next-intl";

// interface QuickAccessReportsProps {
//   onStartReport: () => void;
// }

// const quickReports = [
//   {
//     id: "vehicles_illegal_parking",
//     type: "vehicles",
//     icon: Car,
//   },
//   {
//     id: "waste_general",
//     type: "waste",
//     icon: TrashSimple,
//   },
//   {
//     id: "vegetation_general",
//     type: "vegetation",
//     icon: Tree,
//   },
//   {
//     id: "feedback_general",
//     type: "feedback",
//     icon: Warning,
//   },
// ];

// const QuickAccessReports = ({ onStartReport }: QuickAccessReportsProps) => {
//   const t = useTranslations("incidentTypes");
//   const setStepValidation = useReportStore((state) => state.setStepValidation);

//   const handleQuickReport = async (type: string, subtypeKey: string) => {
//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     try {
//       // First get the incident type ID
//       const { data: typeData, error: typeError } = await supabase
//         .from("incident_types")
//         .select("id")
//         .eq("name", type)
//         .single();

//       if (typeError) throw typeError;

//       // Then get the subtype ID
//       const { data: subtypeData, error: subtypeError } = await supabase
//         .from("incident_subtypes")
//         .select("id")
//         .eq("name", subtypeKey)
//         .eq("incident_type_id", typeData.id)
//         .single();

//       if (subtypeError) throw subtypeError;

//       console.log("Type Data:", typeData);
//       console.log("Subtype Data:", subtypeData);

//       // Set the incident type and subtype in store using the actual UUIDs
//       useReportStore.setState((state) => ({
//         reportData: {
//           ...state.reportData,
//           incidentTypeId: typeData.id,
//           incidentSubtypeId: subtypeData.id,
//         },
//         skipIncidentType: true,
//       }));

//       // Validate the incident type step since we already have the selection
//       setStepValidation("incidentType", true);

//       // Start from the first step (images)
//       useReportStore.setState({ currentStep: 0 });

//       // Open the drawer
//       onStartReport();
//     } catch (error) {
//       console.error("Error setting up quick report:", error);
//     }
//   };

//   return (
//     <div className="grid grid-cols-2 gap-2">
//       {quickReports.map((report) => (
//         <Button
//           key={report.id}
//           variant="outline"
//           className="flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-4"
//           onClick={() => handleQuickReport(report.type, report.id)}
//         >
//           <report.icon className="w-5 h-5" />
//           <span className="text-xs whitespace-nowrap">
//             {t(`${report.type}.subtypes.${report.id}.name`)}
//           </span>
//         </Button>
//       ))}
//     </div>
//   );
// };

// export default QuickAccessReports;
