/**
 * Result of analysing a pasted job post against a freelancer's verified
 * profile. `relevantProfileEvidence` must be a list of items pulled directly
 * from the profile's ExperienceEntry.evidence — never fabricated. Similarly,
 * `missingExperience` documents real gaps rather than being papered over.
 */
export interface JobAnalysis {
  clientNeeds: string[];
  requiredSkills: string[];
  painPoints: string[];
  relevantProfileEvidence: string[];
  missingExperience: string[];
  proposalAngle: string;
}
