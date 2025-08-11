import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface NodeTooltipProps {
  payload: any;
  nodeMap: Record<string, any>;
  initialValue: number;
  funnelId?: string;
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

// Highlight drop-off severity
const getDropoffSeverity = (dropOffRate: number) => {
  if (dropOffRate >= 50) return { label: "Very High Drop-off", className: "text-red-600", badge: "bg-red-50 text-red-700 border-red-200" };
  if (dropOffRate >= 30) return { label: "High Drop-off", className: "text-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200" };
  if (dropOffRate >= 15) return { label: "Moderate Drop-off", className: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Low Drop-off", className: "text-slate-600", badge: "bg-slate-50 text-slate-700 border-slate-200" };
};

// Color for overall conversion context
const getOverallConversionColor = (overallPercent: number) => {
  if (overallPercent >= 70) return "text-green-600";
  if (overallPercent >= 40) return "text-amber-600";
  return "text-slate-600";
};

// Strip any textual optional marker from names
const stripOptionalTag = (name?: string) => {
  if (!name) return '';
  return name.replace(/\s*\(optional\)\s*/i, '').trim();
};

export const SankeyTooltip: React.FC<NodeTooltipProps> = ({ 
  payload, 
  nodeMap, 
  initialValue,
  funnelId
}) => {
  if (!payload || !payload.length) return null;
  const navigate = useNavigate();
  const params = useParams();
  const resolvedFunnelId = funnelId || params.id || "";
  
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
        ([_, node]: [string, any]) => (node as any).step === data.source
      );
      const targetNodeEntry = Object.entries(nodeMap).find(
        ([_, node]: [string, any]) => (node as any).step === data.target
      );
      
      // Extract the actual node objects
      const sourceNodeByIndex = sourceNodeEntry ? (sourceNodeEntry[1] as any) : null;
      const targetNodeByIndex = targetNodeEntry ? (targetNodeEntry[1] as any) : null;
      
      const conversionRate = sourceNodeByIndex && targetNodeByIndex && sourceNodeByIndex.value > 0
        ? (targetNodeByIndex.value / sourceNodeByIndex.value) * 100
        : 0;
      
      const dropOffRate = 100 - conversionRate;
      const dropOffValue = sourceNodeByIndex && targetNodeByIndex
        ? sourceNodeByIndex.value - targetNodeByIndex.value
        : 0;
        
      const conversionCategory = getConversionCategory(conversionRate);
      
      const handleClickUsers = () => {
        if (!resolvedFunnelId) return;
        navigate(`/funnels/${resolvedFunnelId}/users?type=link&sourceId=${encodeURIComponent(sourceId)}&targetId=${encodeURIComponent(targetId)}&value=${encodeURIComponent(data.value || 0)}`);
      };
      
      return (
        <div className="text-sm min-w-[320px]">
          <div className="rounded-xl border border-gray-200 shadow-lg bg-white/95 backdrop-blur p-6">
            <div className="font-semibold mb-3 pb-2 border-b border-gray-100 text-base flex items-center justify-between">
              <span>Connection Details</span>
              <span className={`text-sm px-2.5 py-1 rounded-md ${conversionCategory.color} bg-opacity-20 bg-current`}>
                {conversionCategory.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-1 text-[15px]">
              <div className="text-gray-600">From Step:</div>
              <div className="font-medium text-slate-800">{stripOptionalTag(sourceNodeByIndex?.name) || "Unknown"}</div>
              <div className="text-gray-600">To Step:</div>
              <div className="font-medium text-slate-800">{stripOptionalTag(targetNodeByIndex?.name) || "Unknown"}</div>
            </div>

            {/* Metrics section */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-600">Users:</div>
                <button onClick={handleClickUsers} className="font-semibold text-blue-600 hover:underline cursor-pointer text-[15px]">
                  {data.value?.toLocaleString() || "0"}
                </button>
              </div>

              {/* Drop-off severity */}
              {(() => {
                const sev = getDropoffSeverity(dropOffRate);
                return (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-gray-600">Drop-off:</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 text-[15px]">{dropOffValue.toLocaleString()} users ({formatPercent(dropOffRate)})</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${sev.badge}`}>{sev.label}</span>
                    </div>
                  </div>
                );
              })()}
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
    
    const handleClickUsers = () => {
      if (!resolvedFunnelId) return;
      navigate(`/funnels/${resolvedFunnelId}/users?type=link&sourceId=${encodeURIComponent(sourceId)}&targetId=${encodeURIComponent(targetId)}&value=${encodeURIComponent(data.value || 0)}`);
    };
    
    return (
      <div className="text-sm min-w-[320px]">
        <div className="rounded-xl border border-gray-200 shadow-lg bg-white/95 backdrop-blur p-6">
          <div className="font-semibold mb-3 pb-2 border-b border-gray-100 text-base flex items-center justify-between">
            <span>Connection Details</span>
            <span className={`text-sm px-2.5 py-1 rounded-md ${conversionCategory.color} bg-opacity-20 bg-current`}>
              {conversionCategory.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-1 text-[15px]">
            <div className="text-gray-600">From Step:</div>
            <div className="font-medium text-slate-800">{stripOptionalTag(sourceNode?.name) || "Unknown"}</div>
            <div className="text-gray-600">To Step:</div>
            <div className="font-medium text-slate-800">{stripOptionalTag(targetNode?.name) || "Unknown"}</div>
          </div>

          {/* Metrics section */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-600">Users:</div>
              <button onClick={handleClickUsers} className="font-semibold text-blue-600 hover:underline cursor-pointer text-[15px]">
                {data.value?.toLocaleString() || "0"}
              </button>
            </div>

            {(() => {
              const sev = getDropoffSeverity(dropOffRate);
              return (
                <div className="flex items-center justify-between mt-2">
                  <div className="text-gray-600">Drop-off:</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 text-[15px]">{dropOffValue.toLocaleString()} users ({formatPercent(dropOffRate)})</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${sev.badge}`}>{sev.label}</span>
                  </div>
                </div>
              );
            })()}
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
        ([_, n]: [string, any]) => (n as any).step === data.index
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
    
    const handleClickUsers = () => {
      if (!resolvedFunnelId) return;
      const nodeId = node.id || nodeName;
      navigate(`/funnels/${resolvedFunnelId}/users?type=node&nodeId=${encodeURIComponent(nodeId)}&value=${encodeURIComponent(node.value || 0)}`);
    };
    
    return (
      <div className="text-sm min-w-[340px]">
        <div className="rounded-xl border border-gray-200 shadow-lg bg-white/95 backdrop-blur p-6">
          <div className="font-semibold mb-3 pb-2 border-b border-gray-100 text-base flex items-center justify-between">
            <span>{stripOptionalTag(node.name)} {isSplitStep ? '(Split)' : ''}</span>
            <span className={`text-sm px-2.5 py-1 rounded-md ${conversionCategory.color} bg-opacity-20 bg-current`}>
              {conversionCategory.label}
            </span>
          </div>

          {/* Basic Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">Step Users:</div>
            <button onClick={handleClickUsers} className="font-semibold text-blue-600 hover:underline cursor-pointer text-[15px]">
              {node.value.toLocaleString()}
            </button>
          </div>

          {/* Conversion from previous step */}
          <div className="mb-4">
            <div className="text-gray-600 mb-1">From Previous Step:</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{previousNode.name}</span>
              <span className={`font-medium ${conversionCategory.color}`}>{formatPercent(conversionRate)}</span>
            </div>

            {/* Progress bar visualization */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${conversionCategory.color} bg-current`}
                style={{ width: `${Math.min(100, Math.max(0, conversionRate))}%` }}
              ></div>
            </div>

            {/* Drop-off details */}
            {dropOffValue > 0 && (
              <div className="flex justify-between items-center mt-2 text-gray-600 text-sm">
                <span>Drop-off: {dropOffValue.toLocaleString()} users</span>
                <span>({formatPercent(dropOffRate)})</span>
              </div>
            )}
          </div>

          {/* Overall funnel position */}
          <div className="pt-3 mt-2 border-t border-gray-100">
            <div className="text-gray-600 mb-1">Overall Funnel Position:</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">From Funnel Start</span>
              <span className={`font-semibold ${getOverallConversionColor(overallConversion)}`}>{formatPercent(overallConversion)}</span>
            </div>

            {/* Overall progress bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(100, Math.max(0, overallConversion))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default SankeyTooltip;
