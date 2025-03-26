// "use client";

// import { useRouter } from "@/i18n/routing";
// import { Plus } from "@phosphor-icons/react";
// import { Button } from "@repo/ui/button";
// import { useTranslations } from "next-intl";
// import { useState } from "react";
// import MapOverview from "./map-overview";
// import ReportDrawer from "./report-drawer";

// export default function Dashboard() {
//   const router = useRouter();
//   const t = useTranslations("DashboardPage");
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   return (
//     <>
//       <div className="space-y-6 p-4">
//         <Button
//           className="w-full h-auto py-6 flex"
//           onClick={() => setDrawerOpen(true)}
//         >
//           <Plus className="w-6 h-6" />
//           <span>{t("newReport")}</span>
//         </Button>

//         <div className="space-y-2">
//           <h2 className="text-lg font-semibold">{t("overview")}</h2>
//           <MapOverview />
//         </div>

//         {/* <div className="space-y-2">
//           <h2 className="text-lg font-semibold">{t("quickReports")}</h2>
//           <QuickAccessReports onStartReport={() => setDrawerOpen(true)} />
//         </div> */}
//       </div>

//       <ReportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
//     </>
//   );
// }
