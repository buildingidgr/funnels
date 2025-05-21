
import React, { useRef, useEffect, useState } from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyData, SankeyNode as ISankeyNode } from "./types";
import {
  TooltipProvider
} from "@/components/ui/tooltip";
import { useDiagramLayout } from "./useDiagramLayout";
import SankeyRenderer from "./SankeyRenderer";
import useNodeSelection from "./hooks/useNodeSelection";

// Import the CSS module
import styles from "./FunnelGraph.module.css";

interface SankeyDiagramProps {
  sankeyData: SankeyData;
  initialValue: number;
  enabledSteps: FunnelStep[];
}

// This component is now replaced by the Recharts implementation
// but kept for backwards compatibility
const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  sankeyData,
  initialValue,
  enabledSteps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [initialNode, setInitialNode] = useState<ISankeyNode | null>(null);
  
  // Use the layout hook to calculate positions
  const { calculateLayout } = useDiagramLayout({
    containerRef,
    svgRef, 
    sankeyData,
    initialValue
  });
  
  // Calculate layout when data changes or on resize
  useEffect(() => {
    const result = calculateLayout();
    if (result) {
      setInitialNode(result.initialNode);
    }
    
    // Add resize listener
    const handleResize = () => {
      const result = calculateLayout();
      if (result) {
        setInitialNode(result.initialNode);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateLayout, sankeyData, enabledSteps, initialValue]);
  
  return (
    <TooltipProvider>
      <div className="w-full h-full relative" ref={containerRef}>
        <svg 
          ref={svgRef} 
          className={styles.sankeyDiagram}
          style={{ transition: "all 0.3s ease" }}
        ></svg>
        
        {/* Render the Sankey diagram */}
        {initialNode && (
          <SankeyRenderer
            svgRef={svgRef}
            sankeyData={sankeyData}
            initialNode={initialNode}
            enabledSteps={enabledSteps}
            initialValue={initialValue}
            styles={styles}
          />
        )}
        
        {/* This is a portal container for tooltips to ensure they're above SVG */}
        <div id="tooltip-container" className={styles.tooltipContainer}></div>
      </div>
    </TooltipProvider>
  );
};

export default SankeyDiagram;
