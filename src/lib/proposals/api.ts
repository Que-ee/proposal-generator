import { createBrowserClient } from "@/lib/supabase/client";
import type { Proposal } from "@/types";
import {
  proposalFromRow,
  proposalSummaryFromRow,
  proposalToInsertRow,
  type ProposalRow,
  type ProposalSummary,
  type ProposalSummaryRow,
} from "./mappers";

const SUMMARY_COLUMNS =
  "id, job_title, company_name, generated_proposal, edited_proposal, created_at";

/** Newest-first list for the history page. Fetches only what the list/detail views render. */
export async function listProposals(): Promise<ProposalSummary[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("proposals")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .returns<ProposalSummaryRow[]>();

  if (error) throw error;
  return (data ?? []).map(proposalSummaryFromRow);
}

/** Single proposal for the detail view. Returns null if the id doesn't exist. */
export async function getProposalSummary(id: string): Promise<ProposalSummary | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("proposals")
    .select(SUMMARY_COLUMNS)
    .eq("id", id)
    .maybeSingle<ProposalSummaryRow>();

  if (error) throw error;
  if (!data) return null;
  return proposalSummaryFromRow(data);
}

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
