import React from "react";
import { ArrowDown, Users, SkipForward } from "lucide-react";
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
  
  // Only show dropoff indicator if there's significant dropoff
  const showDropoff = dropoffPercentage > 5;
  
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
            className={`ml-8 bg-white rounded-lg p-4 shadow-sm border relative ${
              isOptional ? 'border-blue-200' : 'border-gray-100'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className={`absolute -left-6 top-1/2 transform -translate-y-1/2 w-6 h-0.5 ${
              isOptional ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isOptional ? (
                  <SkipForward className="w-4 h-4 text-blue-500" />
                ) : (
                  <Users className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium text-gray-800">{dropoff.toLocaleString()}</span>
              </div>
              <span className="text-gray-500">
                {isOptional ? 'users bypass' : 'users lost'}
              </span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                isOptional 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {dropoffPercentage.toFixed(1)}% {isOptional ? 'bypass' : 'drop-off'}
              </span>
              {isOptional && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-300">
                  Optional step
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StepConnector;
