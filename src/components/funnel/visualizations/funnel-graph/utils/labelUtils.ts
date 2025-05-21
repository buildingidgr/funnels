
import { SankeyNode } from "../types";
import { FunnelStep } from "@/types/funnel";

/**
 * Create column labels for the Sankey diagram
 */
export const createColumnLabels = (
  mainGroup: SVGGElement,
  nodesByColumn: { [key: string]: SankeyNode[] },
  initialNode: SankeyNode,
  enabledSteps: FunnelStep[]
): SVGGElement => {
  const labelsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  labelsGroup.setAttribute("class", "column-labels");
  
  // Get unique column keys and sort them
  const columnKeys = Object.keys(nodesByColumn).sort((a, b) => parseFloat(a) - parseFloat(b));
  
  // Create label for each column
  columnKeys.forEach(colKey => {
    const nodes = nodesByColumn[colKey];
    if (!nodes || nodes.length === 0) return;
    
    // Get representative node for column
    const node = nodes[0];
    let labelText = "Initial Users";
    
    // For non-initial nodes
    if (colKey !== "0") {
      const idParts = node.id.split('-');
      if (idParts.length >= 2) {
        const stepIndex = parseInt(idParts[1]);
        if (stepIndex >= 0 && stepIndex < enabledSteps.length) {
          // Check if this is a main step or a split
          if (idParts.length > 2 && idParts[2] === 'split') {
            labelText = "Split Variations";
          } else {
            // Main step
            const step = enabledSteps[stepIndex];
            labelText = `Step ${step.number}: ${step.name}`;
          }
        }
      }
    }
    
    // Calculate label position
    const x = parseFloat(colKey) === 0 
      ? initialNode.x + (initialNode.width / 2) 
      : nodes.reduce((sum, n) => sum + n.x + (n.width / 2), 0) / nodes.length;
    
    // Create label text
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x.toString());
    label.setAttribute("y", "15");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-weight", "500");
    label.setAttribute("fill", "#4B5563");
    label.textContent = labelText;
    
    // Create background rectangle
    const textBox = label.getBBox ? label.getBBox() : { width: labelText.length * 7, height: 16 };
    const padding = 6;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", (x - (textBox.width / 2) - padding).toString());
    rect.setAttribute("y", (5 - padding/2).toString());
    rect.setAttribute("width", (textBox.width + padding * 2).toString());
    rect.setAttribute("height", (textBox.height + padding).toString());
    rect.setAttribute("rx", "3");
    rect.setAttribute("ry", "3");
    rect.setAttribute("fill", "#F3F4F6");
    
    labelsGroup.appendChild(rect);
    labelsGroup.appendChild(label);
  });
  
  mainGroup.appendChild(labelsGroup);
  return labelsGroup;
};
