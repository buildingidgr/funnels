
import React, { useEffect } from "react";
import { SankeyData, SankeyNode } from "./types";
import { FunnelStep } from "@/types/funnel";
import { renderSankeyDiagram } from "./utils/renderUtils";
import useNodeSelection from "./hooks/useNodeSelection";

interface SankeyRendererProps {
  svgRef: React.RefObject<SVGSVGElement>;
  sankeyData: SankeyData;
  initialNode: SankeyNode | null;
  enabledSteps: FunnelStep[];
  initialValue: number;
  styles: Record<string, string>;
}

const SankeyRenderer: React.FC<SankeyRendererProps> = ({
  svgRef,
  sankeyData,
  initialNode,
  enabledSteps,
  initialValue,
  styles
}) => {
  // Use the new node selection hook
  const { activeNode, setActiveNode } = useNodeSelection();
  
  // Draw the Sankey diagram whenever the data or layout changes
  useEffect(() => {
    if (!svgRef.current || !initialNode) return;
    
    const svg = svgRef.current;
    
    // Render the Sankey diagram with all its elements
    renderSankeyDiagram(
      svg,
      sankeyData.nodes,
      sankeyData.links,
      initialNode,
      enabledSteps,
      initialValue,
      activeNode,
      (id: string | null) => setActiveNode(id, svg, styles),
      styles
    );
    
    // Add console logging for debugging
    console.log("Rendering improved Sankey diagram with:", {
      nodes: sankeyData.nodes.length,
      links: sankeyData.links.length,
      initialNode: initialNode
    });
    
  }, [svgRef, sankeyData, initialNode, enabledSteps, initialValue, activeNode, setActiveNode, styles]);
  
  return null; // This component doesn't render anything directly, it manipulates the SVG ref
};

export default SankeyRenderer;
