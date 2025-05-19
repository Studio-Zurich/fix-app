import { redirect } from "../../../i18n/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect({
    href: "/",
    locale,
  });

  return <div>test</div>;
}
