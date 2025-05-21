
import { SankeyLink } from "../types";
import { createGradient, ensureDefsExists } from "./gradientUtils";

/**
 * Draw a path representing a link between nodes
 */
export const drawLink = (
  group: SVGElement, 
  link: SankeyLink,
  styles: Record<string, string>
) => {
  // Get the SVG element from the group
  const svgElement = group.ownerSVGElement;
  if (!svgElement) return;
  
  // Ensure defs exists for gradients
  ensureDefsExists(svgElement);
  
  // Create gradient for the link
  const gradientId = `link-gradient-${link.source}-${link.target}`;
  const sourceColor = link.sourceColor || link.color || "#9b87f5";
  const targetColor = link.targetColor || link.color || "#9b87f5";
  
  createGradient(svgElement, gradientId, sourceColor, targetColor);
  
  // Generate path data based on source and target positions
  const path = link.path || generateLinkPath(link);
  
  // Calculate width based on the percentage
  // Extract percentage from the labelPercentage or default to calculating
  let percentage = 0;
  if (link.labelPercentage) {
    // Extract number from string like "85.5%"
    percentage = parseFloat(link.labelPercentage.replace('%', ''));
  } else if (link.sourceValue && link.value > 0) {
    // Calculate percentage if sourceValue is available
    percentage = (link.value / link.sourceValue) * 100;
  }
  
  console.log(`Link from ${link.source} to ${link.target}: ${percentage}% (value: ${link.value}, sourceValue: ${link.sourceValue})`);
  
  // Scale width based on percentage - minimum 0.5, maximum 12
  const minWidth = 0.5;
  const maxWidth = 12;
  // Use percentage to determine width with more dramatic scaling
  const widthFactor = Math.min(percentage / 100, 1); // 0 to 1
  // Use a power function for more dramatic difference between small and large percentages
  const scaledWidth = minWidth + (Math.pow(widthFactor, 0.7) * (maxWidth - minWidth));
  
  // Create actual visible path
  const linkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  linkPath.setAttribute("d", path);
  linkPath.setAttribute("fill", "none");
  linkPath.setAttribute("stroke", `url(#${gradientId})`);
  linkPath.setAttribute("stroke-width", `${scaledWidth}`);
  linkPath.setAttribute("class", `${styles.sankeyLinkPath || ''}`);
  linkPath.setAttribute("data-source", link.source);
  linkPath.setAttribute("data-target", link.target);
  linkPath.setAttribute("data-original-width", `${scaledWidth}`);
  linkPath.setAttribute("data-percentage", `${percentage.toFixed(1)}%`);
  linkPath.setAttribute("stroke-opacity", "0.3"); // Reduced for cleaner look
  
  group.appendChild(linkPath);
  
  // Add animated flow indicator with smaller width
  const flowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  flowPath.setAttribute("d", path);
  flowPath.setAttribute("fill", "none");
  flowPath.setAttribute("stroke", "rgba(255, 255, 255, 0.3)"); // Reduced for subtler animation
  // Make flow lines proportional to the main path
  flowPath.setAttribute("stroke-width", `${scaledWidth * 0.3}`);
  flowPath.setAttribute("class", `${styles.sankeyLinkFlowPath || ''} ${styles.flowAnimation || ''}`);
  flowPath.setAttribute("data-source", link.source);
  flowPath.setAttribute("data-target", link.target);
  flowPath.setAttribute("data-percentage", `${percentage.toFixed(1)}%`);
  
  group.appendChild(flowPath);
  
  // Create invisible wider path for hover detection with improved width
  const hoverPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  hoverPath.setAttribute("d", path);
  hoverPath.setAttribute("stroke", "transparent");
  // Increase hover area width for better interaction but proportional to link width
  hoverPath.setAttribute("stroke-width", `${Math.max(scaledWidth + 10, 15)}`);
  hoverPath.setAttribute("fill", "none");
  hoverPath.setAttribute("class", `${styles.sankeyLinkHoverPath || ''}`);
  hoverPath.setAttribute("data-source", link.source);
  hoverPath.setAttribute("data-target", link.target);
  hoverPath.setAttribute("data-percentage", `${percentage.toFixed(1)}%`);
  hoverPath.setAttribute("cursor", "pointer");
  
  // Add hover effects with stronger visual feedback
  hoverPath.addEventListener("mouseenter", () => {
    linkPath.setAttribute("stroke-width", `${scaledWidth * 1.5}`);
    linkPath.setAttribute("stroke-opacity", "0.6");
    flowPath.setAttribute("stroke-width", `${(scaledWidth * 1.5) * 0.3}`);
    flowPath.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
    
    // Add a subtle glow effect
    linkPath.setAttribute("filter", "drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))");
    
    // Show percentage in console for debugging
    console.log(`Hover on link: ${link.source} → ${link.target}: ${percentage.toFixed(1)}%`);
  });
  
  hoverPath.addEventListener("mouseleave", () => {
    linkPath.setAttribute("stroke-width", `${scaledWidth}`);
    linkPath.setAttribute("stroke-opacity", "0.3");
    flowPath.setAttribute("stroke-width", `${scaledWidth * 0.3}`);
    flowPath.setAttribute("stroke", "rgba(255, 255, 255, 0.3)");
    
    // Remove the glow effect
    linkPath.setAttribute("filter", "none");
  });
  
  group.appendChild(hoverPath);
};

/**
 * Generate the SVG path data for a link
 */
const generateLinkPath = (link: SankeyLink): string => {
  // Use defined positions or calculate defaults
  const sourceX = link.sourceX || 0;
  const sourceY = link.sourceY || 0;
  const sourceWidth = link.sourceWidth || 0;
  const sourceHeight = link.sourceHeight || 0;
  const targetX = link.targetX || 0;
  const targetY = link.targetY || 0;
  const targetHeight = link.targetHeight || 0;
  
  // Calculate start and end points
  const startX = sourceX + sourceWidth;
  const startY = sourceY + sourceHeight / 2;
  const endX = targetX;
  const endY = targetY + targetHeight / 2;
  
  // Calculate distance between nodes
  const distance = endX - startX;
  
  // Control points for bezier curve - adjust curve for better visibility
  const controlPointX1 = startX + (distance * 0.25); // Adjusted for smoother curve
  const controlPointX2 = startX + (distance * 0.75); // Adjusted for smoother curve
  
  return `
    M ${startX} ${startY}
    C ${controlPointX1} ${startY},
      ${controlPointX2} ${endY},
      ${endX} ${endY}
  `;
};
