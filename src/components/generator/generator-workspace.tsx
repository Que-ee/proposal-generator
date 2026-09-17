"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyProfile } from "@/lib/profile/api";
import { analyzeJob, generateProposal } from "@/lib/ai/client";
import { createProposal, saveProposalEdit } from "@/lib/proposals/api";
import { detectJobTitleAndCompany } from "@/lib/proposals/detect";
import type { FreelancerProfile, JobAnalysis, Proposal } from "@/types";
import { JobInputPanel } from "./job-input-panel";
import { AnalysisPanel } from "./analysis-panel";
import { ProposalPanel } from "./proposal-panel";

type AsyncStatus = "idle" | "loading" | "success" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function GeneratorWorkspace() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<AsyncStatus>("loading");

  const [jobPost, setJobPost] = useState("");

  const [analysisStatus, setAnalysisStatus] = useState<AsyncStatus>("idle");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const [generationStatus, setGenerationStatus] = useState<AsyncStatus>("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState<string | null>(null);
  const [savedProposal, setSavedProposal] = useState<Proposal | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyProfile()
      .then((existing) => {
        if (cancelled) return;
        setProfile(existing);
        setProfileStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setProfileStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAnalyze() {
    if (!profile || jobPost.trim().length === 0) return;

    setAnalysisStatus("loading");
    setAnalysisError(null);
    setAnalysis(null);
    setGenerationStatus("idle");
    setProposalText(null);
    setSavedProposal(null);

    try {
      const result = await analyzeJob(profile, jobPost);
      setAnalysis(result);
      setAnalysisStatus("success");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }

  async function runGeneration() {
    if (!profile || !analysis) return;

    setGenerationStatus("loading");
    setGenerationError(null);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const text = await generateProposal(profile, jobPost, analysis);
      setProposalText(text);
      setGenerationStatus("success");

      setSaveStatus("saving");
      try {
        const { jobTitle, companyName } = detectJobTitleAndCompany(jobPost);
        const saved = await createProposal({
          id: crypto.randomUUID(),
          profileId: profile.id,
          jobTitle,
          companyName,
          rawJobPost: jobPost,
          analysis,
          generatedProposal: text,
          editedProposal: null,
        });
        setSavedProposal(saved);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        setSaveError(error instanceof Error ? error.message : "Failed to save proposal");
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Generation failed");
      setGenerationStatus("error");
    }
  }

  async function handleProposalBlur() {
    if (!savedProposal || proposalText === null) return;
    if (proposalText === (savedProposal.editedProposal ?? savedProposal.generatedProposal)) {
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);
    try {
      const saved = await saveProposalEdit(savedProposal.id, proposalText);
      setSavedProposal(saved);
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "Failed to save edit");
    }
  }

  async function handleCopy() {
    if (!proposalText) return;
    try {
      await navigator.clipboard.writeText(proposalText);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Couldn't copy — your browser may be blocking clipboard access.");
    }
  }

  if (profileStatus === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your profile…
      </div>
    );
  }

  if (profileStatus === "error") {
    return (
      <Card>
        <CardContent className="flex items-start gap-2 py-6 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          Couldn&apos;t load your profile. Check your Supabase configuration
          and try again.
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;ll need a saved freelancer profile before generating
            proposals — that&apos;s what the AI grounds every proposal in.
          </p>
          <Button asChild>
            <Link href="/profile">Set up your profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <JobInputPanel
          jobPost={jobPost}
          onChange={setJobPost}
          onAnalyze={handleAnalyze}
          analyzing={analysisStatus === "loading"}
          disabled={false}
        />
      </div>

      <div className="flex flex-col gap-6">
        <AnalysisPanel
          analyzing={analysisStatus === "loading"}
          analysisError={analysisStatus === "error" ? analysisError : null}
          analysis={analysis}
          onGenerate={runGeneration}
          generating={generationStatus === "loading"}
        />

        <ProposalPanel
          generating={generationStatus === "loading"}
          generationError={generationStatus === "error" ? generationError : null}
          proposalText={proposalText}
          onChange={setProposalText}
          onBlur={handleProposalBlur}
          onRegenerate={runGeneration}
          onCopy={handleCopy}
          copied={copied}
          copyError={copyError}
          saveStatus={saveStatus}
          saveError={saveError}
        />
      </div>
    </div>
  );
}
