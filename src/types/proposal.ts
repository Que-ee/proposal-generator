import type { JobAnalysis } from "./job";

/**
 * A generated proposal tied to one freelancer profile and one job post.
 * `generatedProposal` is the AI's original output; `editedProposal` holds the
 * freelancer's manual edits so the original is never lost (needed for
 * regeneration and history).
 */
export interface Proposal {
  id: string;
  profileId: string;
  jobTitle: string;
  companyName: string;
  rawJobPost: string;
  analysis: JobAnalysis;
  generatedProposal: string;
  editedProposal: string | null;
  createdAt: string;
  updatedAt: string;
}
