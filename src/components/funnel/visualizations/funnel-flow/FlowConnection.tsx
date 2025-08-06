import { ArrowDown, SkipForward, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface FlowConnectionProps {
  sourceValue: number;
  targetValue: number;
  dropoff: number;
  hasSplit: boolean;
  isOptional?: boolean;
  skipValue?: number;
}

const FlowConnection: React.FC<FlowConnectionProps> = ({
  sourceValue,
  targetValue,
  dropoff,
  hasSplit,
  isOptional,
  skipValue
}) => {
  // Calculate conversion percentage
  const conversionPercentage = sourceValue ? (targetValue / sourceValue) * 100 : 0;
  const dropoffPercentage = 100 - conversionPercentage;
  
  // Only show dropoff indicator if there's significant dropoff
  const showDropoff = dropoffPercentage > 5 && !hasSplit;
  
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
            className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 rounded-full opacity-60"
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
              <ArrowDown size={24} className="text-indigo-600 drop-shadow-sm" />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-indigo-400 blur-sm opacity-30"></div>
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
                className="absolute w-1 h-1 bg-indigo-400 rounded-full"
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
        
        {/* Bypass line for optional steps with enhanced styling */}
        {isOptional && skipValue && skipValue > 0 && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-1 h-16 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"
                animate={{ 
                  scaleY: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {skipValue.toLocaleString()} users bypass
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Enhanced Dropoff Indicator */}
      {showDropoff && (
        <motion.div 
          className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
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
              backgroundImage: 'radial-gradient(circle, #6b7280 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingDown className="w-6 h-6 text-gray-500" />
                </motion.div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-800 text-lg">{dropoff.toLocaleString()}</span>
                    <span className="text-gray-600">users lost</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Conversion rate: {conversionPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-gray-100 text-gray-700 border-gray-300 px-3 py-1">
                  {dropoffPercentage.toFixed(1)}% drop-off
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Optional Step Bypass Indicator */}
      {isOptional && skipValue && skipValue > 0 && (
        <motion.div 
          className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-200 relative overflow-hidden"
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <SkipForward className="w-6 h-6 text-blue-500" />
                </motion.div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-800 text-lg">{skipValue.toLocaleString()}</span>
                    <span className="text-gray-600">users bypass</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    This step is optional
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 px-3 py-1">
                  Optional step
                </Badge>
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
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-30"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Main conversion rate card */}
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border-2 border-green-200">
            <div className="flex items-center justify-center space-x-4">
              {/* Animated icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-8 h-8 text-green-600" />
              </motion.div>
              
              {/* Conversion rate text */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-700 mb-1">
                  {conversionPercentage.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-green-600">
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
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-lg font-semibold text-gray-800">
                  {sourceValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Started</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-lg font-semibold text-gray-800">
                  {targetValue.toLocaleString()}
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

export default FlowConnection;
