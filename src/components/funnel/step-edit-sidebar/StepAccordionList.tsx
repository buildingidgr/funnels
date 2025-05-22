import React from "react";
import { FunnelStep } from "@/types/funnel";
import { Accordion } from "@/components/ui/accordion";
import { StepAccordionItem } from "./StepAccordionItem";
import { Separator } from "@/components/ui/separator";
import { Conditions } from "@/types/funnel";

interface StepAccordionListProps {
  steps: FunnelStep[];
  onChange: (updatedSteps: FunnelStep[]) => void;
}

export function StepAccordionList({ steps, onChange }: StepAccordionListProps) {
  const updateStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    onChange(updatedSteps);
  };

  const updateStepConditions = (stepIndex: number, conditions: Conditions) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].conditions = conditions;
    onChange(updatedSteps);
  };

  const addSplit = (stepIndex: number) => {
    const updatedSteps = [...steps];
    const step = updatedSteps[stepIndex];
    
    if (!step.splitVariations) {
      step.splitVariations = [];
    }
    
    const newSplit = {
      id: `split-${Date.now()}`,
      name: "",
      conditions: { orEventGroups: [] },
      visitorCount: 0
    };
    
    step.splitVariations.push(newSplit);
    onChange(updatedSteps);
  };

  const updateSplit = (stepIndex: number, splitIndex: number, field: string, value: any) => {
    const updatedSteps = [...steps];
    const step = updatedSteps[stepIndex];
    
    if (step.splitVariations && step.splitVariations[splitIndex]) {
      step.splitVariations[splitIndex] = { 
        ...step.splitVariations[splitIndex], 
        [field]: value 
      };
    }
    
    onChange(updatedSteps);
  };

  const updateSplitConditions = (stepIndex: number, splitIndex: number, conditions: Conditions) => {
    const updatedSteps = [...steps];
    const step = updatedSteps[stepIndex];
    if (step.splitVariations && step.splitVariations[splitIndex]) {
      step.splitVariations[splitIndex].conditions = conditions;
    }
    onChange(updatedSteps);
  };

  const removeSplit = (stepIndex: number, splitIndex: number) => {
    const updatedSteps = [...steps];
    const step = updatedSteps[stepIndex];
    
    if (step.splitVariations) {
      step.splitVariations = step.splitVariations.filter((_, i) => i !== splitIndex);
    }
    
    onChange(updatedSteps);
  };

  return (
    <div className="space-y-4 py-2">
      <Accordion type="multiple" defaultValue={steps.map((_, idx) => `step-${idx}`)}>
        {steps.map((step, stepIndex) => (
          <div key={`step-${stepIndex}`} className="space-y-2">
            {stepIndex > 0 && <Separator className="my-2" />}
            <StepAccordionItem
              step={step}
              stepIndex={stepIndex}
              onUpdateStep={(field, value) => updateStep(stepIndex, field, value)}
              onUpdateConditions={(conditions) => updateStepConditions(stepIndex, conditions)}
              onAddSplit={() => addSplit(stepIndex)}
              onUpdateSplit={(splitIndex, field, value) => updateSplit(stepIndex, splitIndex, field, value)}
              onUpdateSplitConditions={(splitIndex, conditions) => updateSplitConditions(stepIndex, splitIndex, conditions)}
              onRemoveSplit={(splitIndex) => removeSplit(stepIndex, splitIndex)}
            />
          </div>
        ))}
      </Accordion>
    </div>
  );
}
