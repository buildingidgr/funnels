import React from "react";
import { FunnelStep } from "@/types/funnel";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Users, CheckCircle, SkipForward, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative my-12"
    >
      {/* Enhanced Flow Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full px-6 py-3 border border-indigo-200 shadow-sm">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users className="h-5 w-5 text-indigo-600" />
          </motion.div>
          <span className="text-sm font-semibold text-gray-700">
            {previousValue.toLocaleString()} users reach this optional step
          </span>
        </div>
      </motion.div>

      {/* Enhanced Dual Flow Container */}
      <div className="grid grid-cols-2 gap-12 relative">
        
        {/* Path 1: Users who completed the optional step */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <Card className="relative overflow-hidden border-2 shadow-xl" style={{ borderColor: completedColor }}>
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ background: `linear-gradient(135deg, ${completedColor}20, ${completedColor}10)` }}
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="h-6 w-6" style={{ color: completedColor }} />
                  </motion.div>
                  <span className="font-bold text-lg" style={{ color: completedColor }}>Completed Path</span>
                </div>
                <Badge variant="outline" style={{ backgroundColor: `${completedColor}20`, color: completedColor, borderColor: completedColor }}>
                  {completedPathValue.toLocaleString()} users
                </Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Completed step:</span>
                  <span className="font-semibold">{currentStep.name}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Path conversion:</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {completedPathConversion.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Reached next step:</span>
                  <span className="font-semibold">{completedPathFinal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Path percentage:</span>
                  <span className="font-semibold">
                    {previousValue > 0 ? ((completedPathValue / previousValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Arrow to next step */}
          <div className="flex justify-center mt-6">
            <motion.div
              className="relative"
              animate={{ 
                y: [0, 8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-8 w-8" style={{ color: completedColor }} />
              {/* Glow effect */}
              <div className="absolute inset-0 blur-sm opacity-30" style={{ backgroundColor: completedColor }}></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Path 2: Users who skipped the optional step */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="relative"
        >
          <Card className="relative overflow-hidden border-2 shadow-xl" style={{ borderColor: skippedColor }}>
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ background: `linear-gradient(135deg, ${skippedColor}20, ${skippedColor}10)` }}
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <SkipForward className="h-6 w-6" style={{ color: skippedColor }} />
                  </motion.div>
                  <span className="font-bold text-lg" style={{ color: skippedColor }}>Bypassed Path</span>
                </div>
                <Badge variant="outline" style={{ backgroundColor: `${skippedColor}20`, color: skippedColor, borderColor: skippedColor }}>
                  {skippedPathValue.toLocaleString()} users
                </Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Skipped step:</span>
                  <span className="font-semibold">{currentStep.name}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Path conversion:</span>
                  <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {skippedPathConversion.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Reached next step:</span>
                  <span className="font-semibold">{skippedPathFinal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Path percentage:</span>
                  <span className="font-semibold">
                    {previousValue > 0 ? ((skippedPathValue / previousValue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Arrow to next step */}
          <div className="flex justify-center mt-6">
            <motion.div
              className="relative"
              animate={{ 
                y: [0, 8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <ArrowDown className="h-8 w-8" style={{ color: skippedColor }} />
              {/* Glow effect */}
              <div className="absolute inset-0 blur-sm opacity-30" style={{ backgroundColor: skippedColor }}></div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Convergence Point */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center mt-8"
      >
        <div className="relative">
          <motion.div
            className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-4 border-2 border-indigo-200 shadow-lg"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Users className="h-8 w-8 text-indigo-600" />
          </motion.div>
          {/* Particle effects around convergence */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-30px)`
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Next Step Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-center mt-6"
      >
        <div className="inline-block bg-gradient-to-r from-white to-gray-50 rounded-xl px-6 py-3 shadow-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {nextValue.toLocaleString()} users reach: {nextStep.name}
          </span>
        </div>
      </motion.div>

      {/* Enhanced Flow Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200"
      >
        <div className="text-center text-sm text-gray-600">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-bold text-gray-800 text-lg">{previousValue.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Started</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ borderColor: completedColor, borderWidth: '2px' }}>
              <div className="font-bold text-lg" style={{ color: completedColor }}>{completedPathValue.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ borderColor: skippedColor, borderWidth: '2px' }}>
              <div className="font-bold text-lg" style={{ color: skippedColor }}>{skippedPathValue.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Bypassed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Path Comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-lg"
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Path Comparison</h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${completedColor}10` }}>
            <div className="text-2xl font-bold" style={{ color: completedColor }}>
              {previousValue > 0 ? ((completedPathValue / previousValue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Chose to complete</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${skippedColor}10` }}>
            <div className="text-2xl font-bold" style={{ color: skippedColor }}>
              {previousValue > 0 ? ((skippedPathValue / previousValue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Chose to bypass</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OptionalStepFlow; 