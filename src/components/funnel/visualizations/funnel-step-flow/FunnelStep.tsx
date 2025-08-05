import React from "react";
import { FunnelStep as FunnelStepType, ConditionItem } from "@/types/funnel";
import StepMetrics from "./StepMetrics";
import SplitVariations from "./SplitVariations";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  SkipForward
} from "lucide-react";
import { motion } from "framer-motion";
import { calculatePercentage, calculateTotalPercentage, getColorClass, getTextColorClass } from "./utils";
import { Badge } from "@/components/ui/badge";

interface FunnelStepProps {
  step: FunnelStepType;
  previousValue: number;
  isFirst?: boolean;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ step, previousValue, isFirst }) => {
  const currentValue = step.value || step.visitorCount || 0;
  const percentage = calculatePercentage(currentValue, previousValue);
  const totalPercentage = calculateTotalPercentage(currentValue, previousValue);
  const colorClass = getColorClass(percentage);
  const textColorClass = getTextColorClass(percentage);
  const isImprovement = percentage > 100;
  const isOptional = !step.isRequired;
  const bypassedUsers = previousValue - currentValue;
  const bypassPercentage = previousValue > 0 ? (bypassedUsers / previousValue) * 100 : 0;
  
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
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 w-full max-w-4xl mx-auto"
      whileHover={{ scale: 1.01 }}
    >
      <div className="p-8">
        {/* Step Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClass} shadow-sm`}>
              {/* Removed the white text showing step order */}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold text-gray-800">{step.name}</h3>
                {isOptional && (
                  <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-300">
                    Optional
                  </Badge>
                )}
              </div>
              {step.description && (
                <p className="text-base text-gray-500 mt-2">{step.description}</p>
              )}
            </div>
          </div>
          
          {/* User Count */}
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-gray-400" />
            <span className="text-3xl font-bold text-gray-800">
              {currentValue.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Conversion Rate */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-600">
                {isOptional ? 'Completion Rate' : 'Conversion Rate'}
              </span>
              {isImprovement ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-800">
                {percentage.toFixed(1)}%
              </span>
              {!isFirst && (
                <span className="ml-3 text-base text-gray-500">
                  from {previousValue.toLocaleString()} users
                </span>
              )}
            </div>
          </div>
          
          {/* Total Conversion or Bypass Info */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-600">
                {isOptional ? 'Bypass Rate' : 'Total Conversion'}
              </span>
              {isOptional ? (
                <SkipForward className="w-5 h-5 text-blue-500" />
              ) : (
                <span className={`text-base ${textColorClass}`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              )}
            </div>
            {isOptional ? (
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-blue-600">
                  {bypassPercentage.toFixed(1)}%
                </span>
                <span className="ml-3 text-base text-gray-500">
                  bypassed ({bypassedUsers.toLocaleString()} users)
                </span>
              </div>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${colorClass}`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Optional Step Flow Summary */}
        {isOptional && bypassedUsers > 0 && (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-base font-medium text-gray-700">Completed Path</span>
                <span className="text-base font-semibold text-green-600">
                  {currentValue.toLocaleString()} users
                </span>
              </div>
              <div className="flex items-center gap-3">
                <SkipForward className="w-5 h-5 text-blue-600" />
                <span className="text-base font-medium text-gray-700">Bypassed Path</span>
                <span className="text-base font-semibold text-blue-600">
                  {bypassedUsers.toLocaleString()} users
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Conditions */}
        {step.conditions.orEventGroups.length > 0 && (
          <div className="mt-6">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-base font-medium text-gray-600 hover:text-gray-800">
                <ChevronRight className="w-5 h-5 mr-2 group-open:rotate-90 transition-transform" />
                Conditions
              </summary>
              <div className="mt-3 pl-6 grid grid-cols-1 gap-3">
                {step.conditions.orEventGroups.map(renderCondition)}
                {step.conditions.andAlsoEvents?.map(renderCondition)}
              </div>
            </details>
          </div>
        )}
        
        {/* Split Variations */}
        {step.splitVariations && step.splitVariations.length > 0 && (
          <div className="mt-8">
            <SplitVariations split={step.splitVariations} parentValue={currentValue} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FunnelStep;
