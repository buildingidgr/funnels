import React from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyData } from "../types";

interface StepLabelsProps {
  data: SankeyData;
  enabledSteps: FunnelStep[];
}

export const StepLabels: React.FC<StepLabelsProps> = ({ data, enabledSteps }) => {
  // Only render labels if we have data
  if (!data.nodes.length) return null;

  // Get unique step indices safely, with additional null checks
  const stepIndices = Array.from(new Set(
    data.nodes
      .map(node => {
        // Add defensive checks to avoid accessing properties of undefined objects
        if (!node || !node.id) return -1;
        
        const idParts = node.id.split('-');
        // Ensure idParts[1] is a number by explicitly parsing it
        return idParts && idParts.length >= 2 ? parseInt(idParts[1], 10) : -1;
      })
      .filter(index => index >= 0)
  )).sort((a, b) => a - b);

  return (
    <div className="flex justify-between w-full">
      {/* Initial Users Label */}
      <div className="flex flex-col items-center gap-1 min-w-[80px] max-w-[120px]">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          0
        </div>
        <div className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium truncate text-center w-full">
          Initial Users
        </div>
      </div>
      
      {/* Dynamic Step Labels */}
      {stepIndices.map((stepIndex) => {
        // Ensure stepIndex is a number before comparison
        const index = typeof stepIndex === 'number' ? stepIndex : -1;
        // Validate index is within bounds
        if (index < 0 || index >= enabledSteps.length) return null;
        
        const step = enabledSteps[index];
        if (!step) return null;
        
        // Determine label color based on step number
        const getColor = (idx: number) => {
          switch (idx % 4) {
            case 0: return { bg: "bg-blue-100", text: "text-blue-800" };
            case 1: return { bg: "bg-green-100", text: "text-green-800" };
            case 2: return { bg: "bg-purple-100", text: "text-purple-800" };
            case 3: return { bg: "bg-orange-100", text: "text-orange-800" };
            default: return { bg: "bg-gray-100", text: "text-gray-800" };
          }
        };
        
        const { bg, text } = getColor(index);
        
        return (
          <div key={`step-label-${index}`} className="flex flex-col items-center gap-1 min-w-[80px] max-w-[120px] px-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${bg} ${text} text-xs font-bold`}>
              {index + 1}
            </div>
            <div className={`px-3 py-1 rounded-md ${bg} ${text} text-xs font-medium truncate text-center w-full`} title={`Step ${step.number}: ${step.name}`}>
              {step.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepLabels;
