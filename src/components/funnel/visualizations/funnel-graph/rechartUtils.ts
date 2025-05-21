
import { FunnelStep } from "@/types/funnel";
import { SankeyNode, SankeyLink } from "./types";

// Interface for the Sankey data
interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export function prepareSankeyData(steps: FunnelStep[], initialValue: number) {
  // Prepare step data for the sankey chart
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeMap: Record<string, SankeyNode> = {};
  
  if (!steps || steps.length === 0) {
    return { data: { nodes, links }, nodeMap };
  }
  
  let previousStep: FunnelStep | null = null;
  let previousValue = initialValue;
  
  // Define colors for different steps
  const nodeColors = [
    "#9b87f5", // Purple
    "#7E69AB", // Secondary purple
    "#0EA5E9", // Ocean blue
    "#F97316", // Bright orange
    "#8B5CF6", // Vivid purple
    "#33C3F0", // Sky blue
  ];
  
  // Add an initial node for the starting value
  const initialNode: SankeyNode = {
    id: "initial",
    name: "Initial Users",
    value: initialValue,
    color: nodeColors[0],
    x: 0,
    y: 0,
    width: 10,
    height: 10
  };
  
  nodes.push(initialNode);
  nodeMap["initial"] = initialNode;
  
  // Process each step in the funnel
  steps.forEach((step, index) => {
    if (!step) return;
    
    const stepValue = step.value || 0;
    const stepId = `step-${index}`;
    const stepNode: SankeyNode = {
      id: stepId,
      name: `${step.name}`,
      value: stepValue,
      color: nodeColors[(index + 1) % nodeColors.length],
      x: 0,
      y: 0,
      width: 10,
      height: 10
    };
    
    nodes.push(stepNode);
    nodeMap[stepId] = stepNode;
    
    // Create link from previous step or initial value
    const sourceId = previousStep ? `step-${index - 1}` : "initial";
    
    links.push({
      source: sourceId,
      target: stepId,
      value: stepValue,
      path: "",
      color: stepNode.color + "90" // Add some transparency
    });
    
    // Handle split steps if they exist
    if (step.split && Array.isArray(step.split)) {
      step.split.forEach((splitStep, splitIndex) => {
        if (!splitStep) return;
        
        const splitValue = splitStep.value || 0;
        if (splitValue <= 0) return; // Skip splits with no users
        
        const splitId = `split-${index}-${splitIndex}`;
        const splitNode: SankeyNode = {
          id: splitId,
          name: splitStep.name || `Variation ${splitIndex + 1}`,
          value: splitValue,
          color: nodeColors[(index + splitIndex + 2) % nodeColors.length],
          x: 0,
          y: 0,
          width: 10,
          height: 10
        };
        
        nodes.push(splitNode);
        nodeMap[splitId] = splitNode;
        
        // Create link from main step to split
        links.push({
          source: stepId,
          target: splitId,
          value: splitValue,
          path: "",
          color: splitNode.color + "90" // Add some transparency
        });
      });
    }
    
    previousStep = step;
    previousValue = stepValue;
  });
  
  console.log("Prepared Sankey Data:", { nodes, links });
  
  return { 
    data: { nodes, links } as SankeyData,
    nodeMap
  };
}
