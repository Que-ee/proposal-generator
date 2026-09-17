"use client";

import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Add/remove/edit over a plain string[] — used for evidence items. Each
 * item is a free-form short line, not assumed to be numeric.
 */
export function ListInput({
  values,
  onChange,
  placeholder = "Add an item",
  addLabel = "Add item",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  function updateAt(index: number, value: string) {
    onChange(values.map((v, i) => (i === index ? value : v)));
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...values, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => updateAt(index, e.target.value)}
            placeholder={placeholder}
            aria-label={`${placeholder} ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeAt(index)}
            aria-label="Remove item"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-fit gap-1"
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
