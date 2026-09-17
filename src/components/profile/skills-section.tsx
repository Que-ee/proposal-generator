"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagInput } from "@/components/shared/tag-input";

export function SkillsSection({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <TagInput
          values={skills}
          onChange={onChange}
          placeholder="e.g. Product Design, Figma, Fintech"
          aria-label="Add a skill"
        />
      </CardContent>
    </Card>
  );
}
