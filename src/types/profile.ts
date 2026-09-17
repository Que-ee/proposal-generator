/**
 * A single piece of work history that backs proposal claims with verifiable
 * detail. `evidence` holds measurable outcomes (e.g. "cut load time 40%") —
 * this is the only place the AI is allowed to source metrics/results from.
 */
export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  skills: string[];
  evidence: string[];
}

export type ProposalTone = "professional" | "friendly" | "confident" | "casual";
export type ProposalLength = "short" | "medium" | "long";
export type ProposalCtaStyle = "direct" | "soft" | "question";

export interface ProposalPreferences {
  tone: ProposalTone;
  preferredLength: ProposalLength;
  ctaStyle: ProposalCtaStyle;
}

/**
 * The freelancer's verified professional profile. This is the single source
 * of truth the AI must be constrained to when generating proposals — nothing
 * outside this record (skills, years, companies, results) may be invented.
 */
export interface FreelancerProfile {
  id: string;
  fullName: string;
  professionalTitle: string;
  bio: string;
  yearsExperience: number;
  portfolioUrl: string | null;
  skills: string[];
  experienceEntries: ExperienceEntry[];
  proposalPreferences: ProposalPreferences;
}
