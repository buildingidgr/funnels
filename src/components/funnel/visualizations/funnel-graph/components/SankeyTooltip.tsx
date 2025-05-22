import React from "react";
import { FunnelStep } from "@/types/funnel";

interface NodeTooltipProps {
  payload: any;
  nodeMap: Record<string, any>;
  initialValue: number;
}

// Helper function to determine conversion category
const getConversionCategory = (conversionRate: number) => {
  if (conversionRate >= 90) return { label: "Excellent", color: "text-green-600" };
  if (conversionRate >= 70) return { label: "Good", color: "text-emerald-500" };
  if (conversionRate >= 50) return { label: "Fair", color: "text-amber-500" };
  if (conversionRate >= 30) return { label: "Poor", color: "text-orange-500" };
  return { label: "Critical", color: "text-red-500" };
};

// Helper to format percentages
const formatPercent = (value: number, digits: number = 1) => {
  return value.toFixed(digits) + '%';
};

export const SankeyTooltip: React.FC<NodeTooltipProps> = ({ 
  payload, 
  nodeMap, 
  initialValue 
}) => {
  if (!payload || !payload.length) return null;
  
  const data = payload[0].payload;
  if (!data) return null;
  
  if (data.source !== undefined && data.target !== undefined) {
    // Link tooltip - use the sourceId/targetId from data if available
    const sourceId = data.sourceId || "";
    const targetId = data.targetId || "";
    
    const sourceNode = nodeMap[sourceId];
    const targetNode = nodeMap[targetId];
    
    // Fall back to looking up nodes by their index if we can't find by ID
    if (!sourceNode || !targetNode) {
      // Try to find node IDs from the nodeMap by looking at each entry
      const sourceNodeEntry = Object.entries(nodeMap).find(
        ([_, node]: [string, any]) => node.step === data.source
      );
      const targetNodeEntry = Object.entries(nodeMap).find(
        ([_, node]: [string, any]) => node.step === data.target
      );
      
      // Extract the actual node objects
      const sourceNodeByIndex = sourceNodeEntry ? sourceNodeEntry[1] : null;
      const targetNodeByIndex = targetNodeEntry ? targetNodeEntry[1] : null;
      
      const conversionRate = sourceNodeByIndex && targetNodeByIndex && sourceNodeByIndex.value > 0
        ? (targetNodeByIndex.value / sourceNodeByIndex.value) * 100
        : 0;
      
      const dropOffRate = 100 - conversionRate;
      const dropOffValue = sourceNodeByIndex && targetNodeByIndex
        ? sourceNodeByIndex.value - targetNodeByIndex.value
        : 0;
        
      const conversionCategory = getConversionCategory(conversionRate);
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-xs min-w-[220px]">
          <div className="font-semibold mb-2 pb-1 border-b border-gray-100 text-sm flex items-center justify-between">
            <span>Connection Details</span>
            <span className={`text-xs px-2 py-0.5 rounded-sm ${conversionCategory.color} bg-opacity-20 bg-current`}>
              {conversionCategory.label}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1">
            <div className="text-gray-500">From Step:</div>
            <div className="font-medium">{sourceNodeByIndex?.name || "Unknown"}</div>
            <div className="text-gray-500">To Step:</div>
            <div className="font-medium">{targetNodeByIndex?.name || "Unknown"}</div>
          </div>
          
          {/* Metrics section */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-500">Users:</div>
              <div className="font-medium">{data.value?.toLocaleString() || "0"}</div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-gray-500">Drop-off:</div>
              <div className="font-medium text-gray-700">{dropOffValue.toLocaleString()} users ({formatPercent(dropOffRate)})</div>
            </div>
          </div>
        </div>
      );
    }
    
    // If we have proper source/target nodes from IDs
    const conversionRate = sourceNode && targetNode && sourceNode.value > 0
      ? (targetNode.value / sourceNode.value) * 100
      : 0;
      
    const dropOffRate = 100 - conversionRate;
    const dropOffValue = sourceNode && targetNode
      ? sourceNode.value - targetNode.value
      : 0;
      
    const conversionCategory = getConversionCategory(conversionRate);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-xs min-w-[220px]">
        <div className="font-semibold mb-2 pb-1 border-b border-gray-100 text-sm flex items-center justify-between">
          <span>Connection Details</span>
          <span className={`text-xs px-2 py-0.5 rounded-sm ${conversionCategory.color} bg-opacity-20 bg-current`}>
            {conversionCategory.label}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1">
          <div className="text-gray-500">From Step:</div>
          <div className="font-medium">{sourceNode?.name || "Unknown"}</div>
          <div className="text-gray-500">To Step:</div>
          <div className="font-medium">{targetNode?.name || "Unknown"}</div>
        </div>
        
        {/* Metrics section */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-500">Users:</div>
            <div className="font-medium">{data.value?.toLocaleString() || "0"}</div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-gray-500">Drop-off:</div>
            <div className="font-medium text-gray-700">{dropOffValue.toLocaleString()} users ({formatPercent(dropOffRate)})</div>
          </div>
        </div>
      </div>
    );
  } else {
    // Node tooltip
    const nodeName = data.name;
    
    // Try to find the node by name or index
    let node = nodeMap[nodeName];
    
    if (!node && typeof data.index === 'number') {
      // Try to find node by index if we can't find by name
      const nodeEntry = Object.entries(nodeMap).find(
        ([_, n]: [string, any]) => n.step === data.index
      );
      if (nodeEntry) {
        node = nodeEntry[1];
      }
    }
    
    if (!node) return null;
    
    const previousNode = node.previousStep 
      ? nodeMap[node.previousStep]
      : { value: initialValue, name: "Initial" };
      
    const conversionRate = previousNode && previousNode.value > 0
      ? (node.value / previousNode.value) * 100
      : 0;
    
    const dropOffRate = 100 - conversionRate;
    const dropOffValue = previousNode 
      ? previousNode.value - node.value
      : 0;
    
    // Overall funnel position
    const overallValue = initialValue;
    const overallConversion = overallValue > 0 
      ? (node.value / overallValue) * 100
      : 0;
      
    const conversionCategory = getConversionCategory(conversionRate);
    const isSplitStep = nodeName.includes('-split-');
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-xs min-w-[250px]">
        <div className="font-semibold mb-2 pb-1 border-b border-gray-100 text-sm flex items-center justify-between">
          <span>{node.name} {isSplitStep ? '(Split)' : ''}</span>
          <span className={`text-xs px-2 py-0.5 rounded-sm ${conversionCategory.color} bg-opacity-20 bg-current`}>
            {conversionCategory.label}
          </span>
        </div>
        
        {/* Basic Info */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-500">Step Users:</div>
          <div className="font-medium">{node.value.toLocaleString()}</div>
        </div>
        
        {/* Conversion from previous step */}
        <div className="mb-3">
          <div className="text-gray-500 mb-1">From Previous Step:</div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">{previousNode.name}</span>
            <span className={`font-medium ${conversionCategory.color}`}>{formatPercent(conversionRate)}</span>
          </div>
          
          {/* Progress bar visualization */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${conversionCategory.color} bg-current`}
              style={{ width: `${Math.min(100, Math.max(0, conversionRate))}%` }}
            ></div>
          </div>
          
          {/* Drop-off details */}
          {dropOffValue > 0 && (
            <div className="flex justify-between items-center mt-1 text-gray-500 text-xs">
              <span>Drop-off: {dropOffValue.toLocaleString()} users</span>
              <span>({formatPercent(dropOffRate)})</span>
            </div>
          )}
        </div>
        
        {/* Overall funnel position */}
        <div className="pt-2 mt-1 border-t border-gray-100">
          <div className="text-gray-500 mb-1">Overall Funnel Position:</div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">From Funnel Start</span>
            <span className="font-medium">{formatPercent(overallConversion)}</span>
          </div>
          
          {/* Overall progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${Math.min(100, Math.max(0, overallConversion))}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
};

export default SankeyTooltip;
