import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Conditions, ConditionItem } from "@/types/funnel";
import { predefinedEvents } from "./data";

interface AIConditionGeneratorProps {
  onGenerate: (conditions: Conditions) => void;
  stepName?: string;
}

// Mock AI generation function - in real implementation, this would call an AI API
const mockGenerateConditions = async (description: string, stepName?: string): Promise<Conditions> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock logic to generate conditions based on description
  const lowerDescription = description.toLowerCase();
  
  // Simple keyword-based condition generation
  const conditions: ConditionItem[] = [];
  
  if (lowerDescription.includes('page') || lowerDescription.includes('view')) {
    conditions.push({
      eventName: "pageViewed",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  if (lowerDescription.includes('click') || lowerDescription.includes('button')) {
    conditions.push({
      eventName: "buttonClicked",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  if (lowerDescription.includes('form') || lowerDescription.includes('submit')) {
    conditions.push({
      eventName: "formSubmitted",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  if (lowerDescription.includes('purchase') || lowerDescription.includes('buy') || lowerDescription.includes('order')) {
    conditions.push({
      eventName: "purchaseCompleted",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  if (lowerDescription.includes('signup') || lowerDescription.includes('register')) {
    conditions.push({
      eventName: "accountCreated",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  if (lowerDescription.includes('login') || lowerDescription.includes('signin')) {
    conditions.push({
      eventName: "userLoggedIn",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  // If no specific conditions found, add a generic one
  if (conditions.length === 0) {
    conditions.push({
      eventName: "pageViewed",
      operator: "equals",
      count: 1,
      properties: []
    });
  }
  
  return {
    orEventGroups: conditions,
    andAlsoEvents: []
  };
};

export function AIConditionGenerator({ onGenerate, stepName }: AIConditionGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConditions, setGeneratedConditions] = useState<Conditions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe the conditions you want to generate");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedConditions(null);

    try {
      const conditions = await mockGenerateConditions(description, stepName);
      setGeneratedConditions(conditions);
    } catch (err) {
      setError("Failed to generate conditions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedConditions) {
      onGenerate(generatedConditions);
      setIsOpen(false);
      setDescription("");
      setGeneratedConditions(null);
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
          className="h-7 text-xs gap-1 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
        >
          <Sparkles className="h-3 w-3" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Condition Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-description">
              Describe the conditions in natural language
            </Label>
            <Textarea
              id="ai-description"
              placeholder="e.g., 'Users who viewed the product page and clicked the buy button' or 'Visitors who submitted the contact form'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe what actions or events should trigger this step
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Conditions
              </>
            )}
          </Button>

          {generatedConditions && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Generated Conditions:</Label>
                <div className="space-y-2">
                  {generatedConditions.orEventGroups.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="text-xs h-5 px-2">OR {index + 1}</Badge>
                      <span className="text-xs font-medium text-gray-700">
                        {getConditionDescription(condition)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleApply} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Generated Conditions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 