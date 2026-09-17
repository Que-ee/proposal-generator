import { z } from "zod";

/**
 * Runtime validation for the structures that cross a trust boundary: data
 * coming back from the AI provider (which can return malformed or
 * unexpected JSON) and data going into/out of the database. These mirror the
 * TypeScript interfaces in profile.ts/job.ts and must be kept in sync with
 * them by hand — there is no codegen here, this is an MVP.
 */

export const experienceEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string(),
  skills: z.array(z.string()),
  evidence: z.array(z.string()),
});

export const proposalToneSchema = z.enum([
  "professional",
  "friendly",
  "confident",
  "casual",
]);
export const proposalLengthSchema = z.enum(["short", "medium", "long"]);
export const proposalCtaStyleSchema = z.enum(["direct", "soft", "question"]);

export const proposalPreferencesSchema = z.object({
  tone: proposalToneSchema,
  preferredLength: proposalLengthSchema,
  ctaStyle: proposalCtaStyleSchema,
});

export const freelancerProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1),
  professionalTitle: z.string().min(1),
  bio: z.string(),
  yearsExperience: z.number().int().min(0),
  portfolioUrl: z.string().url().nullable(),
  skills: z.array(z.string()),
  experienceEntries: z.array(experienceEntrySchema),
  proposalPreferences: proposalPreferencesSchema,
});

/**
 * Validates the AI's job-analysis output before the rest of the product
 * trusts it. This checks shape only — it cannot on its own guarantee that
 * `relevantProfileEvidence` was actually drawn from the profile rather than
 * invented; that guarantee has to come from prompting and output
 * cross-checking against the profile, which is out of scope for this task.
 */
export const jobAnalysisSchema = z.object({
  clientNeeds: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  painPoints: z.array(z.string()),
  relevantProfileEvidence: z.array(z.string()),
  missingExperience: z.array(z.string()),
  proposalAngle: z.string(),
});

export type FreelancerProfileInput = z.infer<typeof freelancerProfileSchema>;
export type ExperienceEntryInput = z.infer<typeof experienceEntrySchema>;
export type ProposalPreferencesInput = z.infer<typeof proposalPreferencesSchema>;
export type JobAnalysisInput = z.infer<typeof jobAnalysisSchema>;
