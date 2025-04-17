import { Link } from "@/i18n/navigation";
import { ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations("components.header");

  return (
    <header className="grid grid-cols-8 lg:grid-cols-12 px-[5vw] lg:px-6 py-2">
      <Link
        href="/"
        className="col-span-2 flex justify-start items-center lg:col-span-4"
      >
        <ArrowLeft size={24} />
      </Link>

      <Link
        href="/"
        className="col-span-4 lg:col-span-4 flex justify-center items-center"
      >
        <span>{t("appName")}</span>
      </Link>
      <Link
        href="/reports/new-report"
        className="col-span-2 lg:col-span-4 flex justify-end items-center"
      >
        <Button className="bg-[#ff781e] sm:hidden" size="icon">
          <Plus size={24} />
        </Button>
        <Button className="bg-[#ff781e] hidden sm:inline-flex">
          {t("newReport")}
        </Button>
      </Link>
    </header>
  );
};

export default Header;
