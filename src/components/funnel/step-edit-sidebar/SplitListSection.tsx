import React from "react";
import { SplitVariation, Conditions } from "@/types/funnel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { StepConditionBuilder } from "@/components/funnel/StepConditionBuilder";

interface SplitListSectionProps {
  splits: SplitVariation[];
  onAddSplit: () => void;
  onUpdateSplit: (splitIndex: number, field: string, value: any) => void;
  onUpdateSplitConditions: (splitIndex: number, conditions: Conditions) => void;
  onRemoveSplit: (splitIndex: number) => void;
}

export function SplitListSection({
  splits,
  onAddSplit,
  onUpdateSplit,
  onUpdateSplitConditions,
  onRemoveSplit
}: SplitListSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">Split Options</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddSplit}
          className="h-7 px-2 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Split
        </Button>
      </div>

      {!splits || splits.length === 0 ? (
        <p className="text-xs text-muted-foreground">No splits</p>
      ) : (
        <div className="space-y-3">
          {splits.map((split, splitIndex) => (
            <SplitItem 
              key={`split-${splitIndex}`}
              split={split}
              splitIndex={splitIndex}
              onUpdateSplit={(field, value) => onUpdateSplit(splitIndex, field, value)}
              onUpdateConditions={(conditions) => onUpdateSplitConditions(splitIndex, conditions)}
              onRemove={() => onRemoveSplit(splitIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SplitItemProps {
  split: SplitVariation;
  splitIndex: number;
  onUpdateSplit: (field: string, value: any) => void;
  onUpdateConditions: (conditions: Conditions) => void;
  onRemove: () => void;
}

function SplitItem({ 
  split, 
  splitIndex, 
  onUpdateSplit, 
  onUpdateConditions, 
  onRemove 
}: SplitItemProps) {
  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-medium">Split {splitIndex + 1}</h4>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-6 w-6 text-destructive hover:text-destructive/90"
        >
          <Trash className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`split-name-${splitIndex}`} className="text-xs">Name</Label>
        <Input
          id={`split-name-${splitIndex}`}
          value={split.name}
          onChange={(e) => onUpdateSplit("name", e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      <StepConditionBuilder 
        conditions={split.conditions}
        onChange={onUpdateConditions}
      />
    </div>
  );
}
