import { ProposalDetail } from "@/components/proposals/proposal-detail";

export default async function ProposalDetailPage(
  props: PageProps<"/proposals/[id]">
) {
  const { id } = await props.params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <ProposalDetail id={id} />
    </div>
  );
}
