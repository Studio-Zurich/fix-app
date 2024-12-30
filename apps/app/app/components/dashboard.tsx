import { useTranslations } from "next-intl";
import MapOverview from "./map-overview";

const Dashboard = () => {
  const t = useTranslations("DashboardPage");
  return (
    <div>
      <h1>{t("title")}</h1>
      <MapOverview />
    </div>
  );
};

export default Dashboard;
