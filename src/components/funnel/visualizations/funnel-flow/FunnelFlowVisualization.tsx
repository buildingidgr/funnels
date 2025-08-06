import React from "react";
import { FunnelStep } from "@/types/funnel";
import { 
  calculateConversion,
  calculateDropoff,
  getConversionColor 
} from "./utils";
import FlowStep from "./FlowStep";
import FlowConnection from "./FlowConnection";
import OptionalStepFlow from "./OptionalStepFlow";
import { motion } from "framer-motion";

interface FunnelFlowVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelFlowVisualization: React.FC<FunnelFlowVisualizationProps> = ({ 
  steps, 
  initialValue 
}) => {
  console.log('[DEBUG] FunnelFlowVisualization rendered:', {
    stepsCount: steps.length,
    initialValue,
    steps: steps.map(s => ({ name: s.name, value: s.value, visitorCount: s.visitorCount }))
  });

  return (
    <div className="relative py-12 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-lg">
      <div className="max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const isFirstStep = index === 0;
          const previousValue = isFirstStep ? initialValue : (steps[index - 1].value || steps[index - 1].visitorCount || 0);
          const nextStep = index < steps.length - 1 ? steps[index + 1] : null;
          const currentValue = step.value || step.visitorCount || 0;
          const nextValue = nextStep ? (nextStep.value || nextStep.visitorCount || 0) : 0;
          const conversionRate = calculateConversion(currentValue, previousValue);
          const dropoff = calculateDropoff(currentValue, previousValue);
          
          console.log('[DEBUG] Processing step:', {
            stepName: step.name,
            currentValue,
            previousValue,
            conversionRate,
            dropoff
          });
          
          return (
            <motion.div
              key={`flow-step-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className="mb-16"
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
                <>
                  {/* For optional steps, show dual flow */}
                  {!step.isRequired ? (
                    <OptionalStepFlow
                      currentStep={step}
                      nextStep={nextStep}
                      previousValue={previousValue}
                      currentValue={currentValue}
                      nextValue={nextValue}
                      index={index}
                    />
                  ) : (
                    /* For required steps, show standard connection */
                    <FlowConnection 
                      sourceValue={currentValue}
                      targetValue={nextValue}
                      dropoff={dropoff}
                      hasSplit={Boolean(step.splitVariations && step.splitVariations.length > 0)}
                      isOptional={!step.isRequired}
                      skipValue={!step.isRequired ? previousValue - currentValue : undefined}
                    />
                  )}
                </>
              )}
              
              {/* Enhanced Split Variations - only show when there are actual values */}
              {step.splitVariations && step.splitVariations.length > 0 && (() => {
                // Calculate total value for all variations to check if there are actual values
                const totalVariationValue = step.splitVariations.reduce((total, splitStep) => {
                  return total + (splitStep.visitorCount || 0);
                }, 0);
                
                // Only show split variations if there are actual calculated values
                if (totalVariationValue > 0) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                      className="mt-8 ml-16 pl-8 border-l-2 border-dashed border-indigo-200 relative"
                    >
                      {/* Decorative element */}
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-100 rounded-full border-2 border-indigo-300"></div>
                      
                      <div className="text-sm font-semibold text-indigo-700 mb-4 pl-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        Split Variations
                      </div>
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {step.splitVariations.map((splitStep, splitIndex) => {
                          const splitValue = splitStep.visitorCount || 0;
                          
                          // Only show split variations with actual values
                          if (splitValue > 0) {
                            return (
                              <motion.div
                                key={`split-${index}-${splitIndex}`}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: splitIndex * 0.1 + 0.4, ease: "easeOut" }}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                              >
                                {/* Animated background pattern */}
                                <motion.div
                                  className="absolute inset-0 opacity-5"
                                  animate={{ 
                                    backgroundPosition: ['0% 0%', '100% 100%']
                                  }}
                                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                  style={{
                                    backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                  }}
                                />
                                
                                <div className="relative z-10">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-gray-800">{splitStep.name}</span>
                                    <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                      {((splitValue) / (currentValue || 1) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="mt-3 flex items-center text-sm text-gray-600">
                                    <span className="mr-2 text-lg">👥</span>
                                    <span className="font-semibold text-gray-800">
                                      {splitValue.toLocaleString()} users
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                          return null; // Don't render split variations with zero values
                        })}
                      </div>
                    </motion.div>
                  );
                }
                return null; // Don't render split variations section if no values
              })()}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelFlowVisualization;
