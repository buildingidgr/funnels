import React, { useRef, useState, useEffect, useMemo } from "react";
import { FunnelStep } from "@/types/funnel";
import { Card } from "@/components/ui/card";
import { Info, TrendingUp, TrendingDown, Users, Target, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import our components
import StepLabels from "./components/StepLabels";
import EmptyState from "./components/EmptyState";
import { SankeyVisualization } from "./SankeyVisualization";
import useSankeyFormatting from "./hooks/useSankeyFormatting";
import useNodeSelection from "./hooks/useNodeSelection";
import styles from "./FunnelGraph.module.css";

console.log("[DEBUG] Loading FunnelGraphVisualization component");

interface FunnelGraphVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
}

const FunnelGraphVisualization: React.FC<FunnelGraphVisualizationProps> = ({ 
  steps, 
  initialValue 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { activeNode, handleNodeHover, handleNodeLeave, setActiveNode } = useNodeSelection();
  
  // Simplified state management
  const [showTooltips, setShowTooltips] = useState(true);
  const [interactiveTooltips, setInteractiveTooltips] = useState(true);

  // Debug log render
  useEffect(() => {
    console.log("[DEBUG] FunnelGraphVisualization rendered with:", {
      steps: steps.length,
      initialValue,
      hasActiveSplits: steps.some(step => step.split && step.split.length > 0),
      hasSplitVariations: steps.some(step => step.splitVariations && step.splitVariations.length > 0),
      tooltipsEnabled: showTooltips,
      tooltipsInteractive: interactiveTooltips,
      stepDetails: steps.map(step => ({
        name: step.name,
        value: step.value,
        visitorCount: step.visitorCount,
        isEnabled: step.isEnabled,
        isRequired: step.isRequired,
        hasSplit: step.split && step.split.length > 0,
        hasSplitVariations: step.splitVariations && step.splitVariations.length > 0,
        splitCount: step.split?.length || 0,
        splitVariationsCount: step.splitVariations?.length || 0
      }))
    });
  }, [steps, initialValue, showTooltips, interactiveTooltips]);
  
  // Use our custom hook to handle data formatting
  const { 
    enabledSteps,
    data, 
    nodeMap, 
    rechartsData,
    hasSufficientData,
    hasValidLinks,
    conversionRate
  } = useSankeyFormatting(steps, initialValue);
  
  // Debug data after formatting
  useEffect(() => {
    console.log("[DEBUG] After useSankeyFormatting:", {
      nodesCount: rechartsData.nodes.length,
      linksCount: rechartsData.links.length,
      hasSplits: enabledSteps.some(step => step.split && step.split.length > 0),
      hasSufficientData,
      hasValidLinks,
      conversionRate,
      nodeMapKeys: Object.keys(nodeMap),
      rechartsDataNodes: rechartsData.nodes.map(n => ({ name: n.name, value: n.value })),
      rechartsDataLinks: rechartsData.links.map(l => ({ source: l.source, target: l.target, value: l.value }))
    });
  }, [rechartsData, enabledSteps, hasSufficientData, hasValidLinks, conversionRate, nodeMap]);

  // Transform data for SankeyVisualization
  const transformedData = useMemo(() => {
    // Debug logging for rechartsData nodes
    console.log('[DEBUG] rechartsData.nodes:', rechartsData.nodes.map(node => ({
      name: node.name,
      displayName: (node as any).displayName,
      value: node.value
    })));
    
    // Create mapping from node ID to index for Recharts
    const nodeIdToIndex: Record<string, number> = {};
    
    // Map all nodes (no initial node needed)
    rechartsData.nodes.forEach((node, index) => {
      nodeIdToIndex[node.name] = index;
    });

    // Create nodes array (no initial node)
    const allNodes = rechartsData.nodes.map((node, index) => ({
      name: node.name,
      value: node.value || 0,
      color: node.color,
      index: index,
      id: node.name,
      conversionRate: 0,
      displayName: (node as any).displayName || node.name // Add displayName property
    }));

    const transformedLinks = rechartsData.links.map(link => {
      const sourceIndex = nodeIdToIndex[link.sourceId || ''] || 0;
      const targetIndex = nodeIdToIndex[link.targetId || ''] || 0;
      
      // Find the source node to get its value
      const sourceNode = rechartsData.nodes.find(n => n.name === link.sourceId);
      const sourceValue = sourceNode?.value || link.value || 0;
      
      // Debug logging for split steps
      if (link.sourceId?.includes('split') || link.targetId?.includes('split')) {
        console.log('[DEBUG] Split link processing:', {
          sourceId: link.sourceId,
          targetId: link.targetId,
          sourceNode: sourceNode?.name,
          sourceValue: sourceValue,
          linkValue: link.value,
          percentage: sourceValue > 0 ? ((link.value || 0) / sourceValue * 100).toFixed(1) + '%' : '0%'
        });
      }
      
      // Debug logging for all links to see the data structure
      console.log('[DEBUG] Link data being passed to Sankey:', {
        sourceId: link.sourceId,
        targetId: link.targetId,
        sourceValue: sourceValue,
        linkValue: link.value,
        percentage: sourceValue > 0 ? ((link.value || 0) / sourceValue * 100).toFixed(1) + '%' : '0%',
        isSplit: link.sourceId?.includes('split') || link.targetId?.includes('split')
      });
      
      return {
        source: sourceIndex,
        target: targetIndex,
        value: link.value || 0,
        sourceId: link.sourceId || '',
        targetId: link.targetId || '',
        conversionRate: (link as any).conversionRate || 0,
        sourceValue: sourceValue,
        color: '#3b82f6'
      };
    });

    console.log('[DEBUG] Transformed data for Sankey:', {
      nodesCount: allNodes.length,
      linksCount: transformedLinks.length,
      nodeMapping: nodeIdToIndex,
      nodes: allNodes.map(n => ({ name: n.name, index: n.index })),
      links: transformedLinks.map(l => ({ 
        source: l.source, 
        target: l.target, 
        sourceId: l.sourceId, 
        targetId: l.targetId 
      })),
      // Add detailed debugging
      nodeMappingDetails: Object.entries(nodeIdToIndex).map(([id, index]) => ({ id, index })),
      linkDetails: transformedLinks.map(l => ({
        source: l.source,
        target: l.target,
        sourceId: l.sourceId,
        targetId: l.targetId,
        sourceExists: nodeIdToIndex[l.sourceId || ''] !== undefined,
        targetExists: nodeIdToIndex[l.targetId || ''] !== undefined
      }))
    });

    // Add a separate simple log for debugging
    console.log('[DEBUG] Node mapping:', Object.entries(nodeIdToIndex));
    console.log('[DEBUG] Links with indices:', transformedLinks.map(l => ({
      sourceId: l.sourceId,
      targetId: l.targetId,
      sourceIndex: l.source,
      targetIndex: l.target
    })));

    return {
      nodes: allNodes,
      links: transformedLinks
    };
  }, [rechartsData, initialValue]);

  // Handle empty data case gracefully
  if (!hasSufficientData) {
    console.log("[DEBUG] No sufficient data, showing empty state");
    return <EmptyState message="Insufficient data available for visualization" />;
  }

  // If no valid links, show message
  if (!hasValidLinks) {
    console.log("[DEBUG] No valid links, showing empty state");
    return <EmptyState message="No valid connections between funnel steps" />;
  }

  console.log("[DEBUG] Rendering funnel graph visualization");

  // Handle node hover/click events with better data extraction
  const handleNodeMouseEnter = (nodeId: string) => {
    if (!showTooltips) return;
    console.log("[DEBUG] Node hover:", nodeId);
    setActiveNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    if (!showTooltips) return;
    console.log("[DEBUG] Node leave");
    setActiveNode(null);
  };

  const handleLinkMouseEnter = (link: any) => {
    if (!showTooltips) return;
    console.log("[DEBUG] Link hover:", link);
  };

  const handleLinkMouseLeave = () => {
    if (!showTooltips) return;
    console.log("[DEBUG] Link leave");
  };

  // Define gradient background class based on overall conversion rate
  const getConversionRateClass = () => {
    if (conversionRate >= 75) return "bg-gradient-to-r from-green-50 to-white";
    if (conversionRate >= 40) return "bg-gradient-to-r from-yellow-50 to-white";
    return "bg-gradient-to-r from-red-50 to-white";
  };

  // Calculate performance insights
  const performanceInsights = {
    totalUsers: data.nodes.reduce((sum, node) => sum + node.value, 0),
    overallConversion: conversionRate,
    bestPerformingStep: enabledSteps.reduce((best, current) => {
      const currentRate = current.value && current.visitorCount ? 
        (current.value / current.visitorCount) * 100 : 0;
      const bestRate = best.value && best.visitorCount ? 
        (best.value / best.visitorCount) * 100 : 0;
      return currentRate > bestRate ? current : best;
    }),
    worstPerformingStep: enabledSteps.reduce((worst, current) => {
      const currentRate = current.value && current.visitorCount ? 
        (current.value / current.visitorCount) * 100 : 0;
      const worstRate = worst.value && worst.visitorCount ? 
        (worst.value / worst.visitorCount) * 100 : 0;
      return currentRate < worstRate ? current : worst;
    })
  };

  return (
    <div className={`w-full h-full overflow-hidden p-4 ${getConversionRateClass()} transition-all duration-300`}>
      {/* Header with enhanced controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">Funnel Visualization</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={16} className="text-gray-400" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs p-4">
                <p className="text-xs mb-2">Enhanced funnel visualization with performance insights.</p>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  <li>Interactive performance indicators</li>
                  <li>Real-time conversion rate analysis</li>
                  <li>Detailed tooltips with metrics</li>
                  <li>Color-coded performance indicators</li>
                  <li>Animated flow visualization</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Performance Summary */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Overall Conversion:</span> 
            <span className={`ml-1 font-bold ${
              conversionRate >= 75 ? "text-green-600" : 
              conversionRate >= 40 ? "text-yellow-600" : 
              "text-red-600"
            }`}>
              {conversionRate.toFixed(1)}%
            </span>
          </div>
          
          {/* Quick Performance Indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Best: {performanceInsights.bestPerformingStep.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">Needs: {performanceInsights.worstPerformingStep.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render step labels above the chart with proper containment */}
      <div className="px-2 pb-3">
        <StepLabels data={data} enabledSteps={enabledSteps} />
      </div>
      
      {/* Render the Sankey visualization with proper containment */}
      <div className="w-full h-[600px] bg-white rounded-lg p-2 shadow-sm">
        <SankeyVisualization
          rechartsData={transformedData}
          nodeMap={nodeMap}
          initialValue={initialValue}
          handleNodeMouseEnter={handleNodeMouseEnter}
          handleNodeMouseLeave={handleNodeMouseLeave}
          handleLinkMouseEnter={handleLinkMouseEnter}
          handleLinkMouseLeave={handleLinkMouseLeave}
          showTooltips={showTooltips}
          interactiveTooltips={interactiveTooltips}
        />
      </div>
      
      {/* Enhanced Legend with Performance Context */}
      <div className="flex flex-wrap justify-center mt-4 gap-x-6 gap-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-8 h-3 rounded-sm flex items-center" style={{ backgroundColor: "#3b82f6" }}></div>
          <span className="ml-1">Step 1</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-3 rounded-sm flex items-center" style={{ backgroundColor: "#10b981" }}></div>
          <span className="ml-1">Step 2</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-3 rounded-sm flex items-center" style={{ backgroundColor: "#8b5cf6" }}></div>
          <span className="ml-1">Step 3</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-3 rounded-sm flex items-center" style={{ backgroundColor: "#f59e0b" }}></div>
          <span className="ml-1">Step 4</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-4 border-green-500"></div>
          <span className="ml-1">High Conversion</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[1px] border-red-500"></div>
          <span className="ml-1">Low Conversion</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[6px] border-dashed border-blue-400"></div>
          <span className="ml-1">Split Flow</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[4px] border-yellow-500"></div>
          <span className="ml-1">Medium Conversion</span>
        </div>
      </div>
      
      {/* Performance Insights Footer */}
      <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium text-gray-700">Total Users</div>
              <div className="text-lg font-bold text-blue-800">{performanceInsights.totalUsers.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium text-gray-700">Best Performing</div>
              <div className="text-sm font-bold text-green-800">{performanceInsights.bestPerformingStep.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div>
              <div className="font-medium text-gray-700">Needs Attention</div>
              <div className="text-sm font-bold text-red-800">{performanceInsights.worstPerformingStep.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelGraphVisualization;
