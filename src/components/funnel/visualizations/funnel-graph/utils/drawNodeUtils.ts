import { SankeyNode } from "../types";
import { FunnelStep } from "@/types/funnel";
import { getStepDetails } from "./stepUtils";
import { highlightConnectedPaths } from "./connectionUtils";

/**
 * Draw a node in the Sankey diagram
 */
export const drawNode = (
  group: SVGElement, 
  node: SankeyNode, 
  steps: FunnelStep[], 
  initialValue: number,
  styles: Record<string, string>
) => {
  // Create node with SankeyNode component
  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.setAttribute("class", `${styles.sankeyNodeGroup || ''}`);
  nodeGroup.setAttribute("data-node-id", node.id);
  group.appendChild(nodeGroup);
  
  // Draw node rectangle with rounded corners and subtle shadow
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", node.x.toString());
  rect.setAttribute("y", node.y.toString());
  rect.setAttribute("width", node.width.toString());
  rect.setAttribute("height", node.height.toString());
  rect.setAttribute("fill", node.color);
  rect.setAttribute("rx", "2"); // Slightly rounder corners
  rect.setAttribute("ry", "2");
  rect.setAttribute("class", `${styles.sankeyNode || ''}`);
  rect.setAttribute("cursor", "pointer");
  rect.setAttribute("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.07))"); // Subtle shadow
  rect.setAttribute("style", "transition: opacity 0.25s, transform 0.25s");
  
  // Add hover effect and tooltip trigger
  rect.addEventListener("mouseenter", () => {
    rect.setAttribute("opacity", "0.85");
    rect.setAttribute("transform", "scale(1.01)");
    const tooltipDiv = document.getElementById(`tooltip-${node.id}`);
    if (tooltipDiv) {
      tooltipDiv.style.display = "block";
    }
    
    // Highlight connected paths
    if (group.ownerSVGElement) {
      const mainGroup = group.ownerSVGElement.querySelector('g');
      if (mainGroup) {
        highlightConnectedPaths(mainGroup, node.id, true, styles);
      }
    }
  });
  
  rect.addEventListener("mouseleave", () => {
    rect.setAttribute("opacity", "1");
    rect.setAttribute("transform", "scale(1)");
    const tooltipDiv = document.getElementById(`tooltip-${node.id}`);
    if (tooltipDiv) {
      tooltipDiv.style.display = "none";
    }
    
    // Reset highlights
    if (group.ownerSVGElement) {
      const mainGroup = group.ownerSVGElement.querySelector('g');
      if (mainGroup) {
        highlightConnectedPaths(mainGroup, node.id, false, styles);
      }
    }
  });
  
  nodeGroup.appendChild(rect);
  
  // Add node name with smaller font
  const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  nameText.setAttribute("x", (node.x + (node.width / 2)).toString());
  nameText.setAttribute("y", (node.y + 9).toString()); // Positioned higher up
  nameText.setAttribute("text-anchor", "middle");
  nameText.setAttribute("fill", "white");
  nameText.setAttribute("font-size", "6"); // Smaller font
  nameText.setAttribute("font-weight", "bold");
  nameText.setAttribute("pointer-events", "none");
  nameText.textContent = truncateText(node.name, 10); // Shorter truncation for cleaner text
  nodeGroup.appendChild(nameText);
  
  // Add node value with smaller font
  const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  valueText.setAttribute("x", (node.x + (node.width / 2)).toString());
  valueText.setAttribute("y", (node.y + 18).toString()); // Positioned closer to name
  valueText.setAttribute("text-anchor", "middle");
  valueText.setAttribute("fill", "white");
  valueText.setAttribute("font-size", "5"); // Smaller font
  valueText.setAttribute("pointer-events", "none");
  valueText.textContent = formatNumber(node.value); // Format number for better readability
  nodeGroup.appendChild(valueText);
  
  // Create tooltip (using portal and absolute positioning for better z-index handling)
  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("x", (node.x + node.width + 5).toString());
  foreignObject.setAttribute("y", node.y.toString());
  foreignObject.setAttribute("width", "220");
  foreignObject.setAttribute("height", "180");
  foreignObject.setAttribute("style", "pointer-events: none; z-index: 1000;");
  
  // Create HTML tooltip content
  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = `tooltip-${node.id}`;
  tooltipDiv.className = `bg-white p-3 rounded-lg shadow-md border border-gray-100 text-xs z-50 ${styles.tooltip || ''}`;
  tooltipDiv.style.display = "none";
  tooltipDiv.style.position = "absolute";
  tooltipDiv.style.zIndex = "9999";
  
  // Generate step details
  const stepDetails = getStepDetails(node, steps, initialValue);
  
  // Extract step number for enhanced tooltip
  let stepNumber = "";
  let stepType = "";
  
  if (node.id === "initial") {
    stepType = "Initial";
  } else {
    const idParts = node.id.split('-');
    if (idParts.length >= 2) {
      const stepIndex = parseInt(idParts[1]);
      if (stepIndex >= 0 && stepIndex < steps.length) {
        stepNumber = `Step ${steps[stepIndex].order}: `;
        
        // Check if this is a split
        if (idParts.length > 2 && idParts[2] === 'split') {
          stepType = "Split Variation";
        } else {
          stepType = "Main Step";
        }
      }
    }
  }
  
  // Populate tooltip content with improved design
  tooltipDiv.innerHTML = `
    <div class="font-semibold mb-2 pb-1 border-b border-gray-100">
      ${stepNumber}${stepDetails.name}
      ${stepType ? `<span class="text-[9px] font-normal ml-1 text-gray-500">(${stepType})</span>` : ''}
    </div>
    <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
      <div class="text-gray-500">Total Users:</div>
      <div class="font-medium">${stepDetails.value.toLocaleString()}</div>
      
      <div class="text-gray-500">Conversion Rate:</div>
      <div class="font-medium">${stepDetails.percentage.toFixed(1)}%</div>
      
      <div class="text-gray-500">Previous Step:</div>
      <div class="font-medium">${stepDetails.previousValue.toLocaleString()}</div>
      
      <div class="text-gray-500">Drop-off:</div>
      <div class="font-medium">${stepDetails.dropOff.toLocaleString()} users</div>
    </div>
  `;
  
  foreignObject.appendChild(tooltipDiv);
  nodeGroup.appendChild(foreignObject);
};

// Helper function to format numbers with K/M suffixes for better readability
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

// Helper function to truncate text if too long
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + '..';
}
