import { useCallback } from "react";
import { SankeyData, SankeyNode as ISankeyNode, SankeyLink } from "./types";

// Add debug log
console.log("[DEBUG] Loading useDiagramLayout hook");

interface UseDiagramLayoutProps {
  containerRef: React.RefObject<HTMLDivElement>;
  svgRef: React.RefObject<SVGSVGElement>;
  sankeyData: SankeyData;
  initialValue: number;
}

export const useDiagramLayout = ({
  containerRef,
  svgRef,
  sankeyData,
  initialValue
}: UseDiagramLayoutProps) => {
  // Log when the hook is initialized
  console.log("[DEBUG] useDiagramLayout initialized with:", {
    nodes: sankeyData.nodes.length,
    links: sankeyData.links.length,
    hasSplitNodes: sankeyData.nodes.some(node => node.id.includes('split')),
    initialValue
  });

  const calculateLayout = useCallback(() => {
    console.log("[DEBUG] useDiagramLayout.calculateLayout called");
    
    if (!containerRef.current || !svgRef.current || sankeyData.nodes.length === 0) {
      console.log("[DEBUG] Missing refs or no nodes:", {
        containerRef: !!containerRef.current,
        svgRef: !!svgRef.current,
        nodesCount: sankeyData.nodes.length
      });
      return;
    }
    
    const container = containerRef.current;
    const svg = svgRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    console.log("[DEBUG] Container dimensions:", { width: containerWidth, height: containerHeight });
    
    // Set SVG dimensions
    svg.setAttribute("width", containerWidth.toString());
    svg.setAttribute("height", containerHeight.toString());
    
    // Calculate node positions and dimensions with significantly improved spacing
    const horizontalPadding = 120; // Increased for much more side padding
    const verticalPadding = 100; // Increased for more top/bottom padding
    const usableWidth = containerWidth - (horizontalPadding * 2);
    const usableHeight = containerHeight - (verticalPadding * 2);
    
    // Group nodes by their step column
    const nodesByColumn: { [key: string]: ISankeyNode[] } = {};
    
    sankeyData.nodes.forEach(node => {
      const idParts = node.id.split('-');
      
      if (idParts.length >= 2) {
        const stepIndex = parseInt(idParts[1]);
        
        // Determine column index - main steps and their split steps are in the same column
        let columnIndex = stepIndex;
        
        // Both main steps and split steps use the same column index
        // Remove the extra 0.9 offset for split steps
        
        const colKey = columnIndex.toString();
        if (!nodesByColumn[colKey]) {
          nodesByColumn[colKey] = [];
        }
        nodesByColumn[colKey].push(node);
      }
    });
    
    // Get unique column IDs and sort them numerically
    const columnKeys = Object.keys(nodesByColumn).sort((a, b) => parseFloat(a) - parseFloat(b));
    const columnCount = columnKeys.length;
    
    console.log("[DEBUG] Column analysis:", { 
      columnCount,
      columnKeys,
      nodesByColumn: Object.keys(nodesByColumn).map(key => ({ 
        column: key, 
        nodeCount: nodesByColumn[key].length 
      }))
    });
    
    // Calculate width for each column (even narrower nodes for better spacing)
    const columnWidth = usableWidth / (columnCount + 2.0); // Reduced from 4.0 to 2.0 to make columns wider
    
    // Calculate node dimensions for each column
    columnKeys.forEach((columnKey, columnIndex) => {
      const nodes = nodesByColumn[columnKey];
      const totalValue = nodes.reduce((sum, node) => sum + node.value, 0);
      
      // Calculate x position for this column
      // Use the original columnKey (which might be a decimal for split steps) to position
      const colOffset = (parseFloat(columnKey) + 1) * columnWidth;
      const x = horizontalPadding + colOffset;
      
      // Calculate heights based on values with additional spacing between nodes
      let yOffset = verticalPadding;
      const maxHeight = usableHeight * 0.5; // Reduced for smaller nodes vertically
      const nodeSpacing = 50; // Spacing between nodes
      const splitGroupMargin = 20; // Extra margin for split step groups

      // Sort nodes: main steps first, followed by their split steps
      nodes.sort((a, b) => {
        const aIsSplit = a.id.includes('split');
        const bIsSplit = b.id.includes('split');
        
        if (!aIsSplit && bIsSplit) return -1; // Main steps come first
        if (aIsSplit && !bIsSplit) return 1;  // Split steps come after
        return 0; // Otherwise keep original order
      });
      
      // Group split steps by their parent step
      const splitStepsByParent: { [key: string]: ISankeyNode[] } = {};

      // Identify all split steps and group them
      nodes.forEach(node => {
        if (node.id.includes('split')) {
          const parentId = node.id.split('-')[1];
          if (!splitStepsByParent[parentId]) {
            splitStepsByParent[parentId] = [];
          }
          splitStepsByParent[parentId].push(node);
        }
      });
      
      console.log(`[DEBUG] Column ${columnKey} layout:`, {
        nodesCount: nodes.length,
        mainSteps: nodes.filter(n => !n.id.includes('split')).length,
        splitSteps: nodes.filter(n => n.id.includes('split')).length,
        splitStepsByParent: Object.keys(splitStepsByParent).map(key => ({
          parentStep: key,
          splitCount: splitStepsByParent[key].length
        }))
      });
      
      // Keep track of each main step's y position and height
      const mainStepPositions: { [key: string]: { y: number; height: number; } } = {};
      
      // First pass to position main steps
      nodes.forEach((node) => {
        // Skip split steps in first pass
        if (node.id.includes('split')) return;
        
        const heightRatio = totalValue > 0 ? node.value / totalValue : 0;
        const height = Math.max(heightRatio * maxHeight, 30); // Minimum height of 30
        const width = columnWidth * 0.2; // Node width
        
        // Update node dimensions
        node.x = x - (width / 2);
        node.y = yOffset;
        node.width = width;
        node.height = height;
        
        // Store main step position
        const stepId = node.id.split('-')[1];
        mainStepPositions[stepId] = { y: yOffset, height: height };

        // Add spacing for next node - include extra space if this step has splits
        const hasSplits = splitStepsByParent[stepId] && splitStepsByParent[stepId].length > 0;
        yOffset += height + nodeSpacing + (hasSplits ? splitGroupMargin : 0);

        // Store color information for split steps to use
        node.mainStepColor = node.color;
        
        console.log(`[DEBUG] Positioned main step: ${node.id}`, {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height
        });
      });
      
      // Second pass to position split steps relative to their parent steps
      nodes.forEach((node) => {
        // Only process split steps
        if (!node.id.includes('split')) return;
        
        const idParts = node.id.split('-');
        const parentStepId = idParts[1];
        const splitIndex = parseInt(idParts[3]);
        const parentPosition = mainStepPositions[parentStepId];
        const parentNode = nodes.find(n => n.id === `step-${parentStepId}`);
        
        if (parentPosition && parentNode) {
          // Calculate dimensions based on value and parent
          const heightRatio = totalValue > 0 ? node.value / totalValue : 0;
          const height = Math.max(heightRatio * maxHeight, 20); // Smaller minimum height for split steps
          const width = columnWidth * 0.18; // Slightly narrower than main steps for visual distinction
          
          // Position split steps at the same x as the main step but with a slight right offset
          // This creates a visual distinction while keeping them in the same column
          node.x = x - (width / 2) + (width * 0.2); // Slight right offset
          
          // Calculate a vertical offset based on split index to stack them below the main step
          const verticalOffset = parentPosition.height + nodeSpacing + 
            (splitIndex * (height + nodeSpacing/2));
          
          node.y = parentPosition.y + verticalOffset;
          node.width = width;
          node.height = height;
          
          // Derive split step color from parent step for visual grouping
          // but make it slightly different for distinction
          if (parentNode.color) {
            // Make split steps a lighter shade of the parent color
            node.color = parentNode.color + "80"; // Add transparency for visual distinction
          }
          
          console.log(`[DEBUG] Positioned split step: ${node.id}`, {
            parentId: `step-${parentStepId}`,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
          });
        } else {
          console.log(`[DEBUG] Could not position split step: ${node.id}`, {
            hasParentPosition: !!parentPosition,
            hasParentNode: !!parentNode,
            parentId: `step-${parentStepId}`
          });
        }
      });
    });
    
    // Add initial node for the first step (made smaller to match other nodes)
    const initialNode: ISankeyNode = {
      id: "initial",
      name: "Initial",
      value: initialValue,
      color: "#9b87f5",
      x: horizontalPadding,
      y: verticalPadding,
      width: columnWidth * 0.2, // Matched to other nodes
      height: usableHeight * 0.5 // Matched to other nodes
    };
    
    // Log the initial node position
    console.log("[DEBUG] Positioned initial node:", {
      x: initialNode.x,
      y: initialNode.y,
      width: initialNode.width,
      height: initialNode.height
    });
    
    // Calculate paths for links with smoother curves
    sankeyData.links.forEach(link => {
      const sourceNode = link.source === "initial" ? initialNode : sankeyData.nodes.find(n => n.id === link.source);
      const targetNode = sankeyData.nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        // Store source and target dimensions for the link
        link.sourceX = sourceNode.x;
        link.sourceY = sourceNode.y;
        link.sourceWidth = sourceNode.width;
        link.sourceHeight = sourceNode.height;
        link.targetX = targetNode.x;
        link.targetY = targetNode.y;
        link.targetHeight = targetNode.height;
        // Make link width proportional but much thinner
        link.width = Math.max(link.value / 60, 0.5); // Reduced for thinner connections
        
        // Calculate source and target points
        const sourceX = sourceNode.x + sourceNode.width;
        const sourceY = sourceNode.y + (sourceNode.height / 2);
        const targetX = targetNode.x;
        const targetY = targetNode.y + (targetNode.height / 2);
        
        // Check if this is a split step link
        const isToSplit = targetNode.id.includes('split');
        const isFromSplit = sourceNode.id.includes('split');
        
        // Calculate control points for the curve
        let controlPointX1, controlPointX2;
        const distance = targetX - sourceX;
        
        if (isToSplit || isFromSplit) {
          // For links to/from split steps, use more curved paths
          controlPointX1 = sourceX + (distance * 0.3);
          controlPointX2 = sourceX + (distance * 0.7);
        } else {
          // Standard links between main steps
          controlPointX1 = sourceX + (distance * 0.25);
          controlPointX2 = sourceX + (distance * 0.75);
        }
        
        // Create SVG path for bezier curve
        link.path = `
          M ${sourceX} ${sourceY}
          C ${controlPointX1} ${sourceY}, ${controlPointX2} ${targetY}, ${targetX} ${targetY}
        `;
        
        // Calculate position for the label
        link.labelX = sourceX + ((targetX - sourceX) / 2);
        link.labelY = sourceY + ((targetY - sourceY) / 2);
        
        console.log(`[DEBUG] Created link path: ${link.source} -> ${link.target}`, {
          isToSplit,
          isFromSplit,
          path: link.path
        });
      } else {
        console.log(`[DEBUG] Could not create link path: ${link.source} -> ${link.target}`, {
          hasSourceNode: !!sourceNode,
          hasTargetNode: !!targetNode
        });
      }
    });

    console.log("[DEBUG] Layout calculation complete");
    return { initialNode };
  }, [containerRef, svgRef, sankeyData, initialValue]);

  return { calculateLayout };
};
