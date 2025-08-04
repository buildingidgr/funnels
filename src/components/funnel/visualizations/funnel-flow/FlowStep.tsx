import React from "react";
import { FunnelStep } from "@/types/funnel";
import { getConversionColor } from "./utils";
import { 
  Circle, 
  Users,
  Info,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FlowStepProps {
  step: FunnelStep;
  index: number;
  previousValue: number;
  conversionRate: number;
  isFirst: boolean;
}

const FlowStep: React.FC<FlowStepProps> = ({
  step,
  index,
  previousValue,
  conversionRate,
  isFirst
}) => {
  // Enhanced color palette for better step distinction
  const getStepColor = (index: number) => {
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#ec4899', // Pink
      '#84cc16', // Lime
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#f43f5e', // Rose
    ];
    
    return colors[index % colors.length];
  };

  const colorClass = getConversionColor(conversionRate);
  const isImprovement = conversionRate > 100;
  const dropoff = previousValue - (step.value || 0);
  const dropoffPercentage = previousValue ? (dropoff / previousValue) * 100 : 0;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const stepColor = getStepColor(index);
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="p-6">
        {/* Step Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.div 
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm cursor-pointer`}
              style={{ backgroundColor: stepColor }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="text-white text-lg font-semibold">{step.order}</span>
            </motion.div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stepColor }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {step.name}
                    {!step.isRequired && (
                      <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                        Optional
                      </Badge>
                    )}
                  </h3>
                </div>
              </div>
              {step.description && (
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              )}
            </div>
          </div>
          
          {/* User Count with Animation */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-800">
              {step.value?.toLocaleString() || 0}
            </span>
          </motion.div>
        </div>
        
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Conversion Rate */}
          <motion.div 
            className="bg-gray-50 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of users who completed this step</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                {conversionRate.toFixed(1)}%
              </span>
              {!isFirst && (
                <span className="ml-2 text-sm text-gray-500">
                  from {previousValue.toLocaleString()} users
                </span>
              )}
            </div>
            <Progress 
              value={conversionRate} 
              className={cn("mt-2 h-2", isImprovement ? "bg-green-100" : "bg-red-100")}
            />
          </motion.div>
          
          {/* Drop-off or Optional Flow Info */}
          {!isFirst ? (
            <motion.div 
              className="bg-gray-50 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {!step.isRequired ? 'Flow Split' : 'Drop-off'}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {!step.isRequired 
                          ? 'Users who completed vs bypassed this optional step'
                          : 'Number of users who left at this step'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline">
                {!step.isRequired ? (
                  <>
                    <span className="text-2xl font-bold text-blue-600">
                      {dropoff.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      bypassed ({dropoffPercentage.toFixed(1)}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      {dropoff.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      lost ({dropoffPercentage.toFixed(1)}%)
                    </span>
                  </>
                )}
              </div>
              <Progress 
                value={dropoffPercentage} 
                className={cn("mt-2 h-2", !step.isRequired ? "bg-blue-100" : "bg-red-100")}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="bg-gray-50 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Users</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total users who started the funnel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-800">
                  {previousValue.toLocaleString()}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  started
                </span>
              </div>
              <Progress 
                value={100} 
                className="mt-2 h-2 bg-gray-200"
              />
            </motion.div>
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {/* Step Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {step.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {/* Additional Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Total Conversion</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {((step.value || 0) / previousValue * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Step Requirements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Requirements</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {step.isRequired ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FlowStep;
