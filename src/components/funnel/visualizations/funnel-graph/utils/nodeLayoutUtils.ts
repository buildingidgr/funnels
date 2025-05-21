
import { SankeyNode } from "../types";

/**
 * Group nodes by their column position
 */
export const groupNodesByColumn = (
  nodes: SankeyNode[],
  initialNode: SankeyNode | null
): { [key: string]: SankeyNode[] } => {
  const nodesByColumn: { [key: string]: SankeyNode[] } = {};
  
  // Add initial node to columns
  if (initialNode) {
    nodesByColumn["0"] = [initialNode];
  }
  
  nodes.forEach(node => {
    const idParts = node.id.split('-');
    
    if (idParts.length >= 2) {
      const stepIndex = parseInt(idParts[1]);
      
      // Determine column index
      let columnIndex = stepIndex + 1; // +1 for initial node
      
      if (idParts.length > 2 && idParts[2] === 'split') {
        columnIndex = stepIndex + 1.5; // Place split nodes between columns
      }
      
      const colKey = columnIndex.toString();
      if (!nodesByColumn[colKey]) {
        nodesByColumn[colKey] = [];
      }
      nodesByColumn[colKey].push(node);
    }
  });
  
  return nodesByColumn;
};
