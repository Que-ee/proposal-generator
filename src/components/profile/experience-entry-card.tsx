"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { TagInput } from "@/components/shared/tag-input";
import { ListInput } from "@/components/shared/list-input";
import type { ExperienceEntry } from "@/types";

export function ExperienceEntryCard({
  entry,
  index,
  errors,
  onChange,
  onRemove,
}: {
  entry: ExperienceEntry;
  index: number;
  errors: Record<string, string>;
  onChange: (patch: Partial<ExperienceEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          {entry.title || `Experience ${index + 1}`}
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove this experience entry"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={errors.title}>
          <Input
            value={entry.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Redesigned onboarding flow"
          />
        </Field>

        <Field label="Company" error={errors.company}>
          <Input
            value={entry.company}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="Acme Inc."
          />
        </Field>

        <Field label="Role" error={errors.role}>
          <Input
            value={entry.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="Lead Product Designer"
          />
        </Field>

        <Field label="Description" error={errors.description} className="sm:col-span-2">
          <Textarea
            value={entry.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What you did and why it mattered."
            rows={3}
          />
        </Field>

        <Field label="Skills used" className="sm:col-span-2">
          <TagInput
            values={entry.skills}
            onChange={(skills) => onChange({ skills })}
            placeholder="e.g. Figma, UX Research"
          />
        </Field>

        <Field
          label="Evidence / measurable outcomes"
          hint="Short, verifiable results. Not every item needs a number."
          className="sm:col-span-2"
        >
          <ListInput
            values={entry.evidence}
            onChange={(evidence) => onChange({ evidence })}
            placeholder="e.g. Improved retention by 25%"
            addLabel="Add evidence"
          />
        </Field>
      </CardContent>
    </Card>
  );
}
