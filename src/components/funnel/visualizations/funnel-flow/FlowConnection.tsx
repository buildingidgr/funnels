import React from "react";
import { ArrowDown, Users } from "lucide-react";
import { motion } from "framer-motion";

interface FlowConnectionProps {
  sourceValue: number;
  targetValue: number;
  dropoff: number;
  hasSplit: boolean;
}

const FlowConnection: React.FC<FlowConnectionProps> = ({
  sourceValue,
  targetValue,
  dropoff,
  hasSplit
}) => {
  // Calculate conversion percentage
  const conversionPercentage = sourceValue ? (targetValue / sourceValue) * 100 : 0;
  const dropoffPercentage = 100 - conversionPercentage;
  
  // Only show dropoff indicator if there's significant dropoff
  const showDropoff = dropoffPercentage > 5 && !hasSplit;
  
  return (
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
  );
};

export default FlowConnection;
