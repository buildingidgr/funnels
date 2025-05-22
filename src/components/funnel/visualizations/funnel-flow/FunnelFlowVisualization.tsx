import React from "react";
import { FunnelStep } from "@/types/funnel";
import { 
  calculateConversion,
  calculateDropoff,
  getConversionColor 
} from "./utils";
import FlowStep from "./FlowStep";
import FlowConnection from "./FlowConnection";
import { motion } from "framer-motion";

interface FunnelFlowVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelFlowVisualization: React.FC<FunnelFlowVisualizationProps> = ({ 
  steps, 
  initialValue 
}) => {
  return (
    <div className="relative py-8 px-4 bg-gradient-to-b from-gray-50 to-white rounded-xl">
      <div className="max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isFirstStep = index === 0;
          const previousValue = isFirstStep ? initialValue : (steps[index - 1].visitorCount || 0);
          const nextStep = index < steps.length - 1 ? steps[index + 1] : null;
          const conversionRate = calculateConversion(step.visitorCount || 0, previousValue);
          const dropoff = calculateDropoff(step.visitorCount || 0, previousValue);
          
          return (
            <motion.div
              key={`flow-step-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-12"
            >
              {/* Step Visualization */}
              <FlowStep 
                step={step}
                index={index}
                previousValue={previousValue}
                conversionRate={conversionRate}
                isFirst={isFirstStep}
              />
              
              {/* Connection to Next Step */}
              {nextStep && (
                <FlowConnection 
                  sourceValue={step.visitorCount || 0}
                  targetValue={nextStep.visitorCount || 0}
                  dropoff={dropoff}
                  hasSplit={Boolean(step.splitVariations && step.splitVariations.length > 0)}
                />
              )}
              
              {/* Split Variations */}
              {step.splitVariations && step.splitVariations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6 ml-12 pl-6 border-l-2 border-dashed border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-600 mb-3 pl-2">
                    Split Variations
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {step.splitVariations.map((splitStep, splitIndex) => (
                      <motion.div
                        key={`split-${index}-${splitIndex}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: splitIndex * 0.1 }}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{splitStep.name}</span>
                          <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                            {((splitStep.visitorCount || 0) / (step.visitorCount || 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <span className="mr-2">👥</span>
                          {splitStep.visitorCount?.toLocaleString() || 0} users
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelFlowVisualization;
