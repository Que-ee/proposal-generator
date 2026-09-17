import { createBrowserClient } from "@/lib/supabase/client";
import type { Proposal } from "@/types";
import { proposalFromRow, proposalToInsertRow, type ProposalRow } from "./mappers";

/**
 * Inserts a newly generated proposal. Only `insert`/`select` are needed for
 * this task — see supabase/migrations/0001_init.sql for the matching anon
 * grants. Editing an existing row (saveProposalEdit) is a separate,
 * narrower operation so `update` privilege stays scoped to exactly that.
 */
export async function createProposal(
  proposal: Omit<Proposal, "createdAt" | "updatedAt">
): Promise<Proposal> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("proposals")
    .insert(proposalToInsertRow(proposal))
    .select(
      "id, profile_id, job_title, company_name, raw_job_post, analysis, generated_proposal, edited_proposal, created_at, updated_at"
    )
    .single<ProposalRow>();

  if (error) throw error;
  return proposalFromRow(data);
}

/** Persists the user's edited proposal text against an existing row. */
export async function saveProposalEdit(
  proposalId: string,
  editedProposal: string
): Promise<Proposal> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("proposals")
    .update({ edited_proposal: editedProposal })
    .eq("id", proposalId)
    .select(
      "id, profile_id, job_title, company_name, raw_job_post, analysis, generated_proposal, edited_proposal, created_at, updated_at"
    )
    .single<ProposalRow>();

  if (error) throw error;
  return proposalFromRow(data);
}
