
import { useState, useCallback } from 'react';
import { highlightConnectedPaths } from '../utils/connectionUtils';

/**
 * Hook to manage node selection state and interactions
 */
const useNodeSelection = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  
  // Handle hovering a node
  const handleNodeHover = useCallback((svg: SVGSVGElement | null, nodeId: string, styles: Record<string, string>) => {
    if (!svg) return;
    
    // Find the main group within the SVG
    const mainGroup = svg.querySelector('g');
    if (!mainGroup) return;
    
    // Highlight connected paths
    highlightConnectedPaths(mainGroup, nodeId, true, styles);
    
    // Update active node state
    setActiveNode(nodeId);
  }, []);
  
  // Handle leaving a node
  const handleNodeLeave = useCallback((svg: SVGSVGElement | null, nodeId: string, styles: Record<string, string>) => {
    if (!svg) return;
    
    // Find the main group within the SVG
    const mainGroup = svg.querySelector('g');
    if (!mainGroup) return;
    
    // Remove highlights
    highlightConnectedPaths(mainGroup, nodeId, false, styles);
    
    // Reset active node
    setActiveNode(null);
  }, []);
  
  // Handle setting active node (used for clicks)
  const setNodeActive = useCallback((id: string | null, svg?: SVGSVGElement | null, styles?: Record<string, string>) => {
    // If we have an svg and styles, handle highlighting
    if (svg && styles) {
      const mainGroup = svg.querySelector('g');
      if (mainGroup) {
        // Remove highlight from currently active node
        if (activeNode) {
          highlightConnectedPaths(mainGroup, activeNode, false, styles);
        }
        
        // Add highlight to newly active node
        if (id) {
          highlightConnectedPaths(mainGroup, id, true, styles);
        }
      }
    }
    
    // Update state
    setActiveNode(id);
  }, [activeNode]);
  
  return {
    activeNode,
    setActiveNode: setNodeActive,
    handleNodeHover,
    handleNodeLeave
  };
};

export default useNodeSelection;
