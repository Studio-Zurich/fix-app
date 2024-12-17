import ConfirmStep from "@/app/components/confirm-step";

export default function ConfirmPage({
  params,
}: {
  params: { reportId: string };
}) {
  return <ConfirmStep reportId={params.reportId} />;
}
