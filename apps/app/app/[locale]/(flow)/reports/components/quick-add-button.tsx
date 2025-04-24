// import { Link } from "@/i18n/navigation";
import { reportStore } from "@/lib/store";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

import { Link } from "@/i18n/navigation";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { useTranslations } from "next-intl";
import { useState } from "react";

const QuickAddButton = () => {
  const t = useTranslations("components.map");
  const incidentTypesT = useTranslations("incidentTypes");
  const [open, setOpen] = useState(false);

  const handleNewReport = () => {
    // Get the resetReport function from the store
    const resetReport = reportStore.getState().resetReport;
    // Call it to ensure a fresh start
    resetReport();
    setOpen(false);
  };

  // Get overflowing waste category
  const getWasteSubtype = () => {
    // Type ID for Waste category
    const wasteTypeId = "e449512e-f862-48b5-89eb-2f32da0bdebf";
    // Subtype ID for Overflowing Bin
    const overflowingBinSubtypeId = "7b6f6775-21be-4fca-b1eb-056836dbff79";

    return {
      typeId: wasteTypeId,
      typeName: incidentTypesT.raw(`types.${wasteTypeId}.name`) as string,
      subtypeId: overflowingBinSubtypeId,
      subtypeName: incidentTypesT.raw(
        `types.${wasteTypeId}.subtypes.${overflowingBinSubtypeId}.name`
      ) as string,
      icon: incidentTypesT.raw(
        `types.${wasteTypeId}.subtypes.${overflowingBinSubtypeId}.icon`
      ) as string,
    };
  };

  const handleQuickAddSubtype = (subtypeInfo: {
    typeId: string;
    typeName: string;
    subtypeId: string;
    subtypeName: string;
  }) => {
    // Get the resetReport function from the store
    const resetReport = reportStore.getState().resetReport;
    // Call it to ensure a fresh start
    resetReport();

    // Set the incident type
    reportStore.getState().setIncidentType({
      id: subtypeInfo.typeId,
      name: subtypeInfo.typeName,
    });

    // Set the incident subtype
    reportStore.getState().setIncidentSubtype({
      id: subtypeInfo.subtypeId,
      name: subtypeInfo.subtypeName,
    });

    setOpen(false);
  };

  const wasteSubtype = getWasteSubtype();

  return (
    <div className="absolute bottom-5 left-5 w-[calc(100%-2.5rem)] z-20 cursor-pointer">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full cursor-pointer">
            {t("buttons.newReport")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[calc(100vw-2.5rem)]" align="center">
          <Command>
            <CommandList>
              <CommandGroup heading={t("quickAdd.title")}>
                <Link href="/reports/new-report" onClick={handleNewReport}>
                  <CommandItem className="flex items-center gap-2 cursor-pointer">
                    <Plus size={20} />
                    <span>{t("quickAdd.newReport")}</span>
                  </CommandItem>
                </Link>
              </CommandGroup>

              <CommandGroup heading={t("quickAdd.categories")}>
                <Link
                  href="/reports/new-report"
                  onClick={() => handleQuickAddSubtype(wasteSubtype)}
                >
                  <CommandItem className="flex items-center gap-2 cursor-pointer">
                    <span className="text-base">{wasteSubtype.icon}</span>
                    <span>{wasteSubtype.subtypeName}</span>
                  </CommandItem>
                </Link>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default QuickAddButton;
