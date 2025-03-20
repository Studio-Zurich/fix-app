"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";
import * as React from "react";

interface LocaleToggleProps {
  onClose?: () => void;
}

const LocaleToggle = ({ onClose }: LocaleToggleProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLocaleChange = async (
    e: React.MouseEvent<HTMLButtonElement>,
    locale: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClose) {
      onClose();
    }

    await router.replace(pathname, { locale });
  };

  return (
    <div className="flex items-center">
      {routing.locales.map((locale, index) => (
        <React.Fragment key={locale}>
          {index > 0 && <div className="h-6 w-[1px] mx-2 bg-primary" />}
          <button
            className={`uppercase font-body-light text-primary cursor-pointer ${
              locale === currentLocale ? "underline underline-offset-4" : ""
            }`}
            onClick={(e) => handleLocaleChange(e, locale)}
          >
            {locale}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default LocaleToggle;
