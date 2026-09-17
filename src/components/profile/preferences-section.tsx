"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/field";
import type {
  ProposalCtaStyle,
  ProposalLength,
  ProposalPreferences,
  ProposalTone,
} from "@/types";

const TONE_OPTIONS: { value: ProposalTone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Conversational" },
];

const LENGTH_OPTIONS: { value: ProposalLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Detailed" },
];

const CTA_OPTIONS: { value: ProposalCtaStyle; label: string }[] = [
  { value: "direct", label: "Direct — ask for the next step" },
  { value: "soft", label: "Soft — leave the door open" },
  { value: "question", label: "Question — invite a reply" },
];

export function PreferencesSection({
  preferences,
  onChange,
}: {
  preferences: ProposalPreferences;
  onChange: (patch: Partial<ProposalPreferences>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal preferences</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <Field label="Tone">
          <Select
            value={preferences.tone}
            onValueChange={(value) => onChange({ tone: value as ProposalTone })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Preferred length">
          <Select
            value={preferences.preferredLength}
            onValueChange={(value) =>
              onChange({ preferredLength: value as ProposalLength })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LENGTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Call-to-action style">
          <Select
            value={preferences.ctaStyle}
            onValueChange={(value) =>
              onChange({ ctaStyle: value as ProposalCtaStyle })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  );
}
