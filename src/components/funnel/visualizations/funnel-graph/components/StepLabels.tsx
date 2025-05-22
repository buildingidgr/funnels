import React from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyData } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Split } from "lucide-react";

interface StepLabelsProps {
  data: SankeyData;
  enabledSteps: FunnelStep[];
}

export const StepLabels: React.FC<StepLabelsProps> = ({ data, enabledSteps }) => {
  // Only render labels if we have data
  if (!data.nodes.length) return null;

  // Calculate conversion rates and find best/worst performing steps
  const stepMetrics = enabledSteps.map((step, index) => {
    const currentValue = step.visitorCount || 0;
    const previousValue = index === 0 ? data.nodes[0].value : (enabledSteps[index - 1].visitorCount || 0);
    const conversionRate = previousValue > 0 ? (currentValue / previousValue) * 100 : 0;
    const dropOff = previousValue - currentValue;
    const dropOffRate = previousValue > 0 ? (dropOff / previousValue) * 100 : 0;
    
    return {
      step,
      conversionRate,
      dropOff,
      dropOffRate
    };
  });

  const bestConvertingStep = stepMetrics.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );
  
  const highestDropOffStep = stepMetrics.reduce((worst, current) => 
    current.dropOffRate > worst.dropOffRate ? current : worst
  );

  // Get unique step indices safely, with additional null checks
  const stepIndices = Array.from(new Set(
    data.nodes
      .map(node => {
        if (!node || !node.id) return -1;
        const idParts = node.id.split('-');
        return idParts && idParts.length >= 2 ? parseInt(idParts[1], 10) : -1;
      })
      .filter(index => index >= 0)
  )).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="flex justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Best Converting:</span>
          <span className="font-medium text-green-700">
            {bestConvertingStep.step.name} ({bestConvertingStep.conversionRate.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <span className="text-gray-600">Highest Drop-off:</span>
          <span className="font-medium text-red-700">
            {highestDropOffStep.step.name} ({highestDropOffStep.dropOffRate.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between w-full px-4">
        {/* Initial Users Label */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex flex-col items-center gap-2 min-w-[100px] max-w-[140px] cursor-help"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold shadow-sm">
                  0
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium truncate text-center w-full border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  Initial Users
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Starting point of the funnel with all users</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Dynamic Step Labels */}
        {stepIndices.map((stepIndex) => {
          const index = typeof stepIndex === 'number' ? stepIndex : -1;
          if (index < 0 || index >= enabledSteps.length) return null;
          
          const step = enabledSteps[index];
          if (!step) return null;
          
          const metrics = stepMetrics[index];
          const isBestConverting = metrics === bestConvertingStep;
          const isHighestDropOff = metrics === highestDropOffStep;
          const hasSplits = step.splitVariations && step.splitVariations.length > 0;
          
          // Enhanced color scheme with better contrast
          const getColor = (idx: number) => {
            if (hasSplits) {
              return { 
                bg: "bg-indigo-50", 
                text: "text-indigo-800", 
                border: "border-indigo-100", 
                circle: "bg-indigo-100" 
              };
            }
            switch (idx % 4) {
              case 0: return { bg: "bg-green-50", text: "text-green-800", border: "border-green-100", circle: "bg-green-100" };
              case 1: return { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-100", circle: "bg-purple-100" };
              case 2: return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-100", circle: "bg-orange-100" };
              case 3: return { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-100", circle: "bg-blue-100" };
              default: return { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-100", circle: "bg-gray-100" };
            }
          };
          
          const { bg, text, border, circle } = getColor(index);
          
          return (
            <TooltipProvider key={`step-label-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="flex flex-col items-center gap-2 min-w-[100px] max-w-[140px] cursor-help"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="relative">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${circle} ${text} text-sm font-bold shadow-sm`}>
                        {index + 1}
                      </div>
                      {hasSplits && (
                        <div className="absolute -top-1 -right-1">
                          <Split className="h-4 w-4 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    <div 
                      className={`px-4 py-2 rounded-lg ${bg} ${text} text-sm font-medium truncate text-center w-full border ${border} shadow-sm hover:shadow-md transition-shadow relative`}
                      title={`Step ${step.order}: ${step.name}`}
                    >
                      {step.name}
                      {isBestConverting && (
                        <div className="absolute -top-2 -right-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {isHighestDropOff && (
                        <div className="absolute -top-2 -right-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Step {step.order}: {step.name}</p>
                    <p className="text-sm text-gray-500">Conversion Rate: {metrics.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Drop-off Rate: {metrics.dropOffRate.toFixed(1)}%</p>
                    {hasSplits && (
                      <p className="text-sm text-indigo-600">Has {step.splitVariations?.length} split variations</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default StepLabels;
