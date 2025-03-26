// "use client";

// import { useReportStore } from "@/lib/store";
// import { MagnifyingGlass } from "@phosphor-icons/react";
// import { Checkbox } from "@repo/ui/checkbox";
// import { Input } from "@repo/ui/input";
// import { createClient } from "@supabase/supabase-js";
// import { useTranslations } from "next-intl";
// import { useEffect, useState } from "react";

// interface IncidentType {
//   id: string;
//   name: string;
//   description: string | null;
// }

// interface IncidentSubtype {
//   id: string;
//   incident_type_id: string;
//   name: string;
//   description: string | null;
// }

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export default function IncidentTypeStep() {
//   const [types, setTypes] = useState<IncidentType[]>([]);
//   const [filteredTypes, setFilteredTypes] = useState<IncidentType[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { setStepValidation, setHasSubtypes } = useReportStore();
//   const selectedTypeId = useReportStore((state) => state.selectedTypeId);
//   const setSelectedTypeId = useReportStore((state) => state.setSelectedTypeId);
//   const setSelectedSubtypeId = useReportStore(
//     (state) => state.setSelectedSubtypeId
//   );
//   const t = useTranslations("incidentTypes");

//   // Fetch incident types
//   useEffect(() => {
//     const fetchTypes = async () => {
//       try {
//         const { data, error } = await supabase
//           .from("incident_types")
//           .select("*")
//           .eq("active", true);

//         if (error) throw error;
//         setTypes(data);
//         setFilteredTypes(data);
//       } catch (err) {
//         setError("Failed to load incident types");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTypes();
//   }, []);

//   // Check for subtypes when type is selected
//   useEffect(() => {
//     const checkSubtypes = async () => {
//       if (!selectedTypeId) {
//         setHasSubtypes(false);
//         return;
//       }

//       try {
//         const { data, error } = await supabase
//           .from("incident_subtypes")
//           .select("id")
//           .eq("incident_type_id", selectedTypeId)
//           .eq("active", true)
//           .limit(1);

//         if (error) throw error;
//         setHasSubtypes(!!data && data.length > 0);
//       } catch (err) {
//         console.error("Error checking subtypes:", err);
//         setHasSubtypes(false);
//       }
//     };

//     checkSubtypes();
//   }, [selectedTypeId, setHasSubtypes]);

//   // Handle search
//   useEffect(() => {
//     const query = searchQuery.toLowerCase();
//     const filtered = types.filter(
//       (type) =>
//         type.name.toLowerCase().includes(query) ||
//         type.description?.toLowerCase().includes(query)
//     );
//     setFilteredTypes(filtered);
//   }, [searchQuery, types]);

//   // Update validation when type selection changes
//   useEffect(() => {
//     const checkSubtypes = async () => {
//       if (!selectedTypeId) {
//         setStepValidation("incidentType", false);
//         setHasSubtypes(false);
//         return;
//       }

//       try {
//         const { data, error } = await supabase
//           .from("incident_subtypes")
//           .select("id")
//           .eq("incident_type_id", selectedTypeId)
//           .eq("active", true);

//         if (error) throw error;

//         const hasSubtypes = data && data.length > 0;
//         setHasSubtypes(hasSubtypes);

//         // Always validate the step if a type is selected
//         // If there are subtypes, this will be re-validated in the subtype step
//         setStepValidation("incidentType", true);
//       } catch (err) {
//         console.error("Error checking subtypes:", err);
//       }
//     };

//     checkSubtypes();
//   }, [selectedTypeId, setStepValidation, setHasSubtypes]);

//   const handleTypeSelect = (typeId: string) => {
//     // Clear subtype selection when changing type
//     setSelectedSubtypeId(null);
//     setSelectedTypeId(selectedTypeId === typeId ? null : typeId);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="space-y-4 px-5">
//       <div className="relative">
//         <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//         <Input
//           placeholder={t("searchIncidentTypes")}
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="pl-9"
//         />
//       </div>

//       <div className="space-y-2">
//         {filteredTypes.map((type) => (
//           <div
//             key={type.id}
//             className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors"
//           >
//             <Checkbox
//               id={type.id}
//               checked={selectedTypeId === type.id}
//               onCheckedChange={() => handleTypeSelect(type.id)}
//               className="w-6 h-6"
//             />
//             <div className="flex-1">
//               <label
//                 htmlFor={type.id}
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 {t(`${type.name}.name`)}
//               </label>
//               {type.description && (
//                 <p className="text-sm text-muted-foreground">
//                   {t(`${type.name}.description`)}
//                 </p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
