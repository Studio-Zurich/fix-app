// "use client";

// import { useReportStore } from "@/lib/store";
// import { CheckCircle } from "@phosphor-icons/react";
// import { useTranslations } from "next-intl";
// import { useEffect } from "react";

// export default function ConfirmStep() {
//   const t = useTranslations("ConfirmPage");
//   const reset = useReportStore((state) => state.reset);
//   const setCurrentStep = useReportStore((state) => state.setCurrentStep);

//   // Cleanup object URLs when component unmounts
//   useEffect(() => {
//     return () => {
//       // Get the images from store
//       const images = useReportStore.getState().images;
//       // Revoke all object URLs
//       images.forEach((url) => {
//         if (url.startsWith("blob:")) {
//           URL.revokeObjectURL(url);
//         }
//       });
//     };
//   }, []);

//   const handleNewReport = () => {
//     // Get the images before reset
//     const images = useReportStore.getState().images;
//     // Revoke all object URLs
//     images.forEach((url) => {
//       if (url.startsWith("blob:")) {
//         URL.revokeObjectURL(url);
//       }
//     });

//     reset();
//     setCurrentStep(0);
//   };

//   return (
//     <div className="space-y-6 px-5">
//       <div className="flex flex-col items-center space-y-2 text-center">
//         <CheckCircle className="w-16 h-16 text-primary" weight="fill" />
//         <h1 className="text-2xl font-bold">{t("title")}</h1>
//         <p className="text-muted-foreground">{t("nextStepsDescription")}</p>
//       </div>
//     </div>
//   );
// }
