import React from "react";
import { FunnelStep } from "@/types/funnel";
import { AlertCircle, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    <div className="space-y-6">
      {/* Overall Funnel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Conversion</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{overallConversionRate}%</div>
          <Progress value={Number(overallConversionRate)} className="mt-2" />
        </div>
        
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Drop-off</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalDropOff.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">users lost</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Average Drop-off</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{averageDropOff}%</div>
          <div className="text-sm text-gray-500 mt-1">per step</div>
        </div>
      </div>
      
      {/* Key insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-800 font-semibold mb-2">Highest Drop-off</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">{highestDropOff.previousStep} → {highestDropOff.name}</span>
            <span className="font-semibold text-red-600">{highestDropOff.dropOff}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {highestDropOff.dropOffValue.toLocaleString()} users lost
          </div>
          <Progress 
            value={Number(highestDropOff.dropOff)} 
            className="mt-2 h-1.5 bg-red-100"
          />
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-800 font-semibold mb-2">Best Converting Step</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">{lowestDropOff.previousStep} → {lowestDropOff.name}</span>
            <span className="font-semibold text-green-600">{lowestDropOff.conversionRate}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {(100 - Number(lowestDropOff.dropOff)).toFixed(1)}% retention
          </div>
          <Progress 
            value={Number(lowestDropOff.conversionRate)} 
            className="mt-2 h-1.5 bg-green-100"
          />
        </div>
      </div>
      
      {/* Step by step details */}
      <div className="space-y-3">
        {chartData.map((step, index) => {
          if (index === 0) return null; // Skip the first step as it has no drop-off
          
          const previousStep = chartData[index - 1];
          const dropOffWidth = `${Number(step.dropOff)}%`;
          
          return (
            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {index}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-gray-500">From {previousStep.name}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  Number(step.dropOff) < 20 ? "text-green-600" : 
                  Number(step.dropOff) < 50 ? "text-yellow-600" : 
                  "text-red-600"
                }`}>
                  {step.dropOff}% drop-off
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Previous Step</p>
                  <p className="text-sm font-medium">{previousStep.value.toLocaleString()} users</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Step</p>
                  <p className="text-sm font-medium">{step.value.toLocaleString()} users</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Conversion Rate</span>
                  <span>{step.conversionRate}%</span>
                </div>
                <Progress 
                  value={Number(step.conversionRate)} 
                  className="h-1.5"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Optimization Tips */}
      {Number(highestDropOff.dropOff) > 50 && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mt-6">
          <p className="text-sm font-medium text-blue-800 mb-2">💡 Optimization Tip</p>
          <p className="text-sm text-gray-700">
            Consider improving the transition from "{highestDropOff.previousStep}" to "{highestDropOff.name}" 
            to reduce the {highestDropOff.dropOff}% drop-off rate. This step is losing {highestDropOff.dropOffValue.toLocaleString()} users.
          </p>
        </div>
      )}
    </div>
  );
};

export default DropOffDetails;
