import React from "react";
import { FunnelStep, FunnelStepCondition } from "@/types/funnel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { StepConditionBuilder } from "@/components/funnel/StepConditionBuilder";
import { SplitListSection } from "./SplitListSection";

interface StepAccordionItemProps {
  step: FunnelStep;
  stepIndex: number;
  onUpdateStep: (field: string, value: any) => void;
  onUpdateConditions: (conditions: FunnelStepCondition[]) => void;
  onAddSplit: () => void;
  onUpdateSplit: (splitIndex: number, field: string, value: any) => void;
  onUpdateSplitConditions: (splitIndex: number, conditions: FunnelStepCondition[]) => void;
  onRemoveSplit: (splitIndex: number) => void;
}

export function StepAccordionItem({
  step,
  stepIndex,
  onUpdateStep,
  onUpdateConditions,
  onAddSplit,
  onUpdateSplit,
  onUpdateSplitConditions,
  onRemoveSplit
}: StepAccordionItemProps) {
  return (
    <AccordionItem value={`step-${stepIndex}`} className="border rounded-md overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
        <div className="flex items-center space-x-2 text-left">
          <div
            className={`w-2 h-2 rounded-full ${
              step.enable ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span>
            Step {step.number}: {step.name || "Unnamed Step"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`step-name-${stepIndex}`}>Step Name</Label>
            <Input
              id={`step-name-${stepIndex}`}
              value={step.name}
              onChange={(e) => onUpdateStep("name", e.target.value)}
              maxLength={40}
              className="h-8"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id={`step-enable-${stepIndex}`}
              checked={step.enable}
              onCheckedChange={(checked) => onUpdateStep("enable", checked)}
            />
            <Label htmlFor={`step-enable-${stepIndex}`} className="text-sm">Enable Step</Label>
          </div>

          <StepConditionBuilder 
            conditions={step.conditions}
            onChange={onUpdateConditions}
          />

          <SplitListSection
            splits={step.split || []}
            onAddSplit={onAddSplit}
            onUpdateSplit={onUpdateSplit}
            onUpdateSplitConditions={onUpdateSplitConditions}
            onRemoveSplit={onRemoveSplit}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
