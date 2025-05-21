
import { SankeyNode, SankeyLink } from "../types";

/**
 * Find all links connected to a given node
 */
export const findConnectedLinks = (
  group: SVGElement,
  nodeId: string,
  includeSources = true,
  includeTargets = true
): SVGElement[] => {
  const connectedLinks: SVGElement[] = [];
  
  if (!group) return connectedLinks;
  
  // Find links where the node is a source
  if (includeSources) {
    const sourceLinks = Array.from(group.querySelectorAll(`[data-source="${nodeId}"]`));
    connectedLinks.push(...sourceLinks as SVGElement[]);
  }
  
  // Find links where the node is a target
  if (includeTargets) {
    const targetLinks = Array.from(group.querySelectorAll(`[data-target="${nodeId}"]`));
    connectedLinks.push(...targetLinks as SVGElement[]);
  }
  
  return connectedLinks;
};

/**
 * Find all nodes connected to a given node via links
 */
export const findConnectedNodes = (
  group: SVGElement,
  nodeId: string
): { nodes: SVGElement[], nodeIds: string[] } => {
  const connectedNodeIds = new Set<string>();
  const connectedNodes: SVGElement[] = [];
  
  if (!group) return { nodes: [], nodeIds: [] };
  
  // Get all connected links
  const connectedLinks = findConnectedLinks(group, nodeId);
  
  // Extract source and target node IDs from these links
  connectedLinks.forEach(link => {
    const sourceId = link.getAttribute("data-source");
    const targetId = link.getAttribute("data-target");
    
    if (sourceId && sourceId !== nodeId) {
      connectedNodeIds.add(sourceId);
    }
    
    if (targetId && targetId !== nodeId) {
      connectedNodeIds.add(targetId);
    }
  });
  
  // Find the node elements with these IDs
  connectedNodeIds.forEach(id => {
    const nodeElement = group.querySelector(`[data-node-id="${id}"]`);
    if (nodeElement) {
      connectedNodes.push(nodeElement as SVGElement);
    }
  });
  
  return { 
    nodes: connectedNodes,
    nodeIds: Array.from(connectedNodeIds)
  };
};

/**
 * Highlight connections and connected nodes for a given node
 */
export const highlightConnectedPaths = (
  group: SVGElement,
  nodeId: string,
  highlight: boolean = true,
  styles: Record<string, string>
): void => {
  if (!group) return;
  
  // Find the node
  const node = group.querySelector(`[data-node-id="${nodeId}"]`);
  
  if (!node) return;
  
  // Apply highlight styles to the node
  if (highlight) {
    node.classList.add(styles.activeNode || 'active-node');
  } else {
    node.classList.remove(styles.activeNode || 'active-node');
  }
  
  // Find and highlight connected links
  const connectedLinks = findConnectedLinks(group, nodeId);
  connectedLinks.forEach(link => {
    if (highlight) {
      link.setAttribute("stroke-opacity", "0.6");
      // Get original width and increase it for highlight
      const originalWidth = parseFloat(link.getAttribute("data-original-width") || "1");
      link.setAttribute("stroke-width", (originalWidth * 1.5).toString());
      link.classList.add(styles.activeLink || 'active-link');
    } else {
      link.setAttribute("stroke-opacity", "0.2");
      // Restore original width
      const originalWidth = parseFloat(link.getAttribute("data-original-width") || "1");
      link.setAttribute("stroke-width", originalWidth.toString());
      link.classList.remove(styles.activeLink || 'active-link');
    }
  });
  
  // Find and highlight connected nodes
  const { nodes: connectedNodes } = findConnectedNodes(group, nodeId);
  connectedNodes.forEach(connectedNode => {
    if (highlight) {
      connectedNode.classList.add(styles.connectedNode || 'connected-node');
    } else {
      connectedNode.classList.remove(styles.connectedNode || 'connected-node');
    }
  });
};
