
import React from "react";
import { FunnelStep } from "@/types/funnel";

interface FunnelOverviewProps {
  steps: FunnelStep[];
}

export const FunnelOverview: React.FC<FunnelOverviewProps> = ({ steps }) => {
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.enable);
  
  // Function to calculate overall funnel conversion
  const calculateOverallConversion = (): number => {
    if (enabledSteps.length < 2) return 0;
    
    const firstStep = enabledSteps[0];
    const lastStep = enabledSteps[enabledSteps.length - 1];
    
    if (!firstStep.value || !lastStep.value) return 0;
    return (lastStep.value / firstStep.value) * 100;
  };
  
  // Ensure we have a valid number before calling toFixed
  const overallConversion = calculateOverallConversion();
  const formattedConversion = isNaN(overallConversion) ? "0.0" : overallConversion.toFixed(1);
  
  return (
    <div className="text-center">
      <span className="text-2xl font-bold text-waymore-primary">
        {formattedConversion}%
      </span>
      <p className="text-gray-500">Overall Conversion Rate</p>
    </div>
  );
};

export default FunnelOverview;
