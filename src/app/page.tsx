import { GeneratorWorkspace } from "@/components/generator/generator-workspace";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Proposal generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste a job post, see how it lines up with your saved profile, and
          generate a proposal grounded in your verified experience.
        </p>
      </div>
      <GeneratorWorkspace />
    </div>
  );
}
