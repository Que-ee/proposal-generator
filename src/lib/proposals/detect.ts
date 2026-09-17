/**
 * Best-effort extraction of a job title and company name from the pasted
 * job post text, so saved proposals aren't all unlabeled. This is a plain
 * heuristic, not an AI call — it's fine for it to come back empty; nothing
 * downstream depends on it being accurate.
 */
export function detectJobTitleAndCompany(rawJobPost: string): {
  jobTitle: string;
  companyName: string;
} {
  const firstLine = rawJobPost.trim().split("\n")[0]?.trim() ?? "";
  const jobTitle =
    firstLine.length > 0 && firstLine.length <= 100 && !firstLine.endsWith(".")
      ? firstLine
      : "";

  const companyLineMatch = rawJobPost.match(/^\s*company\s*[:\-]\s*(.+)$/im);
  const atCompanyMatch = rawJobPost.match(
    /\bat\s+([A-Z][A-Za-z0-9&.,'-]{1,60}(?:\s+[A-Z][A-Za-z0-9&.,'-]{1,60}){0,3})/
  );

  const companyName = (companyLineMatch?.[1] ?? atCompanyMatch?.[1] ?? "").trim();

  return { jobTitle, companyName };
}
