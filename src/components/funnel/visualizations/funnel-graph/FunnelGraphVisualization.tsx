import React, { useRef, useState, useEffect, useMemo } from "react";
import { FunnelStep } from "@/types/funnel";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import our components
import EmptyState from "./components/EmptyState";
import { SankeyVisualization } from "./SankeyVisualization";
import useSankeyFormatting from "./hooks/useSankeyFormatting";
import useNodeSelection from "./hooks/useNodeSelection";
import useFunnelCalculation from "@/hooks/useFunnelCalculation";

console.log("[DEBUG] Loading FunnelGraphVisualization component");

interface FunnelGraphVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
  lastUpdated?: number;
}

const FunnelGraphVisualization: React.FC<FunnelGraphVisualizationProps> = ({ 
  steps, 
  initialValue,
  lastUpdated
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { activeNode, handleNodeHover, handleNodeLeave, setActiveNode } = useNodeSelection();
  
  // Simplified state management
  const [showTooltips, setShowTooltips] = useState(true);
  const [interactiveTooltips, setInteractiveTooltips] = useState(true);

  // Use the funnel calculation hook to automatically calculate visitor counts
  const { calculatedSteps, isLoading, error } = useFunnelCalculation({
    steps,
    initialValue,
    autoCalculate: true
  });

  // Debug log render
  useEffect(() => {
    console.log("[DEBUG] FunnelGraphVisualization rendered with:", {
      steps: calculatedSteps.length,
      initialValue,
      hasActiveSplits: calculatedSteps.some(step => step.split && step.split.length > 0),
      hasSplitVariations: calculatedSteps.some(step => step.splitVariations && step.splitVariations.length > 0),
      tooltipsEnabled: showTooltips,
      tooltipsInteractive: interactiveTooltips,
      isLoading,
      error,
      stepDetails: calculatedSteps.map(step => ({
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
  }, [calculatedSteps, initialValue, showTooltips, interactiveTooltips, isLoading, error]);
  
  // Use our custom hook to handle data formatting
  const { 
    enabledSteps,
    data, 
    nodeMap, 
    rechartsData,
    hasSufficientData,
    hasValidLinks,
    conversionRate
  } = useSankeyFormatting(calculatedSteps, initialValue, lastUpdated);
  
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
      displayName: (node as { displayName?: string }).displayName,
      value: node.value
    })));
    
    // Create mapping from node ID to index for Recharts
    const nodeIdToIndex: Record<string, number> = {};
    
    // Map all nodes (no initial node needed)
    rechartsData.nodes.forEach((node, index) => {
      // The node.name is actually the ID (like 'step-0', 'step-1', etc.)
      nodeIdToIndex[node.name] = index;
      // Also map by the node's display name if it exists
      if ((node as { displayName?: string }).displayName && (node as { displayName?: string }).displayName !== node.name) {
        nodeIdToIndex[(node as { displayName?: string }).displayName!] = index;
      }
    });

    // Debug the node mapping
    console.log('[DEBUG] Node mapping created:', {
      nodeCount: rechartsData.nodes.length,
      nodeMapping: Object.entries(nodeIdToIndex).map(([key, value]) => ({ key, value })),
      nodes: rechartsData.nodes.map((node, index) => ({
        index,
        name: node.name,
        displayName: (node as { displayName?: string }).displayName,
        value: node.value
      }))
    });

    // Create nodes array (no initial node)
    const allNodes = rechartsData.nodes.map((node, index) => ({
      name: node.name,
      value: node.value || 0,
      color: node.color,
      index: index,
      id: node.name,
      conversionRate: 0,
      displayName: (node as { displayName?: string }).displayName || node.name // Add displayName property
    }));

    const transformedLinks = rechartsData.links.map(link => {
      const sourceIndex = nodeIdToIndex[link.sourceId || ''] || 0;
      const targetIndex = nodeIdToIndex[link.targetId || ''] || 0;
      
      // Debug the link transformation
      console.log('[DEBUG] Link transformation:', {
        sourceId: link.sourceId,
        targetId: link.targetId,
        sourceIndex,
        targetIndex,
        sourceExists: nodeIdToIndex[link.sourceId || ''] !== undefined,
        targetExists: nodeIdToIndex[link.targetId || ''] !== undefined,
        availableKeys: Object.keys(nodeIdToIndex)
      });
      
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
        conversionRate: (link as { conversionRate?: number }).conversionRate || 0,
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
    return <EmptyState message="Add your first step to see the graph" />;
  }

  // Show loading state
  if (isLoading) {
    console.log("[DEBUG] Showing loading state");
    return (
      <div className="relative bg-white rounded-lg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating funnel data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log("[DEBUG] Showing error state:", error);
    return (
      <div className="relative bg-white rounded-lg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 font-medium">Calculation Error</p>
            <p className="text-gray-600 text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no valid links, show message
  if (!hasValidLinks) {
    console.log("[DEBUG] No valid links, showing empty state");
    return <EmptyState message="Add at least two steps to see connections" />;
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

  const handleLinkMouseEnter = (link: { sourceId?: string; targetId?: string; value?: number }) => {
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
    return "bg-gradient-to-r from-gray-50 to-white";
  };

  // Calculate performance insights with proper step names and conversion rates
  console.log('[DEBUG] enabledSteps for performance insights:', enabledSteps.map(step => ({
    id: step.id,
    name: step.name,
    order: step.order,
    value: step.value,
    visitorCount: step.visitorCount
  })));

  // Calculate conversion rates for each step
  const stepConversionRates = enabledSteps.map((step, index) => {
    const currentValue = step.value || step.visitorCount || 0;
    const previousValue = index === 0 ? initialValue : (enabledSteps[index - 1].value || enabledSteps[index - 1].visitorCount || 0);
    const conversionRate = previousValue > 0 ? (currentValue / previousValue) * 100 : 0;
    
    return {
      step,
      conversionRate,
      currentValue,
      previousValue
    };
  });

  console.log('[DEBUG] Step conversion rates:', stepConversionRates.map(s => ({
    name: s.step.name,
    conversionRate: s.conversionRate,
    currentValue: s.currentValue,
    previousValue: s.previousValue
  })));

  const bestPerformingStep = stepConversionRates.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );

  const worstPerformingStep = stepConversionRates.reduce((worst, current) => 
    current.conversionRate < worst.conversionRate ? current : worst
  );

  // Find the last step (final users who completed the flow)
  const lastStep = data.nodes.length > 0 ? data.nodes[data.nodes.length - 1] : null;
  const totalUsers = lastStep ? lastStep.value : 0;
  
  const performanceInsights = {
    totalUsers: totalUsers,
    overallConversion: conversionRate,
    bestPerformingStep: bestPerformingStep.step,
    worstPerformingStep: worstPerformingStep.step,
    bestConversionRate: bestPerformingStep.conversionRate,
    worstConversionRate: worstPerformingStep.conversionRate
  };

  console.log('[DEBUG] Performance insights calculated:', {
    bestPerformingStep: performanceInsights.bestPerformingStep.name,
    worstPerformingStep: performanceInsights.worstPerformingStep.name,
    bestConversionRate: performanceInsights.bestConversionRate,
    worstConversionRate: performanceInsights.worstConversionRate,
    totalUsers: performanceInsights.totalUsers,
    overallConversion: performanceInsights.overallConversion
  });

  return (
    <div 
      key={`funnel-graph-${performanceInsights.bestPerformingStep.name}-${performanceInsights.worstPerformingStep.name}`}
      className="w-full h-full overflow-hidden p-4"
    >
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
          {/* Removed Overall Conversion text and percentage */}
        </div>
      </div>
      

      
      {/* Render the Sankey visualization without an inner panel to avoid double backgrounds */}
      <div className="w-full h-[600px]">
        <SankeyVisualization
          rechartsData={transformedData}
          nodeMap={nodeMap}
          initialValue={initialValue}
          // pass nodes so EnhancedNode can know optional flag
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          rechartsNodes={transformedData.nodes}
          handleNodeMouseEnter={handleNodeMouseEnter}
          handleNodeMouseLeave={handleNodeMouseLeave}
          handleLinkMouseEnter={handleLinkMouseEnter}
          handleLinkMouseLeave={handleLinkMouseLeave}
          showTooltips={showTooltips}
          interactiveTooltips={interactiveTooltips}
          funnelId={enabledSteps?.[0]?.id || (steps as { id?: string })?.[0]?.id}
        />
      </div>
      

      

    </div>
  );
};

export default FunnelGraphVisualization;
