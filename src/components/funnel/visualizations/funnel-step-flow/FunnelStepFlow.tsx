import React from "react";
import { FunnelStep } from "@/types/funnel";
import { motion } from "framer-motion";
import Step from "./FunnelStep";
import StepConnector from "./StepConnector";

interface FunnelStepFlowProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelStepFlow: React.FC<FunnelStepFlowProps> = ({ steps, initialValue }) => {
  console.log('[DEBUG] FunnelStepFlow rendered:', {
    stepsCount: steps.length,
    initialValue,
    steps: steps.map(s => ({ name: s.name, value: s.value, visitorCount: s.visitorCount, isEnabled: s.isEnabled }))
  });
  
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.isEnabled);
  
  console.log('[DEBUG] Enabled steps:', enabledSteps.length);
  
  // If no enabled steps, show message
  if (enabledSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-lg font-medium text-gray-600">No enabled steps to display</div>
          <div className="text-sm text-gray-400 mt-2">Enable steps in the funnel configuration to see the flow</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative py-12 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-lg">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="flex flex-col items-center space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {enabledSteps.map((step, index) => {
            const currentValue = step.value || step.visitorCount || 0;
            const previousValue = index === 0 ? initialValue : (enabledSteps[index - 1].value || enabledSteps[index - 1].visitorCount || 0);
            
            return (
              <motion.div
                key={`step-${step.number}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                className="w-full"
              >
                {/* Connect steps with a connector */}
                {index > 0 && (
                  <StepConnector 
                    previousValue={previousValue} 
                    currentValue={currentValue}
                    isOptional={!enabledSteps[index - 1].isRequired}
                  />
                )}
                
                {/* Render the step */}
                <Step 
                  step={step} 
                  previousValue={previousValue}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default FunnelStepFlow;
