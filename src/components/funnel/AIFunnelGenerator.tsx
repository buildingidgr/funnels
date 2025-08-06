import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { FunnelStep, ConditionItem } from "@/types/funnel";
import { predefinedEvents } from "./step-condition-builder/data";

interface AIFunnelGeneratorProps {
  onGenerate: (steps: FunnelStep[]) => void;
  existingSteps?: FunnelStep[];
}

// Mock AI generation function - generates complete funnel steps
const mockGenerateFunnelSteps = async (description: string, existingSteps: FunnelStep[] = []): Promise<FunnelStep[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const lowerDescription = description.toLowerCase();
  const steps: FunnelStep[] = [];
  let stepOrder = existingSteps.length + 1;

  // E-commerce funnel
  if (lowerDescription.includes('ecommerce') || lowerDescription.includes('shop') || lowerDescription.includes('purchase')) {
    steps.push(
      {
        id: `step-${Date.now()}-1`,
        name: "Viewed Product Page",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: [{
              name: "urlPath",
              operator: "contains",
              value: "/products/",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-2`,
        name: "Added to Cart",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "productAddedToCart",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-3`,
        name: "Started Checkout",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "checkoutStarted",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-4`,
        name: "Completed Purchase",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "purchaseCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      }
    );
  }
  
  // SaaS onboarding funnel
  else if (lowerDescription.includes('saas') || lowerDescription.includes('onboarding') || lowerDescription.includes('signup')) {
    steps.push(
      {
        id: `step-${Date.now()}-1`,
        name: "Visited Landing Page",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: [{
              name: "urlPath",
              operator: "equals",
              value: "/",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-2`,
        name: "Clicked Sign Up",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "buttonClicked",
            operator: "equals",
            count: 1,
            properties: [{
              name: "buttonText",
              operator: "contains",
              value: "sign up",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-3`,
        name: "Completed Registration",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "accountCreated",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-4`,
        name: "Completed Onboarding",
        order: stepOrder++,
        isEnabled: true,
        isRequired: false,
        conditions: {
          orEventGroups: [{
            eventName: "onboardingCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-5`,
        name: "Created First Project",
        order: stepOrder++,
        isEnabled: true,
        isRequired: false,
        conditions: {
          orEventGroups: [{
            eventName: "projectCreated",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      }
    );
  }
  
  // Content marketing funnel
  else if (lowerDescription.includes('content') || lowerDescription.includes('blog') || lowerDescription.includes('lead')) {
    steps.push(
      {
        id: `step-${Date.now()}-1`,
        name: "Viewed Blog Post",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: [{
              name: "urlPath",
              operator: "contains",
              value: "/blog/",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-2`,
        name: "Scrolled to Bottom",
        order: stepOrder++,
        isEnabled: true,
        isRequired: false,
        conditions: {
          orEventGroups: [{
            eventName: "pageScrolled",
            operator: "equals",
            count: 1,
            properties: [{
              name: "scrollDepth",
              operator: "greaterThan",
              value: "80",
              type: "number"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-3`,
        name: "Clicked CTA Button",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "buttonClicked",
            operator: "equals",
            count: 1,
            properties: [{
              name: "buttonText",
              operator: "contains",
              value: "download",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-4`,
        name: "Submitted Lead Form",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "formSubmitted",
            operator: "equals",
            count: 1,
            properties: [{
              name: "formType",
              operator: "equals",
              value: "lead_generation",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      }
    );
  }
  
  // Mobile app funnel
  else if (lowerDescription.includes('mobile') || lowerDescription.includes('app') || lowerDescription.includes('download')) {
    steps.push(
      {
        id: `step-${Date.now()}-1`,
        name: "App Downloaded",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "appInstalled",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-2`,
        name: "App Opened",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "appOpened",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-3`,
        name: "Completed Tutorial",
        order: stepOrder++,
        isEnabled: true,
        isRequired: false,
        conditions: {
          orEventGroups: [{
            eventName: "tutorialCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-4`,
        name: "Used Core Feature",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "featureUsed",
            operator: "equals",
            count: 1,
            properties: [{
              name: "featureType",
              operator: "equals",
              value: "core",
              type: "string"
            }]
          }]
        },
        splitVariations: []
      }
    );
  }
  
  // Default funnel (generic)
  else {
    steps.push(
      {
        id: `step-${Date.now()}-1`,
        name: "Visited Website",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-2`,
        name: "Interacted with Content",
        order: stepOrder++,
        isEnabled: true,
        isRequired: false,
        conditions: {
          orEventGroups: [{
            eventName: "buttonClicked",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      },
      {
        id: `step-${Date.now()}-3`,
        name: "Completed Goal",
        order: stepOrder++,
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [{
            eventName: "goalCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }]
        },
        splitVariations: []
      }
    );
  }

  return steps;
};

export function AIFunnelGenerator({ onGenerate, existingSteps = [] }: AIFunnelGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<FunnelStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe the funnel you want to generate");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedSteps(null);

    try {
      const steps = await mockGenerateFunnelSteps(description, existingSteps);
      setGeneratedSteps(steps);
    } catch (err) {
      setError("Failed to generate funnel steps. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedSteps) {
      onGenerate(generatedSteps);
      setIsOpen(false);
      setDescription("");
      setGeneratedSteps(null);
      setError(null);
    }
  };

  const getConditionDescription = (condition: ConditionItem) => {
    const event = predefinedEvents.find(e => e.value === condition.eventName);
    const eventName = event?.label || condition.eventName;
    
    let description = eventName;
    
    if (condition.count > 1) {
      description += ` (${condition.count}+ times)`;
    }
    
    if (condition.properties?.length) {
      description += ` + ${condition.properties.length} properties`;
    }
    
    return description;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-sm gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
        >
          <Sparkles className="h-4 w-4" />
          AI Generate Steps
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Funnel Step Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-funnel-description">
              Describe your funnel in natural language
            </Label>
            <Textarea
              id="ai-funnel-description"
              placeholder="e.g., 'E-commerce funnel for online store' or 'SaaS onboarding funnel for new users' or 'Content marketing funnel for lead generation'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe the type of funnel you want to create. The AI will generate appropriate steps with conditions.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !description.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Funnel Steps...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Complete Funnel Steps
              </>
            )}
          </Button>

          {generatedSteps && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Generated Steps:</Label>
                <div className="space-y-3">
                  {generatedSteps.map((step, index) => (
                    <Card key={step.id} className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Step {step.order}: {step.name}</span>
                          <div className="flex gap-1">
                            <Badge 
                              variant={step.isRequired ? "default" : "secondary"} 
                              className="text-xs h-5"
                            >
                              {step.isRequired ? "Required" : "Optional"}
                            </Badge>
                            <Badge 
                              variant={step.isEnabled ? "default" : "secondary"} 
                              className="text-xs h-5"
                            >
                              {step.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {step.conditions.orEventGroups.map((condition, condIndex) => (
                            <div key={condIndex} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <Badge variant="outline" className="text-xs h-4 px-1">OR {condIndex + 1}</Badge>
                              <span className="text-gray-700">
                                {getConditionDescription(condition)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleApply} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply All Generated Steps
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 