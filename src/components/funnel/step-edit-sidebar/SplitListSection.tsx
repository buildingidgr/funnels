import { SplitVariation, Conditions } from "@/types/funnel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, Split } from "lucide-react";
import { StepConditionBuilder } from "@/components/funnel/step-condition-builder/StepConditionBuilder";
import { Badge } from "@/components/ui/badge";

interface SplitListSectionProps {
  splits: SplitVariation[];
  onAddSplit: () => void;
  onUpdateSplit: (splitIndex: number, field: string, value: string | number) => void;
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Split className="h-4 w-4 text-blue-600" />
          <Label className="text-sm font-medium">Split Variations</Label>
          {splits && splits.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {splits.length} {splits.length === 1 ? 'variation' : 'variations'}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddSplit}
          className="h-7 px-2 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Split
        </Button>
      </div>

      {!splits || splits.length === 0 ? (
        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Split className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">No split variations</p>
          <p className="text-xs text-muted-foreground">
            Add split variations to create A/B tests or different user paths
          </p>
        </div>
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
  onUpdateSplit: (field: string, value: string | number) => void;
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
    <div className="border border-blue-200 rounded-md p-3 space-y-3 bg-blue-50/30">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-blue-700">Split Variation {splitIndex + 1}</h4>
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
            A/B Test
          </Badge>
        </div>
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
        <Label htmlFor={`split-name-${splitIndex}`} className="text-xs font-medium">
          Variation Name
        </Label>
        <Input
          id={`split-name-${splitIndex}`}
          value={split.name}
          onChange={(e) => onUpdateSplit("name", e.target.value)}
          placeholder="e.g., Control Group, Variant A"
          className="h-7 text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Conditions</Label>
        <div className="text-xs text-muted-foreground mb-2">
          Define when this variation should be shown to users
        </div>
        <StepConditionBuilder 
          conditions={split.conditions}
          onChange={onUpdateConditions}
        />
      </div>
    </div>
  );
}
