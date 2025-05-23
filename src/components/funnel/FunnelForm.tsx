import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Funnel, FunnelStep, SplitStep, FunnelStepCondition } from "@/types/funnel";
import { toast } from "sonner";
import { FunnelApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface FunnelFormProps {
  existingFunnel?: Funnel;
  isEditing?: boolean;
  onFunnelChange?: (funnel: Funnel) => void;
}

export default function FunnelForm({ existingFunnel, isEditing = false, onFunnelChange }: FunnelFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [funnel, setFunnel] = useState<Funnel>(
    existingFunnel || {
      name: "",
      description: "",
      timeframe: {
        from: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        to: Date.now(),
      },
      performed: "all",
      steps: [],
    }
  );

  // When existingFunnel changes from outside (like from the sidebar), update local state
  useEffect(() => {
    if (existingFunnel) {
      setFunnel(existingFunnel);
    }
  }, [existingFunnel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFunnel = { ...funnel, [name]: value };
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const timestamp = new Date(value).getTime();
    const updatedFunnel = {
      ...funnel,
      timeframe: {
        ...funnel.timeframe,
        [name]: timestamp,
      },
    };
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const addStep = () => {
    const newStep: FunnelStep = {
      name: "",
      number: funnel.steps.length + 1,
      enable: true,
      required: true,
      conditions: {},
      split: [],
    };

    const updatedFunnel = {
      ...funnel,
      steps: [...funnel.steps, newStep],
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const updateStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...funnel.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };

    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const updateStepCondition = (stepIndex: number, conditions: FunnelStepCondition[]) => {
    const updatedSteps = [...funnel.steps];
    updatedSteps[stepIndex].conditions = conditions;
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const removeStepCondition = (stepIndex: number, key: string) => {
    const updatedSteps = [...funnel.steps];
    const { [key]: _, ...restConditions } = updatedSteps[stepIndex].conditions;
    updatedSteps[stepIndex].conditions = restConditions;

    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const addStepCondition = (stepIndex: number) => {
    const updatedSteps = [...funnel.steps];
    const conditionKey = `condition${Object.keys(updatedSteps[stepIndex].conditions).length + 1}`;
    updatedSteps[stepIndex].conditions[conditionKey] = "";

    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const removeStep = (index: number) => {
    const updatedSteps = funnel.steps.filter((_, i) => i !== index);
    
    // Renumber remaining steps
    updatedSteps.forEach((step, i) => {
      step.number = i + 1;
    });

    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const addSplit = (stepIndex: number) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (!step.split) {
      step.split = [];
    }
    
    const newSplit: SplitStep = {
      name: "",
      number: (step.split.length || 0) + 1,
      conditions: {},
    };
    
    step.split.push(newSplit);
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const updateSplit = (stepIndex: number, splitIndex: number, field: string, value: any) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.split && step.split[splitIndex]) {
      step.split[splitIndex] = { 
        ...step.split[splitIndex], 
        [field]: value 
      };
    }
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const updateSplitCondition = (stepIndex: number, splitIndex: number, key: string, value: string) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.split && step.split[splitIndex]) {
      step.split[splitIndex].conditions = {
        ...step.split[splitIndex].conditions,
        [key]: value,
      };
    }
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const addSplitCondition = (stepIndex: number, splitIndex: number) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.split && step.split[splitIndex]) {
      const conditionKey = `condition${Object.keys(step.split[splitIndex].conditions).length + 1}`;
      step.split[splitIndex].conditions[conditionKey] = "";
    }
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const removeSplitCondition = (stepIndex: number, splitIndex: number, key: string) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.split && step.split[splitIndex]) {
      const { [key]: _, ...restConditions } = step.split[splitIndex].conditions;
      step.split[splitIndex].conditions = restConditions;
    }
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const removeSplit = (stepIndex: number, splitIndex: number) => {
    const updatedSteps = [...funnel.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.split) {
      step.split = step.split.filter((_, i) => i !== splitIndex);
      
      // Renumber remaining splits
      if (step.split.length > 0) {
        step.split.forEach((split, i) => {
          split.number = i + 1;
        });
      }
    }
    
    const updatedFunnel = {
      ...funnel,
      steps: updatedSteps,
    };
    
    setFunnel(updatedFunnel);
    if (onFunnelChange) {
      onFunnelChange(updatedFunnel);
    }
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const updatedSteps = [...funnel.steps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[index - 1];
      updatedSteps[index - 1] = temp;
      
      // Update step numbers
      updatedSteps.forEach((step, i) => {
        step.number = i + 1;
      });
      
      const updatedFunnel = {
        ...funnel,
        steps: updatedSteps,
      };
      
      setFunnel(updatedFunnel);
      if (onFunnelChange) {
        onFunnelChange(updatedFunnel);
      }
    }
  };

  const moveStepDown = (index: number) => {
    if (index < funnel.steps.length - 1) {
      const updatedSteps = [...funnel.steps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[index + 1];
      updatedSteps[index + 1] = temp;
      
      // Update step numbers
      updatedSteps.forEach((step, i) => {
        step.number = i + 1;
      });
      
      const updatedFunnel = {
        ...funnel,
        steps: updatedSteps,
      };
      
      setFunnel(updatedFunnel);
      if (onFunnelChange) {
        onFunnelChange(updatedFunnel);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!funnel.name.trim()) {
      toast.error("Funnel name is required");
      return;
    }
    
    if (funnel.steps.length === 0) {
      toast.error("At least one step is required");
      return;
    }
    
    // Validate each step has a name
    for (const step of funnel.steps) {
      if (!step.name.trim()) {
        toast.error(`Step ${step.number} needs a name`);
        return;
      }
      
      // Validate each split has a name
      if (step.split) {
        for (const split of step.split) {
          if (!split.name.trim()) {
            toast.error(`Split ${split.number} in step ${step.number} needs a name`);
            return;
          }
        }
      }
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && funnel.id) {
        await FunnelApi.updateFunnel(funnel.id, funnel);
        toast.success("Funnel updated successfully");
      } else {
        const { id } = await FunnelApi.createFunnel(funnel);
        toast.success("Funnel created successfully");
        navigate(`/funnels/${id}`);
      }
    } catch (error) {
      console.error("Error saving funnel:", error);
      toast.error("Failed to save funnel");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Funnel" : "Create New Funnel"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Funnel Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Signup Conversion Funnel"
                value={funnel.name}
                onChange={handleChange}
                maxLength={40}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum 40 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this funnel tracking?"
                value={funnel.description}
                onChange={handleChange}
                maxLength={256}
              />
              <p className="text-xs text-muted-foreground">Maximum 256 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">Start Date</Label>
                <Input
                  id="from"
                  name="from"
                  type="date"
                  value={new Date(funnel.timeframe.from).toISOString().split("T")[0]}
                  onChange={handleTimeframeChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">End Date</Label>
                <Input
                  id="to"
                  name="to"
                  type="date"
                  value={new Date(funnel.timeframe.to).toISOString().split("T")[0]}
                  onChange={handleTimeframeChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Funnel Steps</h3>
          <Button type="button" variant="outline" onClick={addStep} className="flex items-center">
            <Plus className="mr-1 h-4 w-4" />
            Add Step
          </Button>
        </div>

        {funnel.steps.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-gray-500">No steps added yet</p>
              <Button type="button" onClick={addStep} className="flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                Add Your First Step
              </Button>
            </CardContent>
          </Card>
        ) : (
          funnel.steps.map((step, stepIndex) => (
            <Card key={stepIndex} className="overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-md">
                  Step {step.number}: {step.name || "Unnamed Step"}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveStepUp(stepIndex)}
                    disabled={stepIndex === 0}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveStepDown(stepIndex)}
                    disabled={stepIndex === funnel.steps.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeStep(stepIndex)}
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`step-name-${stepIndex}`}>Step Name</Label>
                  <Input
                    id={`step-name-${stepIndex}`}
                    value={step.name}
                    onChange={(e) => updateStep(stepIndex, "name", e.target.value)}
                    maxLength={40}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`step-enable-${stepIndex}`}
                      checked={step.enable}
                      onCheckedChange={(checked) => updateStep(stepIndex, "enable", checked)}
                    />
                    <Label htmlFor={`step-enable-${stepIndex}`}>Enable Step</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`step-required-${stepIndex}`}
                      checked={step.required}
                      onCheckedChange={(checked) => updateStep(stepIndex, "required", checked)}
                    />
                    <Label htmlFor={`step-required-${stepIndex}`}>Required Step</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Conditions</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addStepCondition(stepIndex)}
                      className="h-8 px-2 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Condition
                    </Button>
                  </div>

                  {Object.keys(step.conditions).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No conditions added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(step.conditions).map(([key, value], condIndex) => (
                        <div key={`condition-${stepIndex}-${condIndex}`} className="flex items-center space-x-2">
                          <Input
                            placeholder="Condition Key"
                            value={key}
                            onChange={(e) => {
                              const newKey = e.target.value;
                              const updatedSteps = [...funnel.steps];
                              const { [key]: oldValue, ...restConditions } = updatedSteps[stepIndex].conditions;
                              updatedSteps[stepIndex].conditions = {
                                ...restConditions,
                                [newKey]: oldValue,
                              };
                              setFunnel({ ...funnel, steps: updatedSteps });
                            }}
                            className="w-1/3"
                          />
                          <Input
                            placeholder="Condition Value"
                            value={value}
                            onChange={(e) => updateStepCondition(stepIndex, [e.target.value])}
                            className="w-1/2"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStepCondition(stepIndex, key)}
                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Split Options</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addSplit(stepIndex)}
                      className="h-8 px-2 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Split
                    </Button>
                  </div>

                  {!step.split || step.split.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No splits added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {step.split.map((split, splitIndex) => (
                        <div key={`split-${stepIndex}-${splitIndex}`} className="border rounded-md p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Split {split.number}: {split.name || "Unnamed Split"}</h4>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeSplit(stepIndex, splitIndex)}
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`split-name-${stepIndex}-${splitIndex}`}>Split Name</Label>
                            <Input
                              id={`split-name-${stepIndex}-${splitIndex}`}
                              value={split.name}
                              onChange={(e) => updateSplit(stepIndex, splitIndex, "name", e.target.value)}
                              maxLength={40}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Split Conditions</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => addSplitCondition(stepIndex, splitIndex)}
                                className="h-8 px-2 text-xs"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Condition
                              </Button>
                            </div>

                            {Object.keys(split.conditions).length === 0 ? (
                              <p className="text-sm text-muted-foreground">No conditions added yet</p>
                            ) : (
                              <div className="space-y-2">
                                {Object.entries(split.conditions).map(([key, value], condIndex) => (
                                  <div key={`split-condition-${stepIndex}-${splitIndex}-${condIndex}`} className="flex items-center space-x-2">
                                    <Input
                                      placeholder="Condition Key"
                                      value={key}
                                      onChange={(e) => {
                                        const newKey = e.target.value;
                                        const updatedSteps = [...funnel.steps];
                                        if (updatedSteps[stepIndex].split) {
                                          const { [key]: oldValue, ...restConditions } = updatedSteps[stepIndex].split![splitIndex].conditions;
                                          updatedSteps[stepIndex].split![splitIndex].conditions = {
                                            ...restConditions,
                                            [newKey]: oldValue,
                                          };
                                          setFunnel({ ...funnel, steps: updatedSteps });
                                        }
                                      }}
                                      className="w-1/3"
                                    />
                                    <Input
                                      placeholder="Condition Value"
                                      value={value}
                                      onChange={(e) => updateSplitCondition(stepIndex, splitIndex, key, e.target.value)}
                                      className="w-1/2"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeSplitCondition(stepIndex, splitIndex, key)}
                                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/funnels")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Funnel" : "Create Funnel"}
        </Button>
      </div>
    </form>
  );
}
