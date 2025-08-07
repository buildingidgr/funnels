import React, { useState } from 'react';
import { Funnel, FunnelStep, SplitVariation, Conditions } from '@/types/funnel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Settings, Target, Plus, Edit3, CheckCircle, AlertCircle, Trash2, Split } from 'lucide-react';
import { StepConditionBuilder } from './step-condition-builder/StepConditionBuilder';

interface FunnelConfigEditorProps {
  funnel: Funnel;
  onSave: (updatedFunnel: Funnel) => Promise<void>;
}

const TIME_FRAMES = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'All time',
];

const AUDIENCES = [
  'All contacts',
  'New users',
  'Returning users',
];

export const FunnelConfigEditor: React.FC<FunnelConfigEditorProps> = ({ funnel, onSave }) => {
  const [editedFunnel, setEditedFunnel] = useState<Funnel>({ ...funnel });
  const [timeFrame, setTimeFrame] = useState<string>(TIME_FRAMES[0]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [expandedConditions, setExpandedConditions] = useState<{ [key: number]: boolean }>({});
  const [expandedSplits, setExpandedSplits] = useState<{ [key: number]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Add a timestamp to trigger re-renders in visualization components
      const updatedFunnel = { 
        ...editedFunnel, 
        lastUpdated: Date.now() 
      };
      
      await onSave(updatedFunnel);
    } catch (error) {
      console.error('Error saving funnel configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateStepConditions = (stepIndex: number, newConditions: any) => {
    const updatedSteps = [...editedFunnel.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], conditions: newConditions };
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  const addSplit = (stepIndex: number) => {
    const updatedSteps = [...editedFunnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (!step.splitVariations) {
      step.splitVariations = [];
    }
    
    const newSplit: SplitVariation = {
      id: `split-${Date.now()}`,
      name: "",
      conditions: { orEventGroups: [] },
      visitorCount: 0
    };
    
    step.splitVariations.push(newSplit);
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  const updateSplit = (stepIndex: number, splitIndex: number, field: string, value: any) => {
    const updatedSteps = [...editedFunnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.splitVariations && step.splitVariations[splitIndex]) {
      step.splitVariations[splitIndex] = { 
        ...step.splitVariations[splitIndex], 
        [field]: value 
      };
    }
    
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  const updateSplitConditions = (stepIndex: number, splitIndex: number, conditions: Conditions) => {
    const updatedSteps = [...editedFunnel.steps];
    const step = updatedSteps[stepIndex];
    if (step.splitVariations && step.splitVariations[splitIndex]) {
      step.splitVariations[splitIndex].conditions = conditions;
    }
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  const removeSplit = (stepIndex: number, splitIndex: number) => {
    const updatedSteps = [...editedFunnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.splitVariations) {
      step.splitVariations = step.splitVariations.filter((_, i) => i !== splitIndex);
    }
    
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  const getConditionSummary = (step: FunnelStep) => {
    if (!step.conditions?.orEventGroups?.length) {
      return 'No conditions set';
    }
    
    const conditions = step.conditions.orEventGroups;
    if (conditions.length === 1) {
      const condition = conditions[0];
      return `${condition.eventName || 'Event'} ${condition.operator || 'equals'} ${condition.count || 1}`;
    }
    
    return `${conditions.length} conditions set`;
  };

  const hasConditions = (step: FunnelStep) => {
    return step.conditions?.orEventGroups?.length > 0 || step.conditions?.andAlsoEvents?.length > 0;
  };

  const hasSplits = (step: FunnelStep) => {
    return step.splitVariations && step.splitVariations.length > 0;
  };

  const toggleConditions = (stepIndex: number) => {
    setExpandedConditions(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const toggleSplits = (stepIndex: number) => {
    setExpandedSplits(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}`,
      name: '',
      order: editedFunnel.steps.length + 1,
      isEnabled: true,
      isVisible: true,
      isOptional: false,
      isRequired: false,
      conditions: { orEventGroups: [] },
      splitVariations: [],
    };
    setEditedFunnel(f => ({ ...f, steps: [...f.steps, newStep] }));
  };

  const removeStep = (index: number) => {
    const updatedSteps = editedFunnel.steps.filter((_, i) => i !== index);
    // Reorder remaining steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
  };

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="funnel-name" className="text-sm font-medium">Name</Label>
            <Input
              id="funnel-name"
              value={editedFunnel.name}
              onChange={e => setEditedFunnel(f => ({ ...f, name: e.target.value }))}
              placeholder="Funnel name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="funnel-description" className="text-sm font-medium">Description</Label>
            <Input
              id="funnel-description"
              value={editedFunnel.description || ''}
              onChange={e => setEditedFunnel(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{editedFunnel.steps.length}</div>
              <div className="text-xs text-gray-600">Total Steps</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{editedFunnel.steps.filter(hasConditions).length}</div>
              <div className="text-xs text-gray-600">With Conditions</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{editedFunnel.steps.filter(hasSplits).length}</div>
              <div className="text-xs text-gray-600">With Splits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Steps
            </CardTitle>
            <Button onClick={addStep} size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editedFunnel.steps.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No steps defined yet</p>
              <Button onClick={addStep} size="sm" variant="outline" className="mt-2">
                <Plus className="h-3 w-3 mr-1" />
                Add First Step
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {editedFunnel.steps.map((step, index) => (
                <AccordionItem key={step.id} value={`step-${index}`} className="border rounded-lg">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">
                          {step.name || `Step ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getConditionSummary(step)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasConditions(step) ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Set
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            None
                          </Badge>
                        )}
                        {hasSplits(step) && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                            <Split className="h-3 w-3 mr-1" />
                            {step.splitVariations?.length || 0} splits
                          </Badge>
                        )}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(index);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex items-center justify-center cursor-pointer rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                      {/* Step Name */}
                      <div>
                        <Label className="text-xs font-medium">Name</Label>
                        <Input
                          value={step.name}
                          onChange={e => {
                            const updatedSteps = [...editedFunnel.steps];
                            updatedSteps[index] = { ...updatedSteps[index], name: e.target.value };
                            setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
                          }}
                          placeholder={`Step ${index + 1} name`}
                          className="mt-1 text-sm"
                        />
                      </div>

                      {/* Step Settings */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={step.isEnabled}
                            onCheckedChange={(checked) => {
                              const updatedSteps = [...editedFunnel.steps];
                              updatedSteps[index] = { ...updatedSteps[index], isEnabled: checked };
                              setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
                            }}
                          />
                          <Label className="text-xs">Enabled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={step.isRequired ?? false}
                            onCheckedChange={(checked) => {
                              const updatedSteps = [...editedFunnel.steps];
                              updatedSteps[index] = { ...updatedSteps[index], isRequired: checked };
                              setEditedFunnel(f => ({ ...f, steps: updatedSteps }));
                            }}
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                      </div>

                      {/* Conditions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-medium">Conditions</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleConditions(index)}
                            className="h-6 text-xs"
                          >
                            {expandedConditions[index] ? 'Hide' : 'Edit'}
                          </Button>
                        </div>
                        
                        {expandedConditions[index] && (
                          <div className="border rounded p-2 bg-gray-50">
                            <StepConditionBuilder
                              conditions={step.conditions}
                              onChange={(newConditions) => updateStepConditions(index, newConditions)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Split Variations */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Split className="h-4 w-4 text-blue-600" />
                            <Label className="text-xs font-medium">Split Variations</Label>
                            {step.splitVariations && step.splitVariations.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {step.splitVariations.length} {step.splitVariations.length === 1 ? 'variation' : 'variations'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSplits(index)}
                              className="h-6 text-xs"
                            >
                              {expandedSplits[index] ? 'Hide' : 'Edit'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSplit(index)}
                              className="h-6 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedSplits[index] && (
                          <div className="space-y-3">
                            {!step.splitVariations || step.splitVariations.length === 0 ? (
                              <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                <Split className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground mb-2">No split variations</p>
                                <p className="text-xs text-muted-foreground">
                                  Add split variations to create A/B tests or different user paths
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {step.splitVariations.map((split, splitIndex) => (
                                  <SplitItem 
                                    key={`split-${splitIndex}`}
                                    split={split}
                                    splitIndex={splitIndex}
                                    onUpdateSplit={(field, value) => updateSplit(index, splitIndex, field, value)}
                                    onUpdateConditions={(conditions) => updateSplitConditions(index, splitIndex, conditions)}
                                    onRemove={() => removeSplit(index, splitIndex)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-2">
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Calculating...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </div>
  );
};

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
          <Trash2 className="h-3 w-3" />
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