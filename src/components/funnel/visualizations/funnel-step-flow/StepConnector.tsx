import React from "react";
import { ArrowDown, Users, SkipForward, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StepConnectorProps {
  previousValue: number;
  currentValue: number;
  isOptional?: boolean;
}

const StepConnector: React.FC<StepConnectorProps> = ({
  previousValue,
  currentValue,
  isOptional = false
}) => {
  // Calculate dropoff or bypass
  const dropoff = previousValue - currentValue;
  const dropoffPercentage = previousValue ? (dropoff / previousValue) * 100 : 0;
  const conversionPercentage = previousValue ? (currentValue / previousValue) * 100 : 0;
  
  // Only show dropoff indicator if there's significant dropoff
  const showDropoff = dropoffPercentage > 5;
  
  return (
    <motion.div 
      className="relative my-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Enhanced Connection Line */}
      <div className="flex items-center justify-center relative">
        <div className="relative h-16 flex items-center justify-center">
          {/* Animated gradient background for the connection */}
          <motion.div
            className={`absolute inset-0 rounded-full opacity-60 ${
              isOptional 
                ? 'bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50' 
                : 'bg-gradient-to-b from-gray-50 via-slate-50 to-zinc-50'
            }`}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Main flow arrow with enhanced styling */}
          <motion.div
            className="relative z-10"
            animate={{ 
              y: [0, 6, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              <ArrowDown 
                size={24} 
                className={`drop-shadow-sm ${
                  isOptional ? 'text-indigo-600' : 'text-gray-600'
                }`} 
              />
              {/* Glow effect */}
              <div className={`absolute inset-0 blur-sm opacity-30 ${
                isOptional ? 'bg-indigo-400' : 'bg-gray-400'
              }`}></div>
            </div>
          </motion.div>
          
          {/* Particle effects around the arrow */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  isOptional ? 'bg-indigo-400' : 'bg-gray-400'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-20px)`
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Dropoff/Bypass Indicator */}
      {showDropoff && (
        <motion.div 
          className={`mt-6 rounded-xl p-6 shadow-lg border relative overflow-hidden ${
            isOptional 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: `radial-gradient(circle, ${
                isOptional ? '#3b82f6' : '#ef4444'
              } 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={isOptional ? { x: [0, 5, 0] } : { rotate: [0, 10, -10, 0] }}
                  transition={{ duration: isOptional ? 1.5 : 2, repeat: Infinity }}
                >
                  {isOptional ? (
                    <SkipForward className="w-6 h-6 text-blue-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-gray-500" />
                  )}
                </motion.div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-800 text-lg">{dropoff.toLocaleString()}</span>
                    <span className="text-gray-600">
                      {isOptional ? 'users bypass' : 'users lost'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {isOptional ? 'This step is optional' : `Conversion rate: ${conversionPercentage.toFixed(1)}%`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`px-3 py-1 ${
                  isOptional 
                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}>
                  {dropoffPercentage.toFixed(1)}% {isOptional ? 'bypass' : 'drop-off'}
                </Badge>
                {isOptional && (
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-300">
                    Optional step
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Enhanced Conversion Rate Indicator */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
      >
        {/* Prominent conversion rate display */}
        <div className="relative">
          {/* Background glow effect */}
          <motion.div
            className={`absolute inset-0 rounded-2xl blur-lg opacity-30 ${
              conversionPercentage >= 80 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : conversionPercentage >= 60 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-gray-400 to-slate-500'
            }`}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Main conversion rate card */}
          <div className={`relative rounded-2xl p-6 shadow-xl border-2 ${
            conversionPercentage >= 80 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : conversionPercentage >= 60 
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-center space-x-4">
              {/* Animated icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className={`w-8 h-8 ${
                  conversionPercentage >= 80 
                    ? 'text-green-600'
                    : conversionPercentage >= 60 
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`} />
              </motion.div>
              
              {/* Conversion rate text */}
              <div className="text-center">
                <div className={`text-4xl font-bold mb-1 ${
                  conversionPercentage >= 80 
                    ? 'text-green-700'
                    : conversionPercentage >= 60 
                    ? 'text-yellow-700'
                    : 'text-gray-700'
                }`}>
                  {conversionPercentage.toFixed(1)}%
                </div>
                <div className={`text-sm font-medium ${
                  conversionPercentage >= 80 
                    ? 'text-green-600'
                    : conversionPercentage >= 60 
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}>
                  Conversion Rate
                </div>
              </div>
              
              {/* Performance indicator */}
              <div className="flex flex-col items-center">
                {conversionPercentage >= 80 ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </motion.div>
                ) : conversionPercentage >= 60 ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  </motion.div>
                )}
                <span className="text-xs text-gray-500 mt-1">
                  {conversionPercentage >= 80 ? 'Excellent' : conversionPercentage >= 60 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
            
            {/* Additional metrics */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className={`bg-white rounded-lg p-3 border ${
                conversionPercentage >= 80 
                  ? 'border-green-200'
                  : conversionPercentage >= 60 
                  ? 'border-yellow-200'
                  : 'border-gray-200'
              }`}>
                <div className="text-lg font-semibold text-gray-800">
                  {previousValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Started</div>
              </div>
              <div className={`bg-white rounded-lg p-3 border ${
                conversionPercentage >= 80 
                  ? 'border-green-200'
                  : conversionPercentage >= 60 
                  ? 'border-yellow-200'
                  : 'border-gray-200'
              }`}>
                <div className="text-lg font-semibold text-gray-800">
                  {currentValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepConnector;
