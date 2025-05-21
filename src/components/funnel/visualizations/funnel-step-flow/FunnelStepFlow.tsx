import React from "react";
import { FunnelStep } from "@/types/funnel";
import Step from "./FunnelStep";
import StepConnector from "./StepConnector";
import { motion } from "framer-motion";

interface FunnelStepFlowProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelStepFlow: React.FC<FunnelStepFlowProps> = ({ steps, initialValue }) => {
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.enable);
  
  // If no enabled steps, show message
  if (enabledSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No enabled steps to display
      </div>
    );
  }
  
  return (
    <div className="relative py-8 px-4 bg-gradient-to-b from-gray-50 to-white rounded-xl">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="flex flex-col items-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {enabledSteps.map((step, index) => (
            <motion.div
              key={`step-${step.number}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="w-full"
            >
              {/* Connect steps with a connector */}
              {index > 0 && (
                <StepConnector 
                  previousValue={index === 0 ? initialValue : enabledSteps[index - 1].value || 0} 
                  currentValue={step.value || 0}
                />
              )}
              
              {/* Render the step */}
              <Step 
                step={step} 
                previousValue={index === 0 ? initialValue : enabledSteps[index - 1].value || 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FunnelStepFlow;
