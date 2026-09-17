import type { FreelancerProfile, JobAnalysis } from "@/types";

/**
 * Renders the verified profile as plain text for the model prompt. This is
 * the ONLY source of truth about the freelancer the model is given — no
 * other facts about them are ever included in a prompt. Keeping this in one
 * place makes it possible to audit exactly what the model can "know".
 */
export function renderProfileForPrompt(profile: FreelancerProfile): string {
  const experience = profile.experienceEntries.length
    ? profile.experienceEntries
        .map((entry, i) => {
          const skills = entry.skills.length ? entry.skills.join(", ") : "none listed";
          const evidence = entry.evidence.length
            ? entry.evidence.map((e) => `    - ${e}`).join("\n")
            : "    - none listed";
          return `${i + 1}. ${entry.title} — ${entry.role} at ${entry.company}\n   Description: ${
            entry.description || "none provided"
          }\n   Skills: ${skills}\n   Evidence:\n${evidence}`;
        })
        .join("\n\n")
    : "No experience entries on file.";

  return `
Full name: ${profile.fullName}
Professional title: ${profile.professionalTitle}
Years of experience: ${profile.yearsExperience}
Bio: ${profile.bio || "none provided"}
Portfolio: ${profile.portfolioUrl ?? "none provided"}
Skills: ${profile.skills.length ? profile.skills.join(", ") : "none listed"}

Experience entries:
${experience}
`.trim();
}

const FACTUALITY_RULE = `
You may only use facts that appear verbatim or as a reasonable paraphrase in the FREELANCER PROFILE below.
Never invent or assume: companies, job titles, years of experience, skills, tools, metrics, or project results
that are not present in the profile. If the job needs something the profile doesn't show, say so plainly instead
of implying the freelancer has it. Transferable experience may be framed carefully (e.g. "experience with X
translates well to Y"), but do not state or imply a false claim.
`.trim();

export function buildAnalyzeJobPrompt(profile: FreelancerProfile, rawJobPost: string): string {
  return `
You are analysing a freelance job post against a freelancer's verified profile, to prepare for writing a
proposal later. Compare the job's needs against the profile honestly.

${FACTUALITY_RULE}

FREELANCER PROFILE:
${renderProfileForPrompt(profile)}

JOB POST:
${rawJobPost}

Return a JSON object with:
- clientNeeds: short phrases describing what the client is trying to achieve.
- requiredSkills: skills/tools the job post asks for.
- painPoints: problems or frustrations implied by the job post.
- relevantProfileEvidence: specific facts, skills, or evidence items taken directly from the FREELANCER PROFILE
  above that are relevant to this job. Do not include anything not present in the profile.
- missingExperience: things the job asks for that are NOT present in the profile. Empty array if none.
- proposalAngle: one or two sentences on the best honest angle for a proposal, given real overlap only.
`.trim();
}

export function buildGenerateProposalPrompt(
  profile: FreelancerProfile,
  rawJobPost: string,
  analysis: JobAnalysis
): string {
  const { tone, preferredLength, ctaStyle } = profile.proposalPreferences;

  const lengthGuide: Record<typeof preferredLength, string> = {
    short: "roughly 100-150 words",
    medium: "roughly 150-220 words",
    long: "roughly 220-300 words",
  };

  const ctaGuide: Record<typeof ctaStyle, string> = {
    direct: "end with a direct, confident ask for the next step (e.g. a call or reply)",
    soft: "end by leaving the door open rather than pushing for an immediate commitment",
    question: "end with a genuine question that invites a reply",
  };

  return `
Write a freelance proposal in response to the job post below, written by the freelancer themself in the
first person. It must read as a real person wrote it — natural, concise, not generic AI-sounding, and not
overly formal. Never mention that AI wrote it or reference this prompt.

${FACTUALITY_RULE}

FREELANCER PROFILE:
${renderProfileForPrompt(profile)}

JOB POST:
${rawJobPost}

JOB ANALYSIS (already produced from the profile above — use it, don't contradict it):
- Client needs: ${analysis.clientNeeds.join("; ") || "none identified"}
- Required skills: ${analysis.requiredSkills.join("; ") || "none identified"}
- Pain points: ${analysis.painPoints.join("; ") || "none identified"}
- Relevant profile evidence: ${analysis.relevantProfileEvidence.join("; ") || "none identified"}
- Missing experience: ${analysis.missingExperience.join("; ") || "none"}
- Proposal angle: ${analysis.proposalAngle}

Preferences to follow:
- Tone: ${tone}
- Length: ${lengthGuide[preferredLength]}
- Call to action: ${ctaGuide[ctaStyle]}

Generally include (without a rigid template): a relevant opening, why the freelancer fits, specific evidence
from the profile, how they'd approach the problem, and a simple call to action. If missingExperience is
non-empty, do not claim that experience — lean on what's genuinely relevant instead.

Return only the proposal text, no headings or preamble.
`.trim();
}

export function buildRewriteProposalPrompt(
  profile: FreelancerProfile,
  analysis: JobAnalysis,
  currentProposal: string,
  instructions: string
): string {
  return `
Revise the freelance proposal below per the instructions, written by the freelancer themself in the first
person. Keep it natural and concise, and do not mention AI.

${FACTUALITY_RULE}

FREELANCER PROFILE:
${renderProfileForPrompt(profile)}

JOB ANALYSIS:
- Relevant profile evidence: ${analysis.relevantProfileEvidence.join("; ") || "none identified"}
- Missing experience: ${analysis.missingExperience.join("; ") || "none"}

CURRENT PROPOSAL:
${currentProposal}

INSTRUCTIONS:
${instructions}

Return only the revised proposal text, no headings or preamble.
`.trim();
}
