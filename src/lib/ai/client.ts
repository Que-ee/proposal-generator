import type { FreelancerProfile, JobAnalysis } from "@/types";

/**
 * Browser-side helpers that call the server routes wrapping the AI
 * provider. Components should use these instead of talking to
 * /api/* directly, so the request/response shape lives in one place.
 */

async function parseJsonOrThrow(response: Response): Promise<unknown> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && String(body.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export async function analyzeJob(
  profile: FreelancerProfile,
  rawJobPost: string
): Promise<JobAnalysis> {
  const response = await fetch("/api/analyze-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, rawJobPost }),
  });

  const body = (await parseJsonOrThrow(response)) as { analysis: JobAnalysis };
  return body.analysis;
}

export async function generateProposal(
  profile: FreelancerProfile,
  rawJobPost: string,
  analysis: JobAnalysis
): Promise<string> {
  const response = await fetch("/api/generate-proposal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, rawJobPost, analysis }),
  });

  const body = (await parseJsonOrThrow(response)) as { proposal: string };
  return body.proposal;
}
