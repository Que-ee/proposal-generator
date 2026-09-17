import type { ExperienceEntry, FreelancerProfile } from "@/types";

/**
 * Row shapes as they exist in Postgres (snake_case, JSON-typed columns).
 * Kept local to this mapper rather than generated, since the schema is small
 * and stable for the MVP.
 */
export interface FreelancerProfileRow {
  id: string;
  user_id: string | null;
  full_name: string;
  professional_title: string;
  bio: string;
  years_experience: number;
  portfolio_url: string | null;
  skills: string[];
  proposal_preferences: FreelancerProfile["proposalPreferences"];
}

export interface ExperienceEntryRow {
  id: string;
  profile_id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  skills: string[];
  evidence: string[];
}

export function profileFromRows(
  profileRow: FreelancerProfileRow,
  experienceRows: ExperienceEntryRow[]
): FreelancerProfile {
  return {
    id: profileRow.id,
    fullName: profileRow.full_name,
    professionalTitle: profileRow.professional_title,
    bio: profileRow.bio,
    yearsExperience: profileRow.years_experience,
    portfolioUrl: profileRow.portfolio_url,
    skills: profileRow.skills,
    proposalPreferences: profileRow.proposal_preferences,
    experienceEntries: experienceRows.map(
      (row): ExperienceEntry => ({
        id: row.id,
        title: row.title,
        company: row.company,
        role: row.role,
        description: row.description,
        skills: row.skills,
        evidence: row.evidence,
      })
    ),
  };
}

export function profileToRow(
  profile: FreelancerProfile
): Omit<FreelancerProfileRow, "user_id"> {
  return {
    id: profile.id,
    full_name: profile.fullName,
    professional_title: profile.professionalTitle,
    bio: profile.bio,
    years_experience: profile.yearsExperience,
    portfolio_url: profile.portfolioUrl,
    skills: profile.skills,
    proposal_preferences: profile.proposalPreferences,
  };
}

export function experienceEntriesToRows(
  profile: FreelancerProfile
): ExperienceEntryRow[] {
  return profile.experienceEntries.map((entry) => ({
    id: entry.id,
    profile_id: profile.id,
    title: entry.title,
    company: entry.company,
    role: entry.role,
    description: entry.description,
    skills: entry.skills,
    evidence: entry.evidence,
  }));
}
