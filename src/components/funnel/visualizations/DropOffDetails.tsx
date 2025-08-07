import React from "react";
import { FunnelStep } from "@/types/funnel";
import { AlertCircle, TrendingDown, TrendingUp, Users, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DropOffDetailsProps {
  steps: FunnelStep[];
  initialValue: number;
  revenuePerConversion?: number; // Optional: revenue per successful conversion
  funnelType?: 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support'; // Funnel type for better insights
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

export const DropOffDetails: React.FC<DropOffDetailsProps> = ({ steps, initialValue, revenuePerConversion, funnelType = 'ecommerce' }) => {
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

  // Prepare chart data - exclude the first step from drop-off analysis since it's the starting point
  const chartData: ChartData[] = enabledSteps.slice(1).map((step, index) => {
    const previousValue = enabledSteps[index].visitorCount || 1; // Use the previous step's visitor count
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
      previousStep: enabledSteps[index].name,
      previousValue,
      fill: getStepColor(dropOffPercentage),
      conversionRate: conversionRate.toFixed(1),
    };
  });

  // Find the highest drop-off step
  const highestDropOff = chartData.reduce((highest, current) => {
    return Number(current.dropOff) > Number(highest.dropOff) ? current : highest;
  }, chartData[0] || { 
    dropOff: "0", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);
  
  // Find the most successful step (with lowest drop-off)
  const lowestDropOff = chartData.reduce((lowest, current) => {
    return Number(current.dropOff) < Number(lowest.dropOff) ? current : lowest;
  }, chartData[0] || { 
    dropOff: "100", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);

  // Calculate overall funnel metrics
  const totalDropOff = chartData.reduce((sum, step) => sum + step.dropOffValue, 0);
  const overallConversionRate = ((enabledSteps[enabledSteps.length - 1].visitorCount / initialValue) * 100).toFixed(1);
  
  // Calculate business-focused insights based on funnel type
  const getRevenuePerConversion = () => {
    if (revenuePerConversion) return revenuePerConversion;
    
    // Default values based on funnel type
    const defaults = {
      'ecommerce': 75,
      'saas': 500,
      'lead-gen': 200,
      'mobile-app': 25,
      'content': 150,
      'support': 100
    };
    return defaults[funnelType] || 50;
  };

  const revenuePerConversionValue = getRevenuePerConversion();
  const potentialRevenue = totalDropOff * revenuePerConversionValue;
  const improvementOpportunity = ((totalDropOff / initialValue) * 100).toFixed(1);
  
  // Find the step with highest revenue impact
  const highestRevenueImpact = chartData.reduce((highest, current) => {
    return current.dropOffValue > highest.dropOffValue ? current : highest;
  }, chartData[0] || { dropOffValue: 0, name: "No data" } as ChartData);
  
  // Calculate potential improvement if we fix the biggest drop-off
  const potentialImprovement = ((highestRevenueImpact.dropOffValue / initialValue) * 100).toFixed(1);

  // Get funnel-specific insights
  const getFunnelInsights = () => {
    const insights = {
      'ecommerce': {
        metric: 'Revenue Lost',
        description: 'Potential revenue lost from cart abandonment',
        unit: '$',
        action: 'Focus on reducing cart abandonment'
      },
      'saas': {
        metric: 'MRR Lost',
        description: 'Potential Monthly Recurring Revenue lost',
        unit: '$',
        action: 'Improve signup and onboarding flow'
      },
      'lead-gen': {
        metric: 'Leads Lost',
        description: 'Potential qualified leads lost',
        unit: '',
        action: 'Optimize lead capture forms'
      },
      'mobile-app': {
        metric: 'Users Lost',
        description: 'Potential active users lost',
        unit: '',
        action: 'Improve app onboarding experience'
      },
      'content': {
        metric: 'Engagement Lost',
        description: 'Potential content engagement lost',
        unit: '',
        action: 'Optimize content discovery and consumption'
      },
      'support': {
        metric: 'Cases Lost',
        description: 'Potential support cases not resolved',
        unit: '',
        action: 'Improve support ticket resolution'
      }
    };
    return insights[funnelType] || insights['ecommerce'];
  };

  const funnelInsights = getFunnelInsights();

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Section Header with Explanation */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Drop-off Analysis</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs mb-2">This analysis shows how many users leave at each step of your funnel.</p>
              <p className="text-xs">• <strong>Drop-off %</strong>: Percentage of users who left between steps</p>
              <p className="text-xs">• <strong>Users</strong>: Actual number of users who reached each step</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Business-Focused Insights */}
        <div className="flex flex-wrap gap-3 items-center mb-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{funnelInsights.metric}:</span>
                <span className="font-semibold text-green-700">
                  {funnelInsights.unit}{funnelInsights.unit ? potentialRevenue.toLocaleString() : totalDropOff.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{funnelInsights.description}</p>
              {revenuePerConversion && (
                <p className="text-xs mt-1">Based on ${revenuePerConversion}/conversion</p>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Priority Fix:</span>
                <span className="font-semibold text-red-700">{highestRevenueImpact.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Fix this step to recover {potentialImprovement}% of lost users</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                <span>Improvement:</span>
                <span className="font-semibold text-blue-700">+{improvementOpportunity}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Potential conversion improvement if all drop-offs are fixed</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-emerald-50 px-2 py-1 rounded">
                <Users className="h-3 w-3 text-emerald-500" />
                <span>Current Rate:</span>
                <span className="font-semibold text-emerald-700">{overallConversionRate}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Current overall conversion rate from start to finish</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Actionable Insights Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">Action Plan</h4>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>1. Immediate Priority:</strong> Focus on {highestRevenueImpact.name} - fixing this step could recover {highestRevenueImpact.dropOffValue.toLocaleString()} users</p>
            <p><strong>2. {funnelInsights.metric}:</strong> You're losing {funnelInsights.unit}{funnelInsights.unit ? potentialRevenue.toLocaleString() : totalDropOff.toLocaleString()} in potential {funnelInsights.metric.toLowerCase()}</p>
            <p><strong>3. Quick Wins:</strong> Improving {lowestDropOff.name} (currently {lowestDropOff.dropOff}% drop-off) could serve as a model for other steps</p>
            <p><strong>4. Action:</strong> {funnelInsights.action}</p>
          </div>
        </div>

      {/* Step-by-step Details with Explanations */}
      <div className="space-y-2">
        <div className="text-xs text-gray-600 mb-2">
          <p>Each row shows how many users left between steps:</p>
        </div>
        <div className="divide-y border rounded bg-white">
          {chartData.map((step, index) => {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 cursor-help">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">{index + 1}</span>
                      <span className="truncate font-medium text-gray-800">{step.name}</span>
                      <span className="text-gray-400">from</span>
                      <span className="truncate text-gray-500">{step.previousStep}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${Number(step.dropOff) < 20 ? "text-green-600" : Number(step.dropOff) < 50 ? "text-yellow-600" : "text-red-600"}`}>{step.dropOff}%</span>
                      <span className="text-gray-400">/</span>
                      <span className="font-medium text-gray-500">{step.value.toLocaleString()} users</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="text-xs">
                    <p className="font-medium mb-1">{step.name}</p>
                    <p className="mb-2">From {step.previousStep} ({step.previousValue.toLocaleString()} users)</p>
                    <p className="mb-1"><strong>{step.dropOff}%</strong> dropped off ({step.dropOffValue.toLocaleString()} users)</p>
                    <p><strong>{step.value.toLocaleString()} users</strong> continued to this step</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default DropOffDetails;
