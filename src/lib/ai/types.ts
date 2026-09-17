import type { FreelancerProfile, JobAnalysis } from "@/types";

/**
 * Every AI call in this product is grounded in a verified profile. Providers
 * must never introduce experience, skills, years, companies, or metrics that
 * are not present in `profile` — this is the enforcement boundary described
 * in the product rules, not just a convention.
 */
export interface AnalyzeJobInput {
  profile: FreelancerProfile;
  rawJobPost: string;
}

export interface GenerateProposalInput {
  profile: FreelancerProfile;
  rawJobPost: string;
  analysis: JobAnalysis;
}

export interface RewriteProposalInput {
  profile: FreelancerProfile;
  analysis: JobAnalysis;
  currentProposal: string;
  instructions: string;
}

/**
 * The provider-agnostic surface the rest of the product depends on. Swapping
 * Gemini for Claude (or anything else) means writing a new class that
 * implements this interface — no other product code changes.
 */
export interface AIProvider {
  analyzeJob(input: AnalyzeJobInput): Promise<JobAnalysis>;
  generateProposal(input: GenerateProposalInput): Promise<string>;
  rewriteProposal(input: RewriteProposalInput): Promise<string>;
}
