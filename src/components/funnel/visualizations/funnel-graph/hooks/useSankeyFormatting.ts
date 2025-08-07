import { useMemo } from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyNode, RechartsSankeyData } from "../types";
import useSankeyDataRoot from "../useSankeyData"; // Import the root implementation

console.log("[DEBUG] Loading useSankeyFormatting hook");

export default function useSankeyFormatting(steps: FunnelStep[], initialValue: number, lastUpdated?: number) {
  console.log("[DEBUG] useSankeyFormatting called with:", { 
    stepsCount: steps.length,
    initialValue,
    hasSplits: steps.some(step => step.split && step.split.length > 0)
  });

  // Use the root useSankeyData implementation to generate the initial data outside useMemo
  // This follows React hooks rules - hooks must be called at the top level
  const sankeyData = useSankeyDataRoot(steps.filter(step => step.isEnabled), initialValue, lastUpdated);

  return useMemo(() => {
    console.log("[DEBUG] useSankeyFormatting memo recalculating");
    
    // Filter to only enabled steps
    const enabledSteps = steps.filter(step => step.isEnabled);
    
    // Return early if there's not enough data
    if (enabledSteps.length === 0) {
      return {
        enabledSteps,
        data: { nodes: [], links: [] },
        nodeMap: {},
        rechartsData: { nodes: [], links: [] },
        hasSufficientData: false,
        hasValidLinks: false,
        conversionRate: 0,
      };
    }

    console.log("[DEBUG] Root useSankeyData generated:", {
      nodes: sankeyData.nodes.length,
      links: sankeyData.links.length,
      splitNodes: sankeyData.nodes.filter(n => n.id.includes('split')).length
    });
    
    // Create a node map for easy lookup
    const nodeMap: Record<string, SankeyNode> = {};
    sankeyData.nodes.forEach(node => {
      nodeMap[node.id] = node;
      nodeMap[node.name] = node; // Also map by name for easier lookup
    });
    
    // Debug logging for nodeMap creation
    console.log("[DEBUG] NodeMap creation:", {
      nodeMapKeys: Object.keys(nodeMap),
      nodeMapEntries: Object.entries(nodeMap).map(([key, node]) => ({
        key,
        nodeId: node.id,
        nodeName: node.name
      }))
    });

    // Format for recharts (using indices for source and target)
    // Create mapping from node ID to index (for links) and node name to index (for nodes)
    const nodeIdToIndex: Record<string, number> = {};
    const nodeNameToIndex: Record<string, number> = {};
    sankeyData.nodes.forEach((node, index) => {
      nodeIdToIndex[node.id] = index;
      nodeNameToIndex[node.name] = index;
    });
    
    // Add "initial" node if it's not in the nodeIdToIndex
    if (!nodeIdToIndex.initial && !nodeIdToIndex.entry) {
      nodeIdToIndex.initial = sankeyData.nodes.length;
    }
    
    const rechartsData: RechartsSankeyData = {
      nodes: sankeyData.nodes.map((node, index) => ({
        name: node.id, // Revert back to using node ID for proper link mapping
        value: node.value,
        color: node.color,
        // Add required numerical index that Recharts uses internally
        index,
        // Store the actual step name for display purposes
        displayName: node.name,
      })),
      links: sankeyData.links.map((link) => {
        // Source could be "initial" which isn't in the nodes array
        const sourceIndex = link.source === "initial" ? 
          nodeIdToIndex.initial : nodeIdToIndex[link.source];
        
        return {
          // Use numerical indices for source and target
          source: sourceIndex,
          target: nodeIdToIndex[link.target],
          value: link.value,
          sourceId: link.source,
          targetId: link.target,
          // Pass through additional properties for styling and tooltips
          sourceColor: link.sourceColor,
          targetColor: link.targetColor,
          sourceValue: link.sourceValue, // Add sourceValue for percentage calculations
          conversionRate: link.sourceValue && link.sourceValue > 0 ? 
            (link.value / link.sourceValue) * 100 : undefined
        };
      }),
    };
    
    // Calculate overall conversion rate
    const conversionRate = calculateOverallConversion(enabledSteps, initialValue);
    
    // Only consider valid if we have links
    const hasValidLinks = sankeyData.links.length > 0;

    console.log("[DEBUG] Formatted recharts data:", {
      nodes: rechartsData.nodes.length,
      links: rechartsData.links.length,
      nodeMapping: sankeyData.nodes.map((node, index) => ({ id: node.id, name: node.name, index })),
      linkMapping: rechartsData.links.map(link => ({ 
        source: link.source, 
        target: link.target, 
        sourceId: link.sourceId, 
        targetId: link.targetId,
        value: link.value 
      })),
      rechartsNodes: rechartsData.nodes.map(node => ({ 
        name: node.name, 
        displayName: node.displayName, 
        value: node.value 
      }))
    });

    return {
      enabledSteps,
      data: sankeyData,
      nodeMap,
      rechartsData,
      hasSufficientData: enabledSteps.length > 0,
      hasValidLinks,
      conversionRate,
    };
  }, [steps, initialValue, lastUpdated]); // Added lastUpdated to trigger recalculation when funnel data changes
}

// Helper function to calculate a color based on conversion rate
function getNodeColor(step: FunnelStep, previousStep: { value?: number }) {
  if (!step.value || !previousStep.value || previousStep.value <= 0) {
    return undefined; // Let the visualization component decide color
  }
  
  // We're handling color assignment in the visualization component now
  return undefined;
}

// Function to calculate overall funnel conversion
function calculateOverallConversion(steps: FunnelStep[], initialValue: number): number {
  if (steps.length === 0) return 0;
  
  const lastStep = steps[steps.length - 1];
  
  if (!lastStep.value) return 0;
  return (lastStep.value / initialValue) * 100;
}
