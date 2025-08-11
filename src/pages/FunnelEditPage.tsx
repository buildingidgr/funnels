import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel, FunnelStep } from "@/types/funnel";
import { toast } from "sonner";
import { AIFunnelGenerator } from "@/components/funnel/AIFunnelGenerator";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Plus, RefreshCw, Save, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FunnelGraphVisualization, FunnelStepFlow } from "@/components/funnel/visualizations";
import { StepConditionBuilder } from "@/components/funnel/step-condition-builder/StepConditionBuilder";
import useFunnelCalculation from "@/hooks/useFunnelCalculation";

export default function FunnelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  

  useEffect(() => {
    if (!id) {
      navigate("/funnels");
      return;
    }

    const loadFunnel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
        // Preselect first enabled step
        const firstEnabled = data.steps.find((s) => s.isEnabled);
        setSelectedStepId(firstEnabled?.id || data.steps[0]?.id || null);
      } catch (err) {
        console.error("Error loading funnel:", err);
        setError("Failed to load funnel. It may have been deleted or you don't have access.");
        toast.error("Failed to load funnel for editing");
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnel();
  }, [id, navigate]);

  const handleFunnelChange = (updatedFunnel: Funnel) => {
    setFunnel(updatedFunnel);
  };

  const handleAIGeneratedSteps = (generatedSteps: FunnelStep[]) => {
    if (!funnel) return;
    
    // Merge with existing steps, ensuring proper ordering
    const updatedSteps = [...funnel.steps, ...generatedSteps];
    
    // Reorder all steps to ensure sequential ordering
    updatedSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    const updatedFunnel = { ...funnel, steps: updatedSteps };
    setFunnel(updatedFunnel);
    toast.success(`Added ${generatedSteps.length} AI-generated steps to your funnel!`);
    if (!selectedStepId && updatedFunnel.steps.length > 0) {
      setSelectedStepId(updatedFunnel.steps[0].id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !funnel) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Funnel Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "This funnel may have been deleted or you entered an invalid ID."}
          </p>
          <Button asChild>
            <Link to="/funnels" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return to Funnels List
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Toolbar */}
        <TopToolbar
          funnel={funnel}
          onChange={(changes) => setFunnel((f) => (f ? { ...f, ...changes } : f))}
          onSave={async () => {
            if (!funnel?.id || !funnel) return;
            try {
              setIsSaving(true);
              await FunnelApi.updateFunnel(funnel.id, funnel);
              toast.success("Funnel updated successfully");
            } catch (e) {
              toast.error("Failed to save funnel");
              console.error(e);
            } finally {
              setIsSaving(false);
            }
          }}
          isSaving={isSaving}
        />

        {/* Main Grid: Left list, Center preview, Right inspector */}
        <MainEditorGrid
          funnel={funnel}
          selectedStepId={selectedStepId}
          onSelectStep={setSelectedStepId}
          onFunnelChange={handleFunnelChange}
        />

        {funnel.steps.length === 0 && (
          <div className="border border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
            No steps yet. Use the buttons above or the left panel to add your first step.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Three-pane editor layout
function MainEditorGrid({
  funnel,
  selectedStepId,
  onSelectStep,
  onFunnelChange,
}: {
  funnel: Funnel;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  onFunnelChange: (f: Funnel) => void;
}) {
  const initialValue = useMemo(() => {
    const firstEnabled = funnel.steps.find((s) => s.isEnabled);
    return firstEnabled?.visitorCount ?? 100;
  }, [funnel.steps]);

  const { calculatedSteps, isLoading, recalculateFunnel } = useFunnelCalculation({
    steps: funnel.steps,
    initialValue,
    funnelId: funnel.id,
    autoCalculate: true,
  });

  const updateStepById = (stepId: string, changes: Partial<FunnelStep>) => {
    const updatedSteps = funnel.steps.map((s) => (s.id === stepId ? { ...s, ...changes } : s));
    onFunnelChange({ ...funnel, steps: updatedSteps });
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = funnel.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    onFunnelChange({ ...funnel, steps: updatedSteps });
    if (selectedStepId === stepId) {
      onSelectStep(updatedSteps[0]?.id || null);
    }
  };

  const moveStepUp = (stepId: string) => {
    const idx = funnel.steps.findIndex((s) => s.id === stepId);
    if (idx <= 0) return;
    const newSteps = [...funnel.steps];
    [newSteps[idx - 1], newSteps[idx]] = [newSteps[idx], newSteps[idx - 1]];
    const renumbered = newSteps.map((s, i) => ({ ...s, order: i + 1 }));
    onFunnelChange({ ...funnel, steps: renumbered });
  };

  const moveStepDown = (stepId: string) => {
    const idx = funnel.steps.findIndex((s) => s.id === stepId);
    if (idx === -1 || idx >= funnel.steps.length - 1) return;
    const newSteps = [...funnel.steps];
    [newSteps[idx], newSteps[idx + 1]] = [newSteps[idx + 1], newSteps[idx]];
    const renumbered = newSteps.map((s, i) => ({ ...s, order: i + 1 }));
    onFunnelChange({ ...funnel, steps: renumbered });
  };

  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}`,
      name: `Step ${funnel.steps.length + 1}`,
      order: funnel.steps.length + 1,
      isEnabled: true,
      isRequired: true,
      conditions: { orEventGroups: [] },
      split: [],
    };
    const updated = { ...funnel, steps: [...funnel.steps, newStep] };
    onFunnelChange(updated);
    onSelectStep(newStep.id);
  };

  const selectedStep = selectedStepId
    ? funnel.steps.find((s) => s.id === selectedStepId) || null
    : null;

  const handleGenerateAI = (generatedSteps: FunnelStep[]) => {
    const updatedSteps = [...funnel.steps, ...generatedSteps];
    updatedSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    const updatedFunnel = { ...funnel, steps: updatedSteps };
    onFunnelChange(updatedFunnel);
    if (!selectedStepId && updatedFunnel.steps.length > 0) {
      onSelectStep(updatedFunnel.steps[0].id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr,380px] gap-4 items-start">
      {/* Left: Step List (sticky) */}
      <div className="sticky top-20 self-start">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Steps</CardTitle>
            <div className="flex items-center gap-2">
              <AIFunnelGenerator onGenerate={handleGenerateAI} existingSteps={funnel.steps} />
              <Button size="icon" variant="outline" onClick={addStep} className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2 max-h-[calc(100vh-160px)] overflow-auto pr-2">
            <ScrollArea className="max-h-[calc(100vh-180px)] pr-2">
              <div className="space-y-1">
                {funnel.steps.map((s, idx) => (
                  <button
                    key={s.id}
                    className={`w-full text-left px-3 py-2 rounded border text-sm flex items-center justify-between ${
                      selectedStepId === s.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectStep(s.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[160px]">{s.name || `Step ${idx + 1}`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStepUp(s.id);
                        }}
                        disabled={idx === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStepDown(s.id);
                        }}
                        disabled={idx === funnel.steps.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </button>
                ))}
                {funnel.steps.length === 0 && (
                  <div className="text-xs text-muted-foreground">No steps yet. Add your first step.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Center: Live Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={recalculateFunnel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Recalculating…" : "Recalculate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="flow" className="w-full">
            <TabsList>
              <TabsTrigger value="flow">Step Flow</TabsTrigger>
              <TabsTrigger value="sankey">Sankey</TabsTrigger>
            </TabsList>
            <TabsContent value="flow">
              <div className="min-h-[300px]">
                <FunnelStepFlow
                  steps={calculatedSteps}
                  initialValue={initialValue}
                  editable={false}
                  onSelectStep={(id) => onSelectStep(id)}
                  selectedStepId={selectedStepId}
                />
              </div>
            </TabsContent>
            <TabsContent value="sankey">
              <div className="min-h-[300px]">
                <FunnelGraphVisualization
                  steps={calculatedSteps}
                  initialValue={initialValue}
                />
              </div>
            </TabsContent>
          </Tabs>
          {isLoading && <div className="text-sm text-muted-foreground">Calculating preview…</div>}
        </CardContent>
      </Card>

      {/* Right: Step Inspector (sticky) */}
      <div className="sticky top-20 self-start">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Step Inspector</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 max-h-[calc(100vh-160px)] overflow-auto pr-2">
          {!selectedStep ? (
            <div className="text-sm text-muted-foreground">
              Select a step on the left to edit details.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Name</Label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) => updateStepById(selectedStep.id, { name: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={selectedStep.description || ""}
                  onChange={(e) => updateStepById(selectedStep.id, { description: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!selectedStep.isEnabled}
                    onCheckedChange={(checked) => updateStepById(selectedStep.id, { isEnabled: checked })}
                  />
                  <Label className="text-xs">Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!selectedStep.isRequired}
                    onCheckedChange={(checked) => updateStepById(selectedStep.id, { isRequired: checked })}
                  />
                  <Label className="text-xs">Required</Label>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStep(selectedStep.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Conditions</Label>
                <StepConditionBuilder
                  conditions={selectedStep.conditions}
                  onChange={(newConditions) =>
                    updateStepById(selectedStep.id, { conditions: newConditions })
                  }
                />
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TopToolbar({
  funnel,
  onChange,
  onSave,
  isSaving,
}: {
  funnel: Funnel;
  onChange: (changes: Partial<Funnel>) => void;
  onSave: () => Promise<void> | void;
  isSaving: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Input
                value={funnel.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="text-xl font-semibold h-10"
              />
            </div>
            <Input
              value={funnel.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Description (optional)"
              className="mt-2 h-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/funnels" className="gap-2">
                <Home className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
