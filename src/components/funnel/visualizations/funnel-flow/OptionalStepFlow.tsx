import React from "react";
import { FunnelStep } from "@/types/funnel";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Users, CheckCircle, SkipForward, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface OptionalStepFlowProps {
  currentStep: FunnelStep;
  nextStep: FunnelStep;
  previousValue: number;
  currentValue: number;
  nextValue: number;
  index: number;
}

const OptionalStepFlow: React.FC<OptionalStepFlowProps> = ({
  currentStep,
  nextStep,
  previousValue,
  currentValue,
  nextValue,
  index
}) => {
  // Enhanced color palette for better visual distinction
  const getPathColor = (pathType: 'completed' | 'skipped', stepIndex: number) => {
    const completedColors = [
      '#10b981', // Green
      '#059669', // Emerald
      '#16a34a', // Lime
      '#22c55e', // Green
      '#4ade80', // Green
      '#65a30d', // Lime
    ];
    
    const skippedColors = [
      '#3b82f6', // Blue
      '#2563eb', // Blue
      '#1d4ed8', // Blue
      '#1e40af', // Blue
      '#1e3a8a', // Blue
      '#3730a3', // Indigo
    ];
    
    if (pathType === 'completed') {
      return completedColors[stepIndex % completedColors.length];
    } else {
      return skippedColors[stepIndex % skippedColors.length];
    }
  };

  // Calculate the two paths more accurately
  const completedPathValue = currentValue; // Users who completed the optional step
  const skippedPathValue = previousValue - currentValue; // Users who skipped the optional step
  
  // Calculate how many users from each path reach the next step
  // This is a more realistic calculation based on the actual funnel data
  const totalReachingNext = nextValue;
  const completedPathConversion = completedPathValue > 0 ? (totalReachingNext / completedPathValue) * 100 : 0;
  const skippedPathConversion = skippedPathValue > 0 ? (totalReachingNext / skippedPathValue) * 100 : 0;
  
  // Distribute the next step users proportionally based on the path sizes
  const completedPathFinal = Math.round(totalReachingNext * (completedPathValue / previousValue));
  const skippedPathFinal = totalReachingNext - completedPathFinal;

  const completedColor = getPathColor('completed', index);
  const skippedColor = getPathColor('skipped', index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative my-8"
    >
      {/* Flow Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {previousValue.toLocaleString()} users reach this optional step
          </span>
        </div>
      </div>

      {/* Dual Flow Container */}
      <div className="grid grid-cols-2 gap-8 relative">
        
        {/* Path 1: Users who completed the optional step */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative"
        >
          <Card className="border-green-200 bg-green-50" style={{ borderColor: completedColor, backgroundColor: `${completedColor}10` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" style={{ color: completedColor }} />
                  <span className="font-medium" style={{ color: completedColor }}>Completed Path</span>
                </div>
                <Badge variant="outline" style={{ backgroundColor: `${completedColor}20`, color: completedColor, borderColor: completedColor }}>
                  {completedPathValue.toLocaleString()} users
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed step:</span>
                  <span className="font-medium">{currentStep.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Path conversion:</span>
                  <span className="font-medium text-green-600">
                    {completedPathConversion.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reached next step:</span>
                  <span className="font-medium">{completedPathFinal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Path percentage:</span>
                  <span className="font-medium">
                    {previousValue > 0 ? ((completedPathValue / previousValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow to next step */}
          <div className="flex justify-center mt-4">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown className="h-6 w-6" style={{ color: completedColor }} />
            </motion.div>
          </div>
        </motion.div>

        {/* Path 2: Users who skipped the optional step */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative"
        >
          <Card className="border-blue-200 bg-blue-50" style={{ borderColor: skippedColor, backgroundColor: `${skippedColor}10` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SkipForward className="h-5 w-5" style={{ color: skippedColor }} />
                  <span className="font-medium" style={{ color: skippedColor }}>Bypassed Path</span>
                </div>
                <Badge variant="outline" style={{ backgroundColor: `${skippedColor}20`, color: skippedColor, borderColor: skippedColor }}>
                  {skippedPathValue.toLocaleString()} users
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skipped step:</span>
                  <span className="font-medium">{currentStep.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Path conversion:</span>
                  <span className="font-medium text-blue-600">
                    {skippedPathConversion.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reached next step:</span>
                  <span className="font-medium">{skippedPathFinal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Path percentage:</span>
                  <span className="font-medium">
                    {previousValue > 0 ? ((skippedPathValue / previousValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow to next step */}
          <div className="flex justify-center mt-4">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <ArrowDown className="h-6 w-6" style={{ color: skippedColor }} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Convergence Point */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex justify-center mt-6"
      >
        <div className="bg-gray-100 rounded-full p-3">
          <Users className="h-6 w-6 text-gray-600" />
        </div>
      </motion.div>

      {/* Next Step Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="text-center mt-4"
      >
        <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {nextValue.toLocaleString()} users reach: {nextStep.name}
          </span>
        </div>
      </motion.div>

      {/* Flow Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg"
      >
        <div className="text-center text-sm text-gray-600">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-gray-800">{previousValue.toLocaleString()}</div>
              <div>Started</div>
            </div>
            <div>
              <div className="font-medium" style={{ color: completedColor }}>{completedPathValue.toLocaleString()}</div>
              <div>Completed</div>
            </div>
            <div>
              <div className="font-medium" style={{ color: skippedColor }}>{skippedPathValue.toLocaleString()}</div>
              <div>Bypassed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Path Comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
      >
        <h4 className="text-sm font-medium text-gray-700 mb-3">Path Comparison</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: completedColor }}>
              {previousValue > 0 ? ((completedPathValue / previousValue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500">Chose to complete</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: skippedColor }}>
              {previousValue > 0 ? ((skippedPathValue / previousValue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500">Chose to bypass</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OptionalStepFlow; 