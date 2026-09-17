import { ProposalList } from "@/components/proposals/proposal-list";

export default function ProposalsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve generated, newest first.
        </p>
      </div>
      <ProposalList />
    </div>
  );
}
