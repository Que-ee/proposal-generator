"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProposalSummary } from "@/lib/proposals/api";
import type { ProposalSummary } from "@/lib/proposals/mappers";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProposalDetail({ id }: { id: string }) {
  const [proposal, setProposal] = useState<ProposalSummary | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProposalSummary(id)
      .then((result) => {
        if (!cancelled) setProposal(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load proposal");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleCopy() {
    if (!proposal) return;
    try {
      await navigator.clipboard.writeText(proposal.proposalText);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Couldn't copy — your browser may be blocking clipboard access.");
    }
  }

  const backLink = (
    <Link
      href="/proposals"
      className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeft className="size-4" />
      Back to proposals
    </Link>
  );

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <Card>
          <CardContent className="flex items-start gap-2 py-6 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Couldn&apos;t load this proposal: {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (proposal === undefined) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading proposal…
        </div>
      </div>
    );
  }

  if (proposal === null) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              This proposal doesn&apos;t exist or may have been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/proposals">Back to proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {backLink}

      <Card>
        <CardHeader>
          <CardTitle className="break-words">
            {proposal.jobTitle || "Untitled proposal"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {proposal.companyName ? <span>{proposal.companyName}</span> : null}
            <span>{formatDate(proposal.createdAt)}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {proposal.proposalText}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopy}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
