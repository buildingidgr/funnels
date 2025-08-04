import React, { useState, useMemo } from "react";
import { Funnel, FunnelStep } from "@/types/funnel";
import { BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// Import our visualization components
import {
  DropOffDetails,
  FunnelHeader
} from "./visualizations";
import { FunnelVisualizationTabs } from "./visualizations";

interface FunnelVisualizationProps {
  funnel: Funnel;
}

export default function FunnelVisualization({ funnel }: FunnelVisualizationProps) {
  const enabledSteps = funnel.steps.filter(step => step.isEnabled);
  const initialValue = enabledSteps[0]?.visitorCount || 100;
  
  // Map steps to include the value property that visualization components expect
  const mappedSteps = useMemo(() => {
    return enabledSteps.map(step => ({
      ...step,
      value: step.visitorCount || 0,
      // Also map split variations if they exist
      split: step.splitVariations?.map(variation => ({
        name: variation.name,
        value: variation.visitorCount || 0
      })) || []
    }));
  }, [enabledSteps]);
  
  const [expandedSections, setExpandedSections] = useState({
    branching: true,
    dropoff: true
  });

  const toggleSection = (section: 'branching' | 'dropoff') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Combined Funnel Analysis Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
          {/* Funnel Branching View */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-800 dark:text-gray-200 hover:bg-transparent"
              onClick={() => toggleSection('branching')}
            >
              <span>Funnel Branching View</span>
              {expandedSections.branching ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            
            {expandedSections.branching && (
              <div className="mt-4">
                <FunnelVisualizationTabs
                  steps={mappedSteps}
                  initialValue={initialValue}
                  funnelId={funnel.id}
                />
              </div>
            )}
          </div>

          {/* Drop-off Analysis */}
          <div className="border-t pt-6">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-800 dark:text-gray-200 hover:bg-transparent"
              onClick={() => toggleSection('dropoff')}
            >
              <span>Drop-off Analysis</span>
              {expandedSections.dropoff ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            
            {expandedSections.dropoff && (
              <div className="mt-4">
                <DropOffDetails steps={mappedSteps} initialValue={initialValue} />
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
