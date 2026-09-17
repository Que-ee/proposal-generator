import type { JobAnalysis, Proposal } from "@/types";

export interface ProposalRow {
  id: string;
  profile_id: string;
  job_title: string;
  company_name: string;
  raw_job_post: string;
  analysis: JobAnalysis;
  generated_proposal: string;
  edited_proposal: string | null;
  created_at: string;
  updated_at: string;
}

export function proposalFromRow(row: ProposalRow): Proposal {
  return {
    id: row.id,
    profileId: row.profile_id,
    jobTitle: row.job_title,
    companyName: row.company_name,
    rawJobPost: row.raw_job_post,
    analysis: row.analysis,
    generatedProposal: row.generated_proposal,
    editedProposal: row.edited_proposal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function proposalToInsertRow(
  proposal: Omit<Proposal, "createdAt" | "updatedAt">
): Omit<ProposalRow, "created_at" | "updated_at"> {
  return {
    id: proposal.id,
    profile_id: proposal.profileId,
    job_title: proposal.jobTitle,
    company_name: proposal.companyName,
    raw_job_post: proposal.rawJobPost,
    analysis: proposal.analysis,
    generated_proposal: proposal.generatedProposal,
    edited_proposal: proposal.editedProposal,
  };
}
