
import React from "react";
import { Progress } from "@/components/ui/progress";

interface StepMetricsProps {
  percentage: number;
  totalPercentage: number;
  textColorClass: string;
  index: number;
}

export const StepMetrics: React.FC<StepMetricsProps> = ({ 
  percentage, 
  totalPercentage, 
  textColorClass, 
  index 
}) => {
  // Ensure values are valid numbers before formatting
  const formattedPercentage = isNaN(percentage) ? "0.0" : percentage.toFixed(1);
  const formattedTotalPercentage = isNaN(totalPercentage) ? "0.0" : totalPercentage.toFixed(1);
  
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">From previous</p>
          <span className={`text-sm font-bold ${textColorClass}`}>
            {formattedPercentage}%
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">From initial</p>
          <span className={`text-sm font-bold ${index === 0 ? "text-green-600" : textColorClass}`}>
            {formattedTotalPercentage}%
          </span>
        </div>
        <Progress 
          value={totalPercentage} 
          className="h-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
        />
      </div>
    </div>
  );
};

export default StepMetrics;
