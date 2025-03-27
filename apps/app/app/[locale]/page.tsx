import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  return (
    <div>
      hello
      <Link href="/reports/new-report">Report</Link>
    </div>
  );
}
