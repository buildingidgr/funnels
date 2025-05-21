
import { SankeyNode, SankeyLink } from "../types";
import { drawNode } from "./drawNodeUtils";
import { drawLink } from "./drawLinkUtils";
import { ensureDefsExists } from "./gradientUtils";
import { highlightConnectedPaths } from "./connectionUtils";
import { FunnelStep } from "@/types/funnel";
import { createBackgroundGrid } from "./gridUtils";
import { createColumnLabels } from "./labelUtils";
import { groupNodesByColumn } from "./nodeLayoutUtils";

/**
 * Render all elements of the Sankey diagram
 */
export const renderSankeyDiagram = (
  svg: SVGSVGElement,
  sankeyData: SankeyNode[],
  sankeyLinks: SankeyLink[],
  initialNode: SankeyNode | null,
  enabledSteps: FunnelStep[],
  initialValue: number,
  activeNode: string | null,
  setActiveNode: (id: string | null) => void,
  styles: Record<string, string>
): void => {
  // Clear SVG
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  
  // Add defs section for gradients
  ensureDefsExists(svg);
  
  // Create a group for all elements
  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(mainGroup);
  
  // Add a background grid
  const width = parseInt(svg.getAttribute("width") || "0");
  const height = parseInt(svg.getAttribute("height") || "0");
  createBackgroundGrid(mainGroup, width, height);
  
  // Group nodes by column for better layout
  const nodesByColumn = groupNodesByColumn(sankeyData, initialNode);
  
  // Add column labels at the top
  createColumnLabels(mainGroup, nodesByColumn, initialNode as SankeyNode, enabledSteps);
  
  // IMPORTANT: Draw links first (so they appear behind nodes)
  sankeyLinks.forEach(link => {
    // Store the original width for resetting later
    link.originalWidth = link.width || Math.max(link.value / 60, 0.5);
    drawLink(mainGroup, link, styles);
  });
  
  // Draw initial node
  if (initialNode) {
    drawNode(mainGroup, initialNode, enabledSteps, initialValue, styles);
  }
  
  // Draw nodes
  sankeyData.forEach(node => {
    drawNode(mainGroup, node, enabledSteps, initialValue, styles);
    
    // Add click event to the node group
    const nodeGroup = mainGroup.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeGroup) {
      nodeGroup.addEventListener("click", () => {
        setActiveNode(node.id === activeNode ? null : node.id);
      });
    }
  });
  
  // Highlight active node if any
  if (activeNode) {
    highlightConnectedPaths(mainGroup, activeNode, true, styles);
  }
};

// Re-export the other functions from their respective files
export { createBackgroundGrid } from "./gridUtils";
export { createColumnLabels } from "./labelUtils";
export { groupNodesByColumn } from "./nodeLayoutUtils";
