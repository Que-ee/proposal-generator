"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listProposals } from "@/lib/proposals/api";
import type { ProposalSummary } from "@/lib/proposals/mappers";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function preview(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}…` : trimmed;
}

export function ProposalList() {
  const [proposals, setProposals] = useState<ProposalSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listProposals()
      .then((result) => {
        if (!cancelled) setProposals(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load proposals");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-start gap-2 py-6 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          Couldn&apos;t load your proposals: {error}
        </CardContent>
      </Card>
    );
  }

  if (!proposals) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your proposals…
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t generated any proposals yet.
          </p>
          <Button asChild>
            <Link href="/">Generate a proposal</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {proposals.map((proposal) => (
        <Link
          key={proposal.id}
          href={`/proposals/${proposal.id}`}
          className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-medium break-words">
                  {proposal.jobTitle || "Untitled proposal"}
                </h2>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(proposal.createdAt)}
                </span>
              </div>
              {proposal.companyName ? (
                <p className="text-sm text-muted-foreground break-words">
                  {proposal.companyName}
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                {preview(proposal.proposalText)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
