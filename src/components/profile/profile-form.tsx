"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyProfile, saveProfile } from "@/lib/profile/api";
import { freelancerProfileSchema } from "@/types";
import type { FreelancerProfile } from "@/types";
import { BasicInfoSection } from "./basic-info-section";
import { SkillsSection } from "./skills-section";
import { ExperienceSection } from "./experience-section";
import { PreferencesSection } from "./preferences-section";

function emptyProfile(): FreelancerProfile {
  return {
    id: crypto.randomUUID(),
    fullName: "",
    professionalTitle: "",
    bio: "",
    yearsExperience: 0,
    portfolioUrl: null,
    skills: [],
    experienceEntries: [],
    proposalPreferences: {
      tone: "professional",
      preferredLength: "medium",
      ctaStyle: "direct",
    },
  };
}

type FieldErrors = Record<string, string>;
type ExperienceErrors = Record<string, FieldErrors>;

/** Normalizes form state before validation (e.g. blank URL -> null). */
function normalize(profile: FreelancerProfile): FreelancerProfile {
  return {
    ...profile,
    portfolioUrl: profile.portfolioUrl?.trim() ? profile.portfolioUrl.trim() : null,
  };
}

export function ProfileForm() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [experienceErrors, setExperienceErrors] = useState<ExperienceErrors>({});

  useEffect(() => {
    let cancelled = false;

    getMyProfile()
      .then((existing) => {
        if (cancelled) return;
        setProfile(existing ?? emptyProfile());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load profile");
        setProfile(emptyProfile());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(update: Partial<FreelancerProfile>) {
    setProfile((prev) => (prev ? { ...prev, ...update } : prev));
    setSaved(false);
  }

  async function handleSave() {
    if (!profile) return;

    const candidate = normalize(profile);
    const result = freelancerProfileSchema.safeParse(candidate);

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      const nextExperienceErrors: ExperienceErrors = {};

      for (const issue of result.error.issues) {
        const [first, second, third] = issue.path;
        if (first === "experienceEntries" && typeof second === "number" && third) {
          const key = String(second);
          nextExperienceErrors[key] = {
            ...nextExperienceErrors[key],
            [String(third)]: issue.message,
          };
        } else if (typeof first === "string") {
          nextErrors[first] = issue.message;
        }
      }

      setErrors(nextErrors);
      setExperienceErrors(nextExperienceErrors);
      setSaveError("Please fix the highlighted fields before saving.");
      setSaved(false);
      return;
    }

    setErrors({});
    setExperienceErrors({});
    setSaveError(null);
    setSaving(true);
    setSaved(false);

    try {
      const savedProfile = await saveProfile(candidate);
      setProfile(savedProfile);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {loadError ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Couldn&apos;t load a saved profile ({loadError}). You can still fill
          this out and save.
        </div>
      ) : null}

      <BasicInfoSection profile={profile} errors={errors} onChange={patch} />

      <SkillsSection
        skills={profile.skills}
        onChange={(skills) => patch({ skills })}
      />

      <ExperienceSection
        entries={profile.experienceEntries}
        errors={experienceErrors}
        onChange={(experienceEntries) => patch({ experienceEntries })}
      />

      <PreferencesSection
        preferences={profile.proposalPreferences}
        onChange={(update) =>
          patch({
            proposalPreferences: { ...profile.proposalPreferences, ...update },
          })
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={handleSave} disabled={saving} className="w-fit">
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saving ? "Saving…" : "Save profile"}
        </Button>

        {saved ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            Saved
          </span>
        ) : null}

        {saveError ? (
          <span className="flex items-center gap-1.5 text-sm text-destructive">
            <TriangleAlert className="size-4" />
            {saveError}
          </span>
        ) : null}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Stored in your Supabase database, not just this browser.
      </p>
    </div>
  );
}
