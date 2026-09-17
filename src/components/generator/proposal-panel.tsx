"use client";

import { Check, Copy, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ProposalPanel({
  generating,
  generationError,
  proposalText,
  onChange,
  onBlur,
  onRegenerate,
  onCopy,
  copied,
  copyError,
  saveStatus,
  saveError,
}: {
  generating: boolean;
  generationError: string | null;
  proposalText: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  copied: boolean;
  copyError: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
}) {
  if (generationError) {
    return (
      <Card>
        <CardContent className="flex items-start gap-2 py-6 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>Couldn&apos;t generate a proposal: {generationError}</span>
        </CardContent>
      </Card>
    );
  }

  if (proposalText === null) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your proposal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          value={proposalText}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          rows={14}
          disabled={generating}
          aria-label="Proposal text"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCopy}
            className="w-fit gap-1.5"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {copyError ? (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <TriangleAlert className="size-3.5" />
              {copyError}
            </span>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={generating}
            className="w-fit gap-1.5"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Regenerate
          </Button>

          {saveStatus === "saving" ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </span>
          ) : null}
          {saveStatus === "saved" ? (
            <span className="text-sm text-muted-foreground">Saved</span>
          ) : null}
          {saveStatus === "error" ? (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <TriangleAlert className="size-3.5" />
              Couldn&apos;t save: {saveError}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
