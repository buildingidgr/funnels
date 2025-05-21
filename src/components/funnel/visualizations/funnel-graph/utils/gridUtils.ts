
import { FunnelStep } from "@/types/funnel";

/**
 * Create the background grid for the Sankey diagram
 */
export const createBackgroundGrid = (
  mainGroup: SVGGElement,
  width: number,
  height: number
): SVGGElement => {
  const gridSize = 20;
  const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gridGroup.setAttribute("class", "grid-background");
  
  // Create subtle horizontal grid lines
  for (let y = gridSize; y < height; y += gridSize) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", y.toString());
    line.setAttribute("x2", width.toString());
    line.setAttribute("y2", y.toString());
    line.setAttribute("stroke", "#f5f5f5");
    line.setAttribute("stroke-width", "0.5");
    gridGroup.appendChild(line);
  }
  
  // Create subtle vertical grid lines
  for (let x = gridSize; x < width; x += gridSize) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x.toString());
    line.setAttribute("y1", "0");
    line.setAttribute("x2", x.toString());
    line.setAttribute("y2", height.toString());
    line.setAttribute("stroke", "#f5f5f5");
    line.setAttribute("stroke-width", "0.5");
    gridGroup.appendChild(line);
  }
  
  mainGroup.appendChild(gridGroup);
  return gridGroup;
};
