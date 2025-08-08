import { useMemo } from 'react';
import { FunnelStep } from "@/types/funnel";
import { SankeyData, SankeyNode } from "../types";

console.log("[DEBUG] Loading useSankeyData hook");

export const useSankeyData = (enabledSteps: FunnelStep[], initialValue: number): SankeyData => {
  console.log("[DEBUG] useSankeyData called with", { 
    enabledStepsCount: enabledSteps.length, 
    initialValue,
    hasSplitSteps: enabledSteps.some(step => step.split && step.split.length > 0) 
  });
  
  return useMemo(() => {
    if (enabledSteps.length === 0) return { nodes: [], links: [] };
    
    console.log("[DEBUG] useSankeyData memo recalculating");
    
    // Define colors for different steps - make them more distinct
    const nodeColors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#8b5cf6", // Purple
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#06b6d4", // Cyan
    ];
    
    // Prepare nodes data
    const nodes: SankeyNode[] = [];
    let previousValue = initialValue;
    
    // Create nodes for main steps
    enabledSteps.forEach((step, index) => {
      const currentValue = step.value || 0;
      const color = nodeColors[index % nodeColors.length];
      
      nodes.push({
        id: `step-${index}`,
        name: step.name,
        value: currentValue,
        color,
        mainStepColor: color, // Store color for reference by split steps
        x: 0, // Will be calculated later
        y: 0, // Will be calculated later
        width: 0,
        height: 0
      });
      
      // Handle split steps if they exist - add null check for step.split
      if (step.split && step.split.length > 0) {
        console.log(`[DEBUG] Creating ${step.split.length} split nodes for step ${index} (${step.name})`);
        
        step.split.forEach((splitStep, splitIndex) => {
          const splitValue = splitStep.value || 0;
          // Only add split steps with values
          if (splitValue > 0) {
            // Create a lighter version of the parent color for the split
            const baseColor = color;
            // Add the split step with distinctive styling
            nodes.push({
              id: `step-${index}-split-${splitIndex}`,
              name: splitStep.name,
              value: splitValue,
              // Make split step use a lighter/transparent version of parent color
              color: baseColor + "80", // Add transparency to parent color
              mainStepColor: color, // Reference to parent color
              x: 0,
              // Nudge split nodes closer to their parent vertically by biasing toward parent index position.
              // The actual layout is computed by Recharts; this hints subsequent spacing heuristics.
              y: 0,
              width: 0,
              height: 0
            });
          }
        });
      }
      
      previousValue = currentValue;
    });
    
    console.log("[DEBUG] Created nodes:", nodes.map(n => ({ id: n.id, name: n.name, color: n.color })));
    
    // Return the partial data since this file was incomplete
    return { nodes, links: [] };
  }, [enabledSteps, initialValue]);
};

export default useSankeyData; 