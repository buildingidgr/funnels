import React from "react";
import { FunnelStep as FunnelStepType, ConditionItem } from "@/types/funnel";
import StepMetrics from "./StepMetrics";
import SplitVariations from "./SplitVariations";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { calculatePercentage, calculateTotalPercentage, getColorClass, getTextColorClass } from "./utils";

interface FunnelStepProps {
  step: FunnelStepType;
  previousValue: number;
  isFirst?: boolean;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ step, previousValue, isFirst }) => {
  const percentage = calculatePercentage(step.visitorCount || 0, previousValue);
  const totalPercentage = calculateTotalPercentage(step.visitorCount || 0, previousValue);
  const colorClass = getColorClass(percentage);
  const textColorClass = getTextColorClass(percentage);
  const isImprovement = percentage > 100;
  
  const renderCondition = (condition: ConditionItem, i: number) => {
    return (
      <div key={condition.eventName || i} className="mb-2 p-2 bg-gray-50 rounded border border-gray-100">
        <div className="font-medium text-gray-700 flex items-center gap-2">
          <span>Event:</span>
          <span className="text-blue-700">{condition.eventName}</span>
          <span className="text-gray-500">{condition.operator} {condition.count} times</span>
        </div>
        {condition.properties && condition.properties.length > 0 && (
          <div className="ml-4 mt-1">
            <div className="text-xs text-gray-500">Properties:</div>
            <ul className="list-disc ml-4">
              {condition.properties.map((prop, idx) => (
                <li key={idx} className="text-xs text-gray-700">
                  {prop.name} {prop.operator} {prop.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
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
        
        {/* Metrics */}
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
              {!isFirst && (
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
        {step.conditions.orEventGroups.length > 0 && (
          <div className="mt-4">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                <ChevronRight className="w-4 h-4 mr-1 group-open:rotate-90 transition-transform" />
                Conditions
              </summary>
              <div className="mt-2 pl-5 grid grid-cols-1 gap-2">
                {step.conditions.orEventGroups.map(renderCondition)}
                {step.conditions.andAlsoEvents?.map(renderCondition)}
              </div>
            </details>
          </div>
        )}
        
        {/* Split Variations */}
        {step.splitVariations && step.splitVariations.length > 0 && (
          <div className="mt-6">
            <SplitVariations split={step.splitVariations} parentValue={step.visitorCount || 0} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FunnelStep;
