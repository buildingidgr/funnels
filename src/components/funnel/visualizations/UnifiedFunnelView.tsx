import React from "react";
import { FunnelStep as FunnelStepType, ConditionItem } from "@/types/funnel";
import { motion } from "framer-motion";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertCircle,
  ArrowDown
} from "lucide-react";
import { calculatePercentage, calculateTotalPercentage, getColorClass, getTextColorClass } from "./funnel-step-flow/utils";

interface UnifiedFunnelViewProps {
  steps: FunnelStepType[];
  initialValue: number;
}

const UnifiedFunnelView: React.FC<UnifiedFunnelViewProps> = ({ steps, initialValue }) => {
  // Debug logs
  console.log('UnifiedFunnelView received steps:', steps);
  console.log('UnifiedFunnelView received initialValue:', initialValue);
  
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.isEnabled);
  console.log('Enabled steps:', enabledSteps);
  
  if (enabledSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No enabled steps to display
      </div>
    );
  }

  const renderCondition = (condition: ConditionItem, i: number): JSX.Element => {
    const renderConditionContent = () => {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-gray-700">Event:</span>
            <span className="font-semibold text-blue-700">{condition.eventName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 font-medium">
            <span>at least <span className="font-bold">{condition.count}</span> times</span>
            <span className="hidden sm:inline">•</span>
          </div>
        </div>
      );
    };

    return (
      <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-4 mb-2 shadow-sm">
        {renderConditionContent()}
        {condition.properties && condition.properties.length > 0 && (
          <>
            <div className="my-2 border-t border-gray-200" />
            <div className="text-xs text-gray-500 font-medium mb-1">Properties:</div>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {condition.properties.map((prop, idx) => (
                <li key={idx}
                    className="mb-0.5">
                  <span className="font-medium">{prop.name}</span> {prop.operator} <span className="font-semibold">{prop.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative py-8 px-4 bg-gradient-to-b from-gray-50 to-white rounded-xl">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="flex flex-col items-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {enabledSteps.map((step, index) => {
            const isFirstStep = index === 0;
            const previousValue = isFirstStep ? initialValue : (enabledSteps[index - 1].visitorCount || 0);
            const percentage = calculatePercentage(step.visitorCount, previousValue);
            const totalPercentage = calculateTotalPercentage(step.visitorCount, previousValue);
            const colorClass = getColorClass(percentage);
            const textColorClass = getTextColorClass(percentage);
            const isImprovement = percentage > 100;
            const dropoff = previousValue - (step.visitorCount || 0);
            const dropoffPercentage = previousValue ? (dropoff / previousValue) * 100 : 0;
            const showDropoff = dropoffPercentage > 5;

            return (
              <motion.div
                key={`step-${step.order}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="w-full"
              >
                {/* Step Card */}
                <motion.div 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="p-6">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass} shadow-sm`}>
                          <span className="text-white text-lg font-semibold">{step.order}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{step.name}</h3>
                          {step.description && (
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* User Count */}
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-800">
                          {step.visitorCount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Conversion Rate */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                          {isImprovement ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-800">
                            {percentage.toFixed(1)}%
                          </span>
                          {!isFirstStep && (
                            <span className="ml-2 text-sm text-gray-500">
                              from {previousValue.toLocaleString()} users
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Total Conversion */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Total Conversion</span>
                          <span className={`text-sm ${textColorClass}`}>
                            {totalPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colorClass}`}
                            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Conditions */}
                    {step.conditions && (step.conditions.orEventGroups.length > 0 || (step.conditions.andAlsoEvents && step.conditions.andAlsoEvents.length > 0)) && (
                      <div className="mt-4">
                        <details className="group">
                          <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                            <ChevronRight className="w-4 h-4 mr-1 group-open:rotate-90 transition-transform" />
                            Conditions
                          </summary>
                          <div className="mt-2 pl-5 grid grid-cols-1 gap-2">
                            {step.conditions.orEventGroups.map((condition, idx) => renderCondition(condition, idx))}
                            {step.conditions.andAlsoEvents?.map((condition, idx) => renderCondition(condition, idx))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Connection to Next Step */}
                {index < enabledSteps.length - 1 && (
                  <motion.div 
                    className="ml-5 pl-5 my-4 relative"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center">
                      <div className="h-12 flex items-center justify-center">
                        <motion.div
                          animate={{ y: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowDown size={20} className="text-gray-400" />
                        </motion.div>
                      </div>
                      
                      {showDropoff && (
                        <motion.div 
                          className="ml-8 bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-gray-200"></div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-gray-800">{dropoff.toLocaleString()}</span>
                            </div>
                            <span className="text-gray-500">users lost</span>
                            <span className="text-sm bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              {dropoffPercentage.toFixed(1)}% drop-off
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Split Variations */}
                {step.splitVariations && step.splitVariations.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6 ml-12 pl-6 border-l-2 border-dashed border-gray-200"
                  >
                    <div className="flex items-center space-x-2 mb-4 pl-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-medium text-gray-700">Split Variations</h4>
                      <span className="text-xs text-gray-500">({step.splitVariations.length} paths)</span>
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {step.splitVariations.map((splitStep, splitIndex) => {
                        const splitPercentage = ((splitStep.visitorCount || 0) / (step.visitorCount || 1) * 100);
                        const isLargestSplit = splitIndex === step.splitVariations!.reduce((maxIndex, current, currentIndex, array) => 
                          (current.visitorCount || 0) > (array[maxIndex].visitorCount || 0) ? currentIndex : maxIndex, 0
                        );
                        
                        return (
                          <motion.div
                            key={`split-${splitIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: splitIndex * 0.1 }}
                            className={`bg-white rounded-lg p-5 shadow-sm border ${isLargestSplit ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'} hover:shadow-md transition-all duration-200 min-w-[280px]`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-start space-x-3 min-w-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isLargestSplit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                  <span className="text-sm font-medium">{splitIndex + 1}</span>
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-medium text-gray-800 truncate">{splitStep.name}</h5>
                                  <div className="flex items-center space-x-2 mt-1.5">
                                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">
                                      {splitStep.visitorCount?.toLocaleString() || 0} users
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end ml-2 flex-shrink-0">
                                <span className={`text-sm font-medium ${isLargestSplit ? 'text-blue-600' : 'text-gray-600'} px-3 py-1 rounded-full ${isLargestSplit ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                  {splitPercentage.toFixed(1)}%
                                </span>
                                {isLargestSplit && (
                                  <span className="text-xs text-blue-600 mt-1.5">Largest path</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                              <div 
                                className={`h-2 rounded-full ${isLargestSplit ? 'bg-blue-500' : 'bg-gray-400'}`}
                                style={{ width: `${splitPercentage}%` }}
                              />
                            </div>
                            
                            {/* Split Conditions */}
                            {splitStep.conditions && (splitStep.conditions.orEventGroups.length > 0 || (splitStep.conditions.andAlsoEvents && splitStep.conditions.andAlsoEvents.length > 0)) && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-2 mb-3">
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-500">Conditions</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {splitStep.conditions.orEventGroups.map((condition, idx) => renderCondition(condition, idx))}
                                  {splitStep.conditions.andAlsoEvents?.map((condition, idx) => renderCondition(condition, idx))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedFunnelView; 