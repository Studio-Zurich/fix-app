import { redirect } from "@/i18n/routing";

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: "/reports/new-report", locale });
}

// import Greeting from "@/components/greeting";
// import { Link } from "@/i18n/routing";
// import { Button } from "@repo/ui/button";
// import { getTranslations } from "next-intl/server";

// export default async function DashboardPage() {
//   const t = await getTranslations();
//   return (
//     <>
//       <Greeting />

//       <div>
//         <div className="flex justify-between items-center mb-6">
//           <Link href="/reports/new-report">
//             <Button>{t("ui.newReportButton")}</Button>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// }
