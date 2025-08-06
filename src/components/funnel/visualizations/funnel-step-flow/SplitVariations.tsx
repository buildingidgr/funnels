import React from "react";
import { SplitVariation } from "@/types/funnel";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface SplitVariationsProps {
  split?: SplitVariation[];
  parentValue?: number;
}

const SplitVariations: React.FC<SplitVariationsProps> = ({ split, parentValue }) => {
  if (!split || split.length === 0) return null;
  
  const renderCondition = (condition: any, i: number) => {
    return (
      <div key={condition.id || i} className="mb-2 p-2 bg-gray-50 rounded border border-gray-100">
        <div className="font-medium text-gray-700 flex items-center gap-2">
          {condition.type === 'event' && (
            <>
              <span>Event:</span>
              <span className="text-blue-700">{condition.event}</span>
              <span className="text-gray-500">{condition.countOperator} {condition.count} times</span>
              <span className="text-gray-500">within {condition.timeWindow?.value} {condition.timeWindow?.unit}</span>
            </>
          )}
          {condition.type === 'and' && <span>AND group</span>}
          {condition.type === 'or' && <span>OR group</span>}
        </div>
        {condition.properties && condition.properties.length > 0 && (
          <div className="ml-4 mt-1">
            <div className="text-xs text-gray-500">Properties:</div>
            <ul className="list-disc ml-4">
              {condition.properties.map((prop: any, idx: number) => (
                <li key={idx} className="text-xs text-gray-700">
                  {prop.property} {prop.operator} {prop.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        {condition.children && condition.children.length > 0 && (
          <div className="ml-4 mt-1">
            <div className="text-xs text-gray-500">Nested Conditions:</div>
            {condition.children.map(renderCondition)}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-6 ml-12 pl-6 border-l-2 border-dashed border-gray-200"
    >
      <div className="text-sm font-medium text-gray-600 mb-3 pl-2">
        Split Variations
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {split.map((splitStep, index) => (
          <motion.div
            key={`split-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">{splitStep.name}</span>
              <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                {((splitStep.visitorCount || 0) / (parentValue || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              {splitStep.visitorCount?.toLocaleString() || 0} users
            </div>
            
            {/* Conditions */}
            {splitStep.conditions && splitStep.conditions.orEventGroups && splitStep.conditions.orEventGroups.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 gap-1">
                  {splitStep.conditions.orEventGroups.map(renderCondition)}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SplitVariations;
