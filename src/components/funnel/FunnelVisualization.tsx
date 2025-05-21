import React from "react";
import { Funnel } from "@/types/funnel";
import { BarChart3 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

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

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-8">
          {/* Sankey visualization */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Funnel Branching View
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
              <FunnelVisualizationTabs
                steps={enabledSteps}
                initialValue={initialValue}
                funnelId={funnel.id}
              />
            </div>
          </div>

          {/* Drop-off Analysis */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Drop-off Analysis
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <DropOffDetails steps={enabledSteps} initialValue={initialValue} />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
