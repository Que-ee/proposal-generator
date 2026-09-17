"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function JobInputPanel({
  jobPost,
  onChange,
  onAnalyze,
  analyzing,
  disabled,
}: {
  jobPost: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job description</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          value={jobPost}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the job post here…"
          rows={16}
          disabled={disabled}
          aria-label="Job description"
        />
        <Button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || analyzing || jobPost.trim().length === 0}
          className="w-fit gap-1.5"
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {analyzing ? "Analysing…" : "Analyse job"}
        </Button>
      </CardContent>
    </Card>
  );
}
