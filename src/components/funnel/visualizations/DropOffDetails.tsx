import React from "react";
import { FunnelStep } from "@/types/funnel";
import { AlertCircle, TrendingDown, TrendingUp, Users } from "lucide-react";

interface DropOffDetailsProps {
  steps: FunnelStep[];
  initialValue: number;
}

interface ChartData {
  name: string;
  value: number;
  dropOff: string;
  dropOffRaw: number;
  dropOffValue: number;
  previousStep: string;
  previousValue: number;
  fill: string;
  conversionRate: string;
}

export const DropOffDetails: React.FC<DropOffDetailsProps> = ({ steps, initialValue }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);
  
  if (enabledSteps.length <= 1) {
    return (
      <div className="flex items-center justify-center p-4 text-sm border rounded-md bg-gray-50 text-gray-500 gap-2">
        <AlertCircle size={16} />
        <span>At least two steps are needed to show drop-off details.</span>
      </div>
    );
  }

  // Function to calculate drop-off percentage between steps
  const calculateDropOff = (currentValue: number | undefined, previousValue: number): number => {
    if (!currentValue) return 100;
    return 100 - (currentValue / previousValue * 100);
  };
  
  // Function to calculate conversion rate between steps
  const calculateConversion = (currentValue: number | undefined, previousValue: number): number => {
    if (!currentValue || previousValue <= 0) return 0;
    return (currentValue / previousValue) * 100;
  };

  // Get color based on drop-off rate
  const getStepColor = (dropOffPercentage: number): string => {
    if (dropOffPercentage < 20) return "#22c55e"; // Green for low drop-off
    if (dropOffPercentage < 50) return "#f59e0b"; // Yellow/amber for medium drop-off
    return "#ef4444"; // Red for high drop-off
  };

  // Prepare chart data
  const chartData: ChartData[] = enabledSteps.map((step, index) => {
    const previousValue = index === 0 ? initialValue : (enabledSteps[index - 1].visitorCount || 1);
    const currentValue = step.visitorCount || 0;
    const dropOffPercentage = calculateDropOff(currentValue, previousValue);
    const dropOffValue = previousValue - currentValue;
    const conversionRate = calculateConversion(currentValue, previousValue);
    
    return {
      name: step.name,
      value: currentValue,
      dropOff: dropOffPercentage.toFixed(1),
      dropOffRaw: dropOffPercentage,
      dropOffValue,
      previousStep: index > 0 ? enabledSteps[index - 1].name : "Initial Users",
      previousValue,
      fill: getStepColor(dropOffPercentage),
      conversionRate: conversionRate.toFixed(1),
    };
  });

  // Find the highest drop-off step (excluding the first one)
  const highestDropOff = chartData.slice(1).reduce((highest, current) => {
    return Number(current.dropOff) > Number(highest.dropOff) ? current : highest;
  }, chartData[1] || { 
    dropOff: "0", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);
  
  // Find the most successful step (with lowest drop-off)
  const lowestDropOff = chartData.slice(1).reduce((lowest, current) => {
    return Number(current.dropOff) < Number(lowest.dropOff) ? current : lowest;
  }, chartData[1] || { 
    dropOff: "100", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);

  // Calculate overall funnel metrics
  const totalDropOff = chartData.reduce((sum, step) => sum + step.dropOffValue, 0);
  const overallConversionRate = ((chartData[chartData.length - 1].value / initialValue) * 100).toFixed(1);
  const averageDropOff = (totalDropOff / (chartData.length - 1)).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Compact Overall Metrics */}
      <div className="flex flex-wrap gap-3 items-center mb-2">
        <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>Conversion:</span>
          <span className="font-semibold text-green-700">{overallConversionRate}%</span>
        </div>
        <div className="flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded">
          <TrendingDown className="h-3 w-3 text-red-500" />
          <span>Drop-off:</span>
          <span className="font-semibold text-red-700">{totalDropOff.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
          <Users className="h-3 w-3 text-blue-500" />
          <span>Avg/step:</span>
          <span className="font-semibold text-blue-700">{averageDropOff}%</span>
        </div>
      </div>

      {/* Minimal Step-by-step Details */}
      <div className="divide-y border rounded bg-white">
        {chartData.map((step, index) => {
          if (index === 0) return null;
          const previousStep = chartData[index - 1];
          return (
            <div key={index} className="flex items-center justify-between px-3 py-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">{index}</span>
                <span className="truncate font-medium text-gray-800">{step.name}</span>
                <span className="text-gray-400">from</span>
                <span className="truncate text-gray-500">{previousStep.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${Number(step.dropOff) < 20 ? "text-green-600" : Number(step.dropOff) < 50 ? "text-yellow-600" : "text-red-600"}`}>{step.dropOff}%</span>
                <span className="text-gray-400">/</span>
                <span className="font-medium text-gray-500">{step.value.toLocaleString()} users</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropOffDetails;
