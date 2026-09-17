import { createBrowserClient } from "@/lib/supabase/client";
import type { FreelancerProfile } from "@/types";
import {
  experienceEntriesToRows,
  profileFromRows,
  profileToRow,
  type ExperienceEntryRow,
  type FreelancerProfileRow,
} from "./mappers";

/**
 * There is no auth yet, so every profile row currently has `user_id is
 * null` (see supabase/migrations/0001_init.sql). Until login exists, the
 * product only supports a single freelancer profile: the first ownerless
 * row. Once auth ships, this becomes a lookup by the signed-in user's id.
 */
export async function getMyProfile(): Promise<FreelancerProfile | null> {
  const supabase = createBrowserClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("freelancer_profiles")
    .select(
      "id, user_id, full_name, professional_title, bio, years_experience, portfolio_url, skills, proposal_preferences"
    )
    .is("user_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<FreelancerProfileRow>();

  if (profileError) throw profileError;
  if (!profileRow) return null;

  const { data: experienceRows, error: experienceError } = await supabase
    .from("experience_entries")
    .select("id, profile_id, title, company, role, description, skills, evidence")
    .eq("profile_id", profileRow.id)
    .order("created_at", { ascending: true })
    .returns<ExperienceEntryRow[]>();

  if (experienceError) throw experienceError;

  return profileFromRows(profileRow, experienceRows ?? []);
}

/**
 * Upserts the profile row, then replaces its experience entries wholesale.
 * A full replace (delete + insert) is simpler and safe at this scale than
 * diffing added/edited/removed entries, and avoids stray rows if an entry
 * was removed in the form.
 */
export async function saveProfile(
  profile: FreelancerProfile
): Promise<FreelancerProfile> {
  const supabase = createBrowserClient();

  const { data: savedProfileRow, error: profileError } = await supabase
    .from("freelancer_profiles")
    .upsert(profileToRow(profile))
    .select(
      "id, user_id, full_name, professional_title, bio, years_experience, portfolio_url, skills, proposal_preferences"
    )
    .single<FreelancerProfileRow>();

  if (profileError) throw profileError;

  const { error: deleteError } = await supabase
    .from("experience_entries")
    .delete()
    .eq("profile_id", savedProfileRow.id);

  if (deleteError) throw deleteError;

  const rows = experienceEntriesToRows({ ...profile, id: savedProfileRow.id });
  let savedExperienceRows: ExperienceEntryRow[] = [];

  if (rows.length > 0) {
    const { data, error: insertError } = await supabase
      .from("experience_entries")
      .insert(rows)
      .select("id, profile_id, title, company, role, description, skills, evidence")
      .returns<ExperienceEntryRow[]>();

    if (insertError) throw insertError;
    savedExperienceRows = data ?? [];
  }

  return profileFromRows(savedProfileRow, savedExperienceRows);
}
