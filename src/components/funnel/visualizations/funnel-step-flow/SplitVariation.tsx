
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SplitStep } from "@/types/funnel";

interface SplitVariationProps {
  splitStep: SplitStep;
  parentValue: number | undefined;
}

export const SplitVariation: React.FC<SplitVariationProps> = ({ splitStep, parentValue }) => {
  // Calculate percentage safely, avoiding division by zero or undefined
  const percentage = (parentValue && parentValue > 0) 
    ? ((splitStep.value || 0) / parentValue * 100) 
    : 0;
  
  // Format percentage safely
  const formattedPercentage = isNaN(percentage) ? "0.0" : percentage.toFixed(1);
  
  return (
    <Card key={splitStep.number} className="border-gray-100">
      <CardContent className="p-2 text-xs">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium">{splitStep.name}</h4>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {formattedPercentage + "%"}
          </Badge>
        </div>
        <div className="text-xs mb-1">
          <span>{splitStep.value?.toLocaleString() || "0"} users</span>
        </div>
        <Progress 
          value={percentage} 
          className="h-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
        />
        
        {/* Display split step conditions if they exist */}
        {splitStep.conditions && Object.keys(splitStep.conditions).length > 0 && (
          <details className="mt-1.5 cursor-pointer">
            <summary className="text-[10px] font-medium text-gray-500">Conditions</summary>
            <ul className="text-[10px] mt-1 space-y-0.5">
              {Object.entries(splitStep.conditions).map(([key, value], condIndex) => (
                <li key={condIndex} className="text-gray-700">
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitVariation;
