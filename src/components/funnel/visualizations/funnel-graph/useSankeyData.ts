import { useMemo } from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyData, SankeyNode, SankeyLink } from "./types";

export const useSankeyData = (enabledSteps: FunnelStep[], initialValue: number): SankeyData => {
  return useMemo(() => {
    if (enabledSteps.length === 0) return { nodes: [], links: [] };
    
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
              y: 0,
              width: 0,
              height: 0
            });
          }
        });
      }
      
      previousValue = currentValue;
    });
    
    // Prepare links data
    const links: SankeyLink[] = [];
    previousValue = initialValue;
    
    // Create links between nodes
    for (let i = 0; i < enabledSteps.length; i++) {
      const currentStep = enabledSteps[i];
      const currentValue = currentStep.value || 0;
      
      // Add link from previous step to current step
      if (i === 0) {
        // This is the first step, link from initialValue
        links.push({
          source: "initial",
          target: `step-${i}`,
          value: currentValue,
          sourceValue: initialValue, // Add source value for percentage calculation
          path: "", // Will be calculated later
          color: nodes[i].color + "90", // Add transparency
          sourceColor: "#9b87f5" + "90", // Color for initial node
          targetColor: nodes[i].color + "90", // Add target color for gradient
          labelPercentage: `${((currentValue / initialValue) * 100).toFixed(1)}%` // Add formatted percentage
        });
      } else {
        const prevStep = enabledSteps[i - 1];
        const prevValue = prevStep.value || 0;
        
        // Skip links from zero value nodes
        if (prevValue === 0) {
          // Use continue to skip to the next iteration
          continue;
        }
        
        // Check for zero or undefined values to avoid NaN
        const percentage = prevValue > 0 ? ((currentValue / prevValue) * 100) : 0;
        // Format percentage safely
        const formattedPercentage = isNaN(percentage) ? "0.0" : percentage.toFixed(1);
        
        links.push({
          source: `step-${i - 1}`,
          target: `step-${i}`,
          value: currentValue,
          sourceValue: prevValue, // Add source value for percentage calculation
          path: "", 
          color: nodes[i].color + "90",
          labelValue: `${currentValue.toLocaleString()}`,
          labelPercentage: `${formattedPercentage}%`,
          // Add source and target colors for gradient
          sourceColor: nodes[i-1].color + "90",
          targetColor: nodes[i].color + "90"
        });
        
        // Handle links from previous step splits to current step if they exist
        // Add null check for prevStep.split
        if (prevStep.split && prevStep.split.length > 0) {
          prevStep.split.forEach((splitStep, splitIndex) => {
            // Link from each split to the current step
            const splitValue = splitStep.value || 0;
            if (splitValue > 0) {
              const splitPercentage = prevValue > 0 ? ((splitValue / prevValue) * 100) : 0;
              const formattedSplitPercentage = isNaN(splitPercentage) ? "0.0" : splitPercentage.toFixed(1);
              
              const sourceNode = nodes.find(n => n.id === `step-${i-1}-split-${splitIndex}`);
              if (sourceNode) {
                links.push({
                  source: `step-${i-1}-split-${splitIndex}`,
                  target: `step-${i}`,
                  value: splitValue,
                  sourceValue: splitValue, // Use the split value as source for percentage
                  path: "",
                  color: (sourceNode?.color || "#cccccc") + "90",
                  labelValue: `${splitValue.toLocaleString()}`,
                  labelPercentage: `${formattedSplitPercentage}%`,
                  sourceColor: (sourceNode?.color || "#cccccc") + "90",
                  targetColor: nodes[i].color + "90"
                });
              }
            }
          });
        }
      }
      
      // Handle splits if they exist for the current step
      // Add null check for currentStep.split
      if (currentStep.split && currentStep.split.length > 0) {
        currentStep.split.forEach((splitStep, splitIndex) => {
          const splitValue = splitStep.value || 0;
          
          // Skip links to zero value nodes - fixed to properly scope the continue
          if (currentValue === 0) {
            return; // Use return in forEach instead of continue
          }
          
          // Check for zero or undefined values to avoid NaN
          const splitPercentage = currentValue > 0 ? ((splitValue / currentValue) * 100) : 0;
          // Format percentage safely
          const formattedSplitPercentage = isNaN(splitPercentage) ? "0.0" : splitPercentage.toFixed(1);
          
          const targetNode = nodes.find(n => n.id === `step-${i}-split-${splitIndex}`);
          
          links.push({
            source: `step-${i}`,
            target: `step-${i}-split-${splitIndex}`,
            value: splitValue,
            sourceValue: currentValue, // Add source value for percentage calculation
            path: "",
            color: (targetNode?.color || "#cccccc") + "90",
            labelValue: `${splitValue.toLocaleString()}`,
            labelPercentage: `${formattedSplitPercentage}%`,
            // Add source and target colors for gradient
            sourceColor: nodes[i].color + "90",
            targetColor: (targetNode?.color || "#cccccc") + "90"
          });
        });
      }
      
      previousValue = currentValue;
    }
    
    console.log("Generated Sankey data:", { nodes, links });
    return { nodes, links };
  }, [enabledSteps, initialValue]);
};

export default useSankeyData;
