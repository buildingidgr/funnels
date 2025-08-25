import React, { useState } from 'react';
import { FunnelStep, SplitVariation } from '@/types/funnel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FunnelStepListEditorProps {
  steps: FunnelStep[];
  onStepsChange: (steps: FunnelStep[]) => void;
}

const FunnelStepListEditor: React.FC<FunnelStepListEditorProps> = ({ steps, onStepsChange }) => {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  // Step manipulation handlers
  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}`,
      name: '',
      order: steps.length + 1,
      isEnabled: true,
      isVisible: true,
      isOptional: false,
      isRequired: false,
      conditions: { orEventGroups: [] },
      splitVariations: [],
    };
    const newSteps = [...steps, newStep];
    onStepsChange(newSteps);
  };

  const updateStep = (index: number, field: keyof FunnelStep, value: string | number | boolean) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    onStepsChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    onStepsChange(updatedSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const updatedSteps = [...steps];
    if (direction === 'up' && index > 0) {
      [updatedSteps[index - 1], updatedSteps[index]] = [updatedSteps[index], updatedSteps[index - 1]];
    } else if (direction === 'down' && index < steps.length - 1) {
      [updatedSteps[index], updatedSteps[index + 1]] = [updatedSteps[index + 1], updatedSteps[index]];
    }
    // Reorder
    updatedSteps.forEach((step, i) => (step.order = i + 1));
    onStepsChange(updatedSteps);
  };

  const toggleExpand = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const hasConditions = (step: FunnelStep) => {
    return step.conditions?.orEventGroups?.length > 0 || step.conditions?.andAlsoEvents?.length > 0;
  };

  const getConditionSummary = (step: FunnelStep) => {
    if (!step.conditions?.orEventGroups?.length) {
      return 'No conditions';
    }
    
    const conditions = step.conditions.orEventGroups;
    if (conditions.length === 1) {
      const condition = conditions[0];
      return `${condition.eventName || 'Event'} ${condition.operator || 'equals'} ${condition.count || 1}`;
    }
    
    return `${conditions.length} conditions`;
  };

  return (
    <div className="space-y-4">
      {steps.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No steps defined</p>
          <p className="text-sm mb-4">Start by adding your first funnel step</p>
          <Button onClick={addStep} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add First Step
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <Card key={step.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={step.name}
                        onChange={e => updateStep(idx, 'name', e.target.value)}
                        placeholder={`Step ${idx + 1} name`}
                        className="border-0 p-0 text-lg font-medium focus-visible:ring-0"
                      />
                      <Input
                        value={step.description || ''}
                        onChange={e => updateStep(idx, 'description', e.target.value)}
                        placeholder="Step description (optional)"
                        className="border-0 p-0 text-sm text-gray-500 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={hasConditions(step) ? "default" : "outline"}>
                      {getConditionSummary(step)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(idx)}
                    >
                      {expanded[idx] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expanded[idx] && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={step.isEnabled} 
                        onCheckedChange={v => updateStep(idx, 'isEnabled', v)} 
                      />
                      <span className="text-sm">Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={step.isVisible ?? true} 
                        onCheckedChange={v => updateStep(idx, 'isVisible', v)} 
                      />
                      <span className="text-sm">Visible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={step.isOptional ?? false} 
                        onCheckedChange={v => updateStep(idx, 'isOptional', v)} 
                      />
                      <span className="text-sm">Optional</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={step.isRequired ?? false} 
                        onCheckedChange={v => updateStep(idx, 'isRequired', v)} 
                      />
                      <span className="text-sm">Required</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveStep(idx, 'up')}
                      disabled={idx === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                      Move Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveStep(idx, 'down')}
                      disabled={idx === steps.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                      Move Down
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Button
        onClick={addStep}
        variant="outline"
        className="w-full flex items-center gap-2 py-6 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Step
      </Button>
    </div>
  );
};

export default FunnelStepListEditor; 