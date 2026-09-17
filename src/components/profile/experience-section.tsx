"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperienceEntryCard } from "./experience-entry-card";
import type { ExperienceEntry } from "@/types";

function emptyEntry(): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    title: "",
    company: "",
    role: "",
    description: "",
    skills: [],
    evidence: [],
  };
}

export function ExperienceSection({
  entries,
  errors,
  onChange,
}: {
  entries: ExperienceEntry[];
  errors: Record<string, Record<string, string>>;
  onChange: (entries: ExperienceEntry[]) => void;
}) {
  function updateAt(index: number, patch: Partial<ExperienceEntry>) {
    onChange(
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );
  }

  function removeAt(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function addEntry() {
    onChange([...entries, emptyEntry()]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No experience added yet. Add a role or project so the AI has
            something real to draw from.
          </p>
        ) : null}

        {entries.map((entry, index) => (
          <ExperienceEntryCard
            key={entry.id}
            entry={entry}
            index={index}
            errors={errors[index] ?? {}}
            onChange={(patch) => updateAt(index, patch)}
            onRemove={() => removeAt(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          className="w-fit gap-1.5"
        >
          <Plus className="size-4" />
          Add experience
        </Button>
      </CardContent>
    </Card>
  );
}
