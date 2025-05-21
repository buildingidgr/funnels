
// Re-export all utility functions from their respective files
export { getStepDetails } from "./utils/stepUtils";
export { findConnectedLinks, findConnectedNodes, highlightConnectedPaths } from "./utils/connectionUtils";
export { createGradient, ensureDefsExists } from "./utils/gradientUtils";
export { drawNode } from "./utils/drawNodeUtils";
export { drawLink } from "./utils/drawLinkUtils";
export { 
  createBackgroundGrid, 
  createColumnLabels, 
  groupNodesByColumn, 
  renderSankeyDiagram 
} from "./utils/renderUtils";

// Export the new hooks
export { default as useNodeSelection } from "./hooks/useNodeSelection";
