
import React from "react";
import { FunnelStep } from "@/types/funnel";
import { Card, CardContent } from "@/components/ui/card";
import FunnelFlowVisualization from "./FunnelFlowVisualization";

interface FunnelFlowProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelFlow: React.FC<FunnelFlowProps> = ({ steps, initialValue }) => {
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.enable);
  
  if (enabledSteps.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No steps to visualize</p>
      </div>
    );
  }

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <FunnelFlowVisualization steps={enabledSteps} initialValue={initialValue} />
      </CardContent>
    </Card>
  );
};

export default FunnelFlow;
