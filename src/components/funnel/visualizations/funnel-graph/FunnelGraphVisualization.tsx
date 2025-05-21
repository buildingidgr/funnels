import React, { useRef, useState, useEffect } from "react";
import { FunnelStep } from "@/types/funnel";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import our components
import StepLabels from "./components/StepLabels";
import EmptyState from "./components/EmptyState";
import SankeyVisualization from "./components/SankeyVisualization";
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
  const [showTooltips, setShowTooltips] = useState(true);
  
  // Add a flag to disable tooltips entirely if users experience issues
  const [interactiveTooltips, setInteractiveTooltips] = useState(true);

  // Debug log render
  useEffect(() => {
    console.log("[DEBUG] FunnelGraphVisualization rendered with:", {
      steps: steps.length,
      initialValue,
      hasActiveSplits: steps.some(step => step.split && step.split.length > 0),
      tooltipsEnabled: showTooltips,
      tooltipsInteractive: interactiveTooltips
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
      hasSplits: enabledSteps.some(step => step.split && step.split.length > 0)
    });
  }, [rechartsData, enabledSteps]);

  // Handle empty data case gracefully
  if (!hasSufficientData) {
    return <EmptyState message="Insufficient data available for visualization" />;
  }

  // If no valid links, show message
  if (!hasValidLinks) {
    return <EmptyState message="No valid connections between funnel steps" />;
  }

  // Handle node hover/click events with better data extraction
  const handleNodeMouseEnter = (e: React.MouseEvent<SVGRectElement>) => {
    if (!showTooltips) return;
    
    const target = e.currentTarget;
    const nodeId = target.getAttribute('data-node-id');
    
    // If the node ID is not directly on the target, try to get it from the parent
    // but handle the type conversion properly
    const parentNodeId = !nodeId && target.parentElement ? 
      ((target.parentElement as unknown) as Element)?.getAttribute('data-node-id') : 
      null;
    
    const effectiveNodeId = nodeId || parentNodeId;
    
    if (effectiveNodeId) {
      // Pass the SVG element to the handler
      const svgElement = svgRef.current;
      handleNodeHover(svgElement, effectiveNodeId, styles);
    }
  };

  const handleNodeMouseLeave = () => {
    if (!showTooltips) return;
    
    if (activeNode) {
      // Pass the SVG element to the handler
      const svgElement = svgRef.current;
      handleNodeLeave(svgElement, activeNode, styles);
    }
  };

  // Handle link hover events
  const handleLinkMouseEnter = (e: React.MouseEvent<SVGPathElement>) => {
    if (!showTooltips) return;
    
    const target = e.currentTarget;
    target.setAttribute('stroke-opacity', '0.6');
    target.setAttribute('stroke-width', (parseFloat(target.getAttribute('stroke-width') || '1') * 1.5).toString());
    
    // Extract source and target to highlight related nodes
    const sourceId = target.getAttribute('data-source');
    const targetId = target.getAttribute('data-target');
  };

  const handleLinkMouseLeave = (e: React.MouseEvent<SVGPathElement>) => {
    if (!showTooltips) return;
    
    const target = e.currentTarget;
    target.setAttribute('stroke-opacity', '0.2');
    target.setAttribute('stroke-width', (parseFloat(target.getAttribute('stroke-width') || '1') / 1.5).toString());
  };

  // Define gradient background class based on overall conversion rate
  const getConversionRateClass = () => {
    if (conversionRate >= 75) return "bg-gradient-to-r from-green-50 to-white";
    if (conversionRate >= 40) return "bg-gradient-to-r from-yellow-50 to-white";
    return "bg-gradient-to-r from-red-50 to-white";
  };

  const toggleTooltips = () => setShowTooltips(!showTooltips);

  // Toggle interactive tooltips
  const toggleInteractiveTooltips = () => setInteractiveTooltips(!interactiveTooltips);

  return (
    <Card className={`w-full h-full overflow-hidden p-4 ${getConversionRateClass()} transition-all duration-300`}>
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Funnel Visualization</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={16} className="text-gray-400" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs p-4">
                <p className="text-xs mb-2">This visualization shows user flow through your funnel steps.</p>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  <li>The colors of connection lines show conversion rates</li>
                  <li>Numbers on lines indicate the percentage of users that continued</li>
                  <li>Dashed lines represent 100% conversion between steps</li>
                  <li>Hover over elements for detailed information</li>
                  <li>If tooltips are unstable, try disabling interactive mode</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <label htmlFor="tooltips" className="text-xs mr-2 text-gray-500">Show Tooltips</label>
              <input
                id="tooltips"
                type="checkbox"
                checked={showTooltips}
                onChange={toggleTooltips}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
            {showTooltips && (
              <div className="flex items-center">
                <label htmlFor="interactive" className="text-xs mr-2 text-gray-500">Interactive</label>
                <input
                  id="interactive"
                  type="checkbox"
                  checked={interactiveTooltips}
                  onChange={toggleInteractiveTooltips}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Render step labels above the chart with proper containment */}
      <div className="px-2 pb-3">
        <StepLabels data={data} enabledSteps={enabledSteps} />
      </div>
      
      {/* Render the Sankey visualization with proper containment */}
      <div className="w-full h-[600px] bg-white rounded-lg p-2 shadow-inner">
        <SankeyVisualization
          rechartsData={rechartsData}
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
      
      {/* Legend */}
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
          <div className="w-8 h-1 border-t-4 border-blue-400"></div>
          <span className="ml-1">Connection Line</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[1px] border-blue-400"></div>
          <span className="ml-1">Low Conversion</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[8px] border-blue-400"></div>
          <span className="ml-1">High Conversion</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-1 border-t-[6px] border-dashed border-blue-400"></div>
          <span className="ml-1">100% Conversion</span>
        </div>
      </div>
    </Card>
  );
};

export default FunnelGraphVisualization;
