import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FunnelForm from "@/components/funnel/FunnelForm";
import { Funnel, FunnelStep, ConditionItem } from "@/types/funnel";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Plus, Trash, ChevronUp, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FunnelApi } from "@/services/api";
import { StepConditionBuilder } from "@/components/funnel/step-condition-builder/StepConditionBuilder";
import { AIFunnelGenerator } from "@/components/funnel/AIFunnelGenerator";

const steps = [
  { key: "details", label: "Funnel Details" },
  { key: "steps", label: "Steps" },
  { key: "review", label: "Review & Create" },
];

export default function FunnelCreatePage() {
  const [funnel, setFunnel] = useState<Funnel>({
    name: "",
    description: "",
    timeframe: {
      from: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      to: Date.now(),
    },
    performedBy: "all",
    steps: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<FunnelStep>({
    id: "",
    name: "",
    order: 1,
    isEnabled: true,
    isRequired: true,
    conditions: { orEventGroups: [] },
    splitVariations: [],
  });

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFunnelChange = (updatedFunnel: Funnel) => {
    setFunnel(updatedFunnel);
  };

  const goToStep = (idx: number) => {
    setCurrentStep(idx);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}`,
      name: "",
      order: funnel.steps.length + 1,
      isEnabled: true,
      isRequired: true,
      conditions: { orEventGroups: [] },
      splitVariations: [],
    };
    setEditingStep(newStep);
    setEditingStepIndex(null);
    setDrawerOpen(true);
  };

  const editStep = (index: number) => {
    setEditingStep({ ...funnel.steps[index] });
    setEditingStepIndex(index);
    setDrawerOpen(true);
  };

  const saveStep = () => {
    if (editingStepIndex === null) {
      // Adding new step
      const updatedSteps = [...funnel.steps, { ...editingStep, order: funnel.steps.length + 1 }];
      handleFunnelChange({ ...funnel, steps: updatedSteps });
    } else {
      // Updating existing step
      const updatedSteps = [...funnel.steps];
      updatedSteps[editingStepIndex] = { ...editingStep };
      handleFunnelChange({ ...funnel, steps: updatedSteps });
    }
    setDrawerOpen(false);
    setEditingStepIndex(null);
  };

  const removeStep = (index: number) => {
    const updatedSteps = funnel.steps.filter((_, i) => i !== index);
    // Renumber remaining steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    handleFunnelChange({ ...funnel, steps: updatedSteps });
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const updatedSteps = [...funnel.steps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[index - 1];
      updatedSteps[index - 1] = temp;
      // Update step numbers
      updatedSteps.forEach((step, i) => {
        step.order = i + 1;
      });
      handleFunnelChange({ ...funnel, steps: updatedSteps });
    }
  };

  const moveStepDown = (index: number) => {
    if (index < funnel.steps.length - 1) {
      const updatedSteps = [...funnel.steps];
      [updatedSteps[index], updatedSteps[index + 1]] = [updatedSteps[index + 1], updatedSteps[index]];
      updatedSteps[index].order = index + 1;
      updatedSteps[index + 1].order = index + 2;
      setFunnel({ ...funnel, steps: updatedSteps });
    }
  };

  const handleAIGeneratedSteps = (generatedSteps: FunnelStep[]) => {
    // Merge with existing steps, ensuring proper ordering
    const updatedSteps = [...funnel.steps, ...generatedSteps];
    
    // Reorder all steps to ensure sequential ordering
    updatedSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    setFunnel({ ...funnel, steps: updatedSteps });
    toast.success(`Added ${generatedSteps.length} AI-generated steps to your funnel!`);
  };

  const handleCreateFunnel = async () => {
    try {
      setIsSubmitting(true);
      const { id } = await FunnelApi.createFunnel(funnel);
      toast.success("Funnel created successfully!");
      navigate(`/funnels/${id}/analysis`);
    } catch (error) {
      console.error("Error creating funnel:", error);
      toast.error("Failed to create funnel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Placeholder content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TooltipProvider>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Funnel Details</h2>
                <p className="text-muted-foreground">Let's start by defining the basic information about your funnel.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Funnel Name</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Give your funnel a descriptive name that helps you identify it later.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="name"
                    placeholder="e.g., Signup Conversion Funnel"
                    value={funnel.name}
                    onChange={(e) => handleFunnelChange({ ...funnel, name: e.target.value })}
                    maxLength={40}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{funnel.name.length}/40 characters</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Describe what this funnel tracks and why it's important.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="What is this funnel tracking? What insights are you looking for?"
                    value={funnel.description}
                    onChange={(e) => handleFunnelChange({ ...funnel, description: e.target.value })}
                    maxLength={256}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{funnel.description.length}/256 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">Start Date</Label>
                    <Input
                      id="from"
                      type="date"
                      value={new Date(funnel.timeframe.from).toISOString().split("T")[0]}
                      onChange={(e) => {
                        const timestamp = new Date(e.target.value).getTime();
                        handleFunnelChange({
                          ...funnel,
                          timeframe: { ...funnel.timeframe, from: timestamp }
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">End Date</Label>
                    <Input
                      id="to"
                      type="date"
                      value={new Date(funnel.timeframe.to).toISOString().split("T")[0]}
                      onChange={(e) => {
                        const timestamp = new Date(e.target.value).getTime();
                        handleFunnelChange({
                          ...funnel,
                          timeframe: { ...funnel.timeframe, to: timestamp }
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="performedBy">Performed By</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select which users this funnel should track.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={funnel.performedBy}
                    onValueChange={(value) => handleFunnelChange({ ...funnel, performedBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="new">New Users Only</SelectItem>
                      <SelectItem value="returning">Returning Users Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={nextStep}
                  disabled={!funnel.name.trim()}
                >
                  Next: Steps
                </Button>
              </div>
            </div>
          </TooltipProvider>
        );
      case 1:
        return (
          <TooltipProvider>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Funnel Steps</h2>
                <p className="text-muted-foreground">Define the steps in your funnel. Users will be tracked as they move through these steps.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Steps ({funnel.steps.length})</h3>
                  <div className="flex gap-2">
                    <AIFunnelGenerator 
                      onGenerate={handleAIGeneratedSteps}
                      existingSteps={funnel.steps}
                    />
                    <Button onClick={addStep} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                </div>

                {funnel.steps.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground mb-4">No steps added yet</p>
                    <div className="flex gap-2 justify-center">
                      <AIFunnelGenerator 
                        onGenerate={handleAIGeneratedSteps}
                        existingSteps={funnel.steps}
                      />
                      <Button onClick={addStep} variant="outline">
                        Add Your First Step
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {funnel.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStepUp(idx)}
                              disabled={idx === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                              {step.order}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStepDown(idx)}
                              disabled={idx === funnel.steps.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <div>
                            <h4 className="font-medium">{step.name || "Unnamed Step"}</h4>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span className={step.isEnabled ? "text-green-600" : "text-red-600"}>
                                {step.isEnabled ? "Enabled" : "Disabled"}
                              </span>
                              <span className={step.isRequired ? "text-blue-600" : "text-gray-600"}>
                                {step.isRequired ? "Required" : "Optional"}
                              </span>
                              <span>
                                {step.conditions.orEventGroups.length} condition{step.conditions.orEventGroups.length !== 1 ? 's' : ''}
                                {step.conditions.orEventGroups.some(c => c.properties?.length > 0) && (
                                  <span className="text-gray-500">
                                    {' '}(with properties)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => editStep(idx)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStep(idx)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Next: Review
                </Button>
              </div>

              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{editingStepIndex === null ? "Add Step" : "Edit Step"}</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="step-name">Step Name</Label>
                        <Input
                          id="step-name"
                          placeholder="e.g., View Product Page"
                          value={editingStep.name}
                          onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                          maxLength={40}
                        />
                        <p className="text-xs text-muted-foreground">{editingStep.name.length}/40 characters</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="step-enable"
                            checked={editingStep.isEnabled}
                            onCheckedChange={(checked) => setEditingStep({ ...editingStep, isEnabled: checked })}
                          />
                          <Label htmlFor="step-enable">Enable Step</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="step-required"
                            checked={editingStep.isRequired}
                            onCheckedChange={(checked) => setEditingStep({ ...editingStep, isRequired: checked })}
                          />
                          <Label htmlFor="step-required">Required Step</Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Conditions</Label>
                        <StepConditionBuilder
                          conditions={editingStep.conditions}
                          onChange={(newConditions) => setEditingStep({ ...editingStep, conditions: newConditions })}
                          stepName={editingStep.name}
                        />
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button onClick={saveStep} disabled={!editingStep.name.trim()}>
                      Save Step
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </TooltipProvider>
        );
      case 2:
        return (
          <TooltipProvider>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Review & Create</h2>
                <p className="text-muted-foreground">Review your funnel configuration before creating it.</p>
              </div>

              <div className="space-y-6">
                {/* Funnel Details Summary */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Funnel Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-muted-foreground">{funnel.name || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground">{funnel.description || "No description"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p className="text-muted-foreground">
                        {new Date(funnel.timeframe.from).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p className="text-muted-foreground">
                        {new Date(funnel.timeframe.to).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Performed By:</span>
                      <p className="text-muted-foreground capitalize">{funnel.performedBy}</p>
                    </div>
                  </div>
                </div>

                {/* Steps Summary */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    {funnel.steps.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Steps ({funnel.steps.length})
                  </h3>
                  
                  {funnel.steps.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No steps defined yet. You can add steps later from the analysis page.</p>
                  ) : (
                    <div className="space-y-3">
                      {funnel.steps.map((step, index) => (
                        <div key={step.id} className="border-l-4 border-primary pl-4 py-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                Step {step.order}: {step.name || "Unnamed Step"}
                              </h4>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span className={step.isEnabled ? "text-green-600" : "text-red-600"}>
                                  {step.isEnabled ? "Enabled" : "Disabled"}
                                </span>
                                <span className={step.isRequired ? "text-blue-600" : "text-gray-600"}>
                                  {step.isRequired ? "Required" : "Optional"}
                                </span>
                                <span>
                                  {step.conditions.orEventGroups.length} condition{step.conditions.orEventGroups.length !== 1 ? 's' : ''}
                                  {step.conditions.orEventGroups.some(c => c.properties?.length > 0) && (
                                    <span className="text-gray-500">
                                      {' '}(with properties)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Conditions Summary */}
                          {step.conditions.orEventGroups.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Conditions:</span>
                              <ul className="mt-1 space-y-1">
                                {step.conditions.orEventGroups.map((condition, condIndex) => {
                                  const eventName = condition.eventName || 'Unnamed Event';
                                  const operator = condition.operator || 'equals';
                                  const count = condition.count || 1;
                                  const propertiesCount = condition.properties?.length || 0;
                                  
                                  let conditionText = `• ${eventName} ${operator} ${count} time${count !== 1 ? 's' : ''}`;
                                  if (propertiesCount > 0) {
                                    conditionText += ` + ${propertiesCount} propert${propertiesCount !== 1 ? 'ies' : 'y'}`;
                                  }
                                  
                                  return (
                                    <li key={condIndex}>
                                      {conditionText}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Validation Summary */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Validation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {funnel.name.trim() ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Funnel name is {funnel.name.trim() ? "provided" : "required"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {funnel.steps.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>At least one step is {funnel.steps.length > 0 ? "defined" : "required"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                    {funnel.steps.length === 0 ? (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      ) : funnel.steps.every(step => step.name.trim()) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>{funnel.steps.length === 0 ? 'You can add steps after creating the funnel' : 'All steps have names'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleCreateFunnel}
                  disabled={isSubmitting || !funnel.name.trim()}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Creating..." : "Create Funnel"}
                </Button>
              </div>
            </div>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Progress value={((currentStep + 1) / steps.length) * 100} />
        </div>
        <Tabs value={steps[currentStep].key} className="mb-8">
          <TabsList>
            {steps.map((step, idx) => (
              <TabsTrigger key={step.key} value={step.key} onClick={() => goToStep(idx)} disabled={idx > currentStep + 1}>
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="bg-card rounded-lg shadow p-6">
          {renderStepContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
