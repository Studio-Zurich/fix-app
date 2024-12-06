import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface IncidentType {
  id: string;
  name: string;
  description: string;
}

interface IncidentSubtype {
  id: string;
  incident_type_id: string;
  name: string;
  description: string;
}

export const IncidentTypeStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentSubtypes, setIncidentSubtypes] = useState<IncidentSubtype[]>(
    []
  );
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchIncidentTypes = async () => {
      const supabase = createClient();
      try {
        const { data: types, error: typeError } = (await supabase
          .from("incident_types")
          .select("*")
          .eq("active", true)) as unknown as {
          data: IncidentType[];
          error: any;
        };

        if (typeError) throw typeError;
        setIncidentTypes(types || []);
      } catch (err) {
        setError("Failed to fetch incident types");
      }
    };

    fetchIncidentTypes();
  }, []);

  const handleTypeChange = async (typeId: string) => {
    updateReportData({ incidentTypeId: typeId, incidentSubtypeId: undefined });

    const supabase = createClient();
    try {
      const { data: subtypes, error: subtypeError } = (await supabase
        .from("incident_subtypes")
        .select("*")
        .eq("incident_type_id", typeId)
        .eq("active", true)) as unknown as {
        data: IncidentSubtype[];
        error: any;
      };

      if (subtypeError) throw subtypeError;
      setIncidentSubtypes(subtypes || []);
    } catch (err) {
      setError("Failed to fetch incident subtypes");
    }
  };

  const handleSubtypeChange = (subtypeId: string) => {
    updateReportData({
      incidentSubtypeId: subtypeId,
    });
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-base">{error}</p>}

      <div>
        <label className="block text-base font-medium text-gray-700">
          Vorfall Typ
        </label>
        <select
          value={reportData.incidentTypeId || ""}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base rounded-md"
        >
          <option value="" disabled>
            Vorfall Typ auswählen
          </option>
          {incidentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {incidentSubtypes.length > 0 && (
        <div>
          <label className="block text-base font-medium text-gray-700">
            Vorfall Unterkategorie
          </label>
          <select
            value={reportData.incidentSubtypeId || ""}
            onChange={(e) => handleSubtypeChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base rounded-md"
          >
            <option value="" disabled>
              Unterkategorie auswählen
            </option>
            {incidentSubtypes.map((subtype) => (
              <option key={subtype.id} value={subtype.id}>
                {subtype.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
