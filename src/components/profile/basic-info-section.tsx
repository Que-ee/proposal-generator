"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import type { FreelancerProfile } from "@/types";

export function BasicInfoSection({
  profile,
  errors,
  onChange,
}: {
  profile: FreelancerProfile;
  errors: Record<string, string>;
  onChange: (patch: Partial<FreelancerProfile>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
          <Input
            id="fullName"
            value={profile.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Jane Doe"
          />
        </Field>

        <Field
          label="Professional title"
          htmlFor="professionalTitle"
          error={errors.professionalTitle}
        >
          <Input
            id="professionalTitle"
            value={profile.professionalTitle}
            onChange={(e) => onChange({ professionalTitle: e.target.value })}
            placeholder="Senior Product Designer"
          />
        </Field>

        <Field
          label="Short bio"
          htmlFor="bio"
          error={errors.bio}
          className="sm:col-span-2"
        >
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="A couple of sentences about who you are and the work you do."
            rows={3}
          />
        </Field>

        <Field
          label="Years of experience"
          htmlFor="yearsExperience"
          error={errors.yearsExperience}
        >
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            value={profile.yearsExperience}
            onChange={(e) =>
              onChange({ yearsExperience: Number(e.target.value) })
            }
          />
        </Field>

        <Field
          label="Portfolio URL"
          htmlFor="portfolioUrl"
          error={errors.portfolioUrl}
          hint="Optional"
        >
          <Input
            id="portfolioUrl"
            value={profile.portfolioUrl ?? ""}
            onChange={(e) =>
              onChange({ portfolioUrl: e.target.value || null })
            }
            placeholder="https://your-portfolio.com"
          />
        </Field>
      </CardContent>
    </Card>
  );
}
