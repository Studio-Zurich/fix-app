import { redirect } from "../../i18n/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect({
    href: "/reports",
    locale,
  });

  // This return statement won't be reached due to the redirect
  return <div>test</div>;
}
