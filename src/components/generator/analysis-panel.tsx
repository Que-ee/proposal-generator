"use client";

import { Loader2, TriangleAlert, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { JobAnalysis } from "@/types";

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None identified.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function AnalysisPanel({
  analyzing,
  analysisError,
  analysis,
  onGenerate,
  generating,
}: {
  analyzing: boolean;
  analysisError: string | null;
  analysis: JobAnalysis | null;
  onGenerate: () => void;
  generating: boolean;
}) {
  if (analyzing) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Analysing the job against your profile…
        </CardContent>
      </Card>
    );
  }

  if (analysisError) {
    return (
      <Card>
        <CardContent className="flex items-start gap-2 py-6 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>Couldn&apos;t analyse this job: {analysisError}</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
          <Wand2 className="size-5" />
          Paste a job post and analyse it to see how it lines up with your
          profile.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Client needs</h3>
          <TagList items={analysis.clientNeeds} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Required skills</h3>
          <TagList items={analysis.requiredSkills} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Strongest profile matches</h3>
          <TagList items={analysis.relevantProfileEvidence} />
        </div>

        {analysis.missingExperience.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">Missing experience</h3>
            <TagList items={analysis.missingExperience} />
            <p className="text-xs text-muted-foreground">
              The proposal will avoid claiming this.
            </p>
          </div>
        ) : null}

        <Separator />

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Proposal angle</h3>
          <p className="text-sm text-muted-foreground">{analysis.proposalAngle}</p>
        </div>

        <Button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="w-fit gap-1.5"
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {generating ? "Generating…" : "Generate proposal"}
        </Button>
      </CardContent>
    </Card>
  );
}
