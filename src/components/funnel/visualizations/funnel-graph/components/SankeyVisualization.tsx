import React, { useRef, useEffect, useState, useCallback } from "react";
import { 
  ResponsiveContainer, 
  Sankey,
  Tooltip,
  Rectangle,
  Layer
} from "recharts";
import SankeyTooltip from "./SankeyTooltip";
import CustomTooltip from "./CustomTooltip";
import { RechartsSankeyData } from "../types";

console.log("[DEBUG] Loading SankeyVisualization component");

// Define distinct colors for steps
const STEP_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
];

// Define distinctive colors for split steps (slightly lighter variants)
const SPLIT_COLORS = [
  '#60a5fa', // Light Blue
  '#34d399', // Light Green
  '#a78bfa', // Light Purple
  '#fbbf24', // Light Amber
  '#f87171', // Light Red
];

// Define distinct colors for connection lines
const CONNECTION_COLORS = [
  '#60a5fa', // Blue
  '#4ade80', // Green
  '#c084fc', // Purple
  '#fbbf24', // Yellow
  '#f87171', // Red
];

// Define the extended link type 
interface ExtendedRechartsSankeyLink {
  source: number;
  target: number;
  value: number;
  sourceId?: string;
  targetId?: string;
  key?: string;
  conversionRate?: number;
  sourceColor?: string;
  targetColor?: string;
}

// Simplified diagram layout hook
const useDiagramLayout = (nodeCount: number, width: number) => {
  // Better calculations based on node count and available width
  const diagramWidth = width || 800;
  
  // Calculate optimal padding based on node count
  // Fewer nodes = more padding needed
  const nodePadding = Math.max(35, Math.min(70, 260 / (Math.max(nodeCount, 3))));
  
  // Calculate node width based on available space and node count
  // Increase minimum width to make nodes more prominent
  const nodeWidth = Math.max(25, Math.min(40, 160 / (Math.max(nodeCount, 4))));
  
  // Determine margins to improve spacing
  const margins = {
    top: 30,
    right: 40,
    bottom: 30,
    left: 40
  };
  
  return { 
    diagramWidth, 
    nodePadding, 
    nodeWidth,
    margins
  };
};

// Simplified Custom Node component
const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload, isActive } = props;
  
  // Determine if this is a split step
  const isSplitStep = payload.name.includes('-split-');
  
  // Get node color - use split colors for split steps
  const colorIndex = index % STEP_COLORS.length;
  const nodeColor = isSplitStep ? 
    SPLIT_COLORS[colorIndex] : 
    STEP_COLORS[colorIndex];
  
  // Improved styling for split steps
  const opacity = isSplitStep ? 0.9 : 1;
  
  // Make split steps more visible but still distinct
  const adjustedHeight = isSplitStep ? height * 0.85 : height;
  
  // Center split steps vertically to align better with connection lines
  const adjustedY = isSplitStep ? y + ((height - adjustedHeight) / 2) : y;
  
  // Visual differentiation for split steps
  const borderRadius = isSplitStep ? 3 : 4;
  
  // Add subtle border to split steps to distinguish them
  const borderWidth = isActive ? 2 : (isSplitStep ? 1 : 0);
  const borderColor = isActive ? '#ffffff' : (isSplitStep ? 'rgba(255,255,255,0.3)' : 'none');
  
  // Extract step number and actual step name for display
  let displayName = '';
  let originalName = '';
  
  if (payload.name.startsWith('step-')) {
    const parts = payload.name.split('-');
    if (parts.length >= 2) {
      const stepNum = parseInt(parts[1]) + 1; // Add 1 for user-friendly numbering
      
      // Get the original step name from nodeMap if available
      if (payload.originalName) {
        originalName = payload.originalName;
      }
      
      if (!isSplitStep) {
        displayName = originalName || `Step ${stepNum}`;
      } else {
        const splitName = payload.originalName || `Split ${parts[3] ? (parseInt(parts[3]) + 1) : ''}`;
        displayName = splitName;
      }
    }
  } else {
    // For non-step nodes (like "initial")
    displayName = payload.name;
  }
  
  // Handle potentially long names by truncating if needed
  const maxChars = isSplitStep ? 10 : 14;
  const truncatedName = displayName.length > maxChars ? 
    displayName.substring(0, maxChars - 3) + '...' : 
    displayName;
  
  // Apply active state styling
  const nodeClassName = isActive ? 'active-node' : '';
  
  // Create hover style object for direct injection (avoids CSS module issues)
  const hoverStyles = isActive ? {
    filter: 'brightness(1.1)',
    stroke: '#ffffff',
    strokeWidth: 2,
  } : {};
  
  return (
    <g className={nodeClassName}>
      <Rectangle
        x={x}
        y={adjustedY}
        width={width}
        height={adjustedHeight}
        fill={nodeColor}
        fillOpacity={isActive ? 1 : opacity}
        rx={borderRadius}
        ry={borderRadius}
        stroke={borderColor}
        strokeWidth={borderWidth}
        className="sankey-node"
        data-node-id={payload.name}
        data-is-split={isSplitStep ? "true" : "false"}
        data-original-name={originalName}
        style={hoverStyles}
      />
      
      {/* Add label inside the node */}
      <text
        x={x + width / 2}
        y={adjustedY + adjustedHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isSplitStep ? 10 : 11}
        fill="#fff"
        fontWeight={isActive ? "600" : (isSplitStep ? "400" : "500")}
      >
        {truncatedName}
      </text>
    </g>
  );
};

// Simplified Custom Link component
const CustomLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, 
    index, payload, isActive } = props;
  
  // Detect if this is a link to/from a split step
  const isToSplit = payload.targetId?.includes('-split-');
  const isFromSplit = payload.sourceId?.includes('-split-');
  const isSplitLink = isToSplit || isFromSplit;
  
  // Color management for links to make them match their source/target
  const colorIndex = index % CONNECTION_COLORS.length;
  const baseColor = CONNECTION_COLORS[colorIndex];
  
  // Visual styling for different connection types
  let strokeOpacity, strokeStyle;
  
  if (isToSplit) {
    // Connection from main to split step
    strokeOpacity = isActive ? 0.85 : 0.6;
    strokeStyle = "5,2"; // Dotted line for main-to-split
  } else if (isFromSplit) {
    // Connection from split step to another step
    strokeOpacity = isActive ? 0.85 : 0.5;
    strokeStyle = ""; // Solid line for split-to-other
  } else {
    // Regular connection between main steps
    strokeOpacity = isActive ? 0.85 : 0.4;
    strokeStyle = ""; // Solid line
  }
  
  // Adjust width based on connection type and active state
  const strokeWidth = Math.max(1, isActive ? linkWidth * 1.5 : (isSplitLink ? linkWidth * 0.75 : linkWidth));
  
  // Calculate adjusted connection points for split steps
  let adjustedSourceY = sourceY;
  let adjustedTargetY = targetY;
  
  // Adjust control points to create better curves for split steps
  let adjustedSourceControlX = sourceControlX;
  let adjustedTargetControlX = targetControlX;
  
  // Create tighter curves for split step connections
  if (isToSplit) {
    // For connections TO split steps - make curve tighter
    const distance = Math.abs(targetX - sourceX);
    adjustedSourceControlX = sourceX + (distance * 0.4);
    adjustedTargetControlX = targetX - (distance * 0.15); // Closer to target for better alignment
  } else if (isFromSplit) {
    // For connections FROM split steps - adjust differently
    const distance = Math.abs(targetX - sourceX);
    adjustedSourceControlX = sourceX + (distance * 0.15); // Closer to source
    adjustedTargetControlX = targetX - (distance * 0.4);
  }
  
  // Apply active state styling
  const linkClassName = isActive ? 'active-link' : '';
  
  // Create hover style object for direct injection (avoids CSS module issues)
  const hoverStyles = isActive ? {
    strokeOpacity: 0.85,
  } : {};
  
  return (
    <g className={linkClassName}>
      <path 
        d={`
          M${sourceX},${adjustedSourceY}
          C${adjustedSourceControlX},${adjustedSourceY} ${adjustedTargetControlX},${adjustedTargetY} ${targetX},${adjustedTargetY}
        `}
        fill="none"
        stroke={baseColor}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeStyle}
        data-source={payload.sourceId}
        data-target={payload.targetId}
        data-original-width={strokeWidth}
        className={`sankey-link ${isSplitLink ? "split-link" : ""}`}
        style={hoverStyles}
      />
      
      {/* Add a label for the percentage */}
      {payload.conversionRate !== undefined && !isSplitLink && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          fontSize={isActive ? 12 : 10}
          fontWeight={isActive ? "600" : "400"}
          fill={isActive ? "#3b82f6" : "#64748b"}
        >
          {`${payload.conversionRate.toFixed(1)}%`}
        </text>
      )}
    </g>
  );
};

// Validate Sankey data to prevent errors
const validateSankeyData = (data: any) => {
  if (!data) return null;
  
  // Create a deep copy to avoid modifying the original
  const validatedData = {
    nodes: [...data.nodes],
    links: []
  };
  
  // Filter out any links that reference non-existent nodes
  validatedData.links = data.links.filter(link => {
    const sourceValid = typeof link.source === 'number' && 
                      link.source >= 0 && 
                      link.source < data.nodes.length;
                      
    const targetValid = typeof link.target === 'number' && 
                      link.target >= 0 && 
                      link.target < data.nodes.length;
                      
    return sourceValid && targetValid && link.value > 0;
  });
  
  return validatedData;
};

interface SankeyVisualizationProps {
  rechartsData: RechartsSankeyData;
  nodeMap: Record<string, any>;
  initialValue: number;
  handleNodeMouseEnter: (e: React.MouseEvent<SVGRectElement>) => void;
  handleNodeMouseLeave: () => void;
  handleLinkMouseEnter: (e: React.MouseEvent<SVGPathElement>) => void;
  handleLinkMouseLeave: (e: React.MouseEvent<SVGPathElement>) => void;
  showTooltips?: boolean;
  interactiveTooltips?: boolean;
}

// The main Sankey Visualization component
export const SankeyVisualization: React.FC<SankeyVisualizationProps> = ({
  rechartsData,
  nodeMap,
  initialValue,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleLinkMouseEnter,
  handleLinkMouseLeave,
  showTooltips = true,
  interactiveTooltips = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Static tooltip position - not changing with mouse movement
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Use a ref to track the currently active element to avoid state updates
  const activeElementRef = useRef<{ type: 'node' | 'link', id: string | null }>({ 
    type: 'node', 
    id: null 
  });
  
  // Flag to prevent hover loop
  const isProcessingHoverEvent = useRef(false);
  
  // Update dimensions when the container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial measurement
    updateDimensions();
    
    // Create a ResizeObserver to track container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    // Start observing the container
    resizeObserver.observe(containerRef.current);
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Direct DOM manipulation for link hover (no state updates)
  const handleLinkHover = useCallback((e: React.MouseEvent<Element>) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Exit early if tooltips are disabled
    if (!showTooltips || !interactiveTooltips) return;
    
    // Prevent re-entry if already processing an event
    if (isProcessingHoverEvent.current) return;
    isProcessingHoverEvent.current = true;
    
    try {
      // Get all elements that might be involved
      const svg = svgRef.current?.querySelector('.recharts-surface');
      if (!svg) return;
      
      // Remove any existing highlighted elements
      svg.querySelectorAll('.highlighted-link').forEach(el => {
        el.classList.remove('highlighted-link');
      });
      
      // Get link information
      const target = e.currentTarget;
      const pathElement = target.querySelector('path') || target;
      
      const sourceId = pathElement.getAttribute('data-source');
      const targetId = pathElement.getAttribute('data-target');
      
      if (!sourceId || !targetId) return;
      
      // Update the active element reference
      activeElementRef.current = { type: 'link', id: `${sourceId}-${targetId}` };
      
      // Add highlight class to current element
      pathElement.classList.add('highlighted-link');
      
      // Store the original width if not already stored
      if (!pathElement.hasAttribute('data-hover-original-width')) {
        const originalWidth = pathElement.getAttribute('data-original-width') || 
                             pathElement.getAttribute('stroke-width') || '1';
        pathElement.setAttribute('data-hover-original-width', originalWidth);
      }
      
      // Get the original width
      const originalWidth = parseFloat(pathElement.getAttribute('data-hover-original-width') || '1');
      
      // Apply direct style changes - always calculate from the original width
      pathElement.setAttribute('stroke-opacity', '0.85');
      pathElement.setAttribute('stroke-width', (originalWidth * 1.5).toString());
      
      // Create tooltip content - ensure this has required data
      const sourceNode = nodeMap[sourceId];
      const targetNode = nodeMap[targetId];
      
      // Use comprehensive tooltip data
      const tooltipData = {
        source: nodeMap[sourceId]?.step || 0,
        target: nodeMap[targetId]?.step || 0,
        value: targetNode?.value || 0,
        sourceValue: sourceNode?.value || 0,
        sourceId,
        targetId,
        sourceName: sourceNode?.name || sourceId,
        targetName: targetNode?.name || targetId
      };
      
      console.log("Setting tooltip content:", tooltipData);
      
      // Update tooltip settings with a small delay to ensure DOM updates first
      setTimeout(() => {
        // Update tooltip position
        setTooltipPosition({ 
          x: e.clientX + 30,
          y: Math.max(50, e.clientY - 40)
        });
        
        // Set tooltip content
        setTooltipContent([{ payload: tooltipData }]);
        
        // Make tooltip visible
        setTooltipVisible(true);
      }, 0);
      
      // Call the original handler if provided
      if (handleLinkMouseEnter && pathElement instanceof SVGPathElement) {
        handleLinkMouseEnter(e as React.MouseEvent<SVGPathElement>);
      }
    } finally {
      // Reset the processing flag after a short delay
      setTimeout(() => {
        isProcessingHoverEvent.current = false;
      }, 100);
    }
  }, [handleLinkMouseEnter, nodeMap, showTooltips, interactiveTooltips]);
  
  // Direct DOM manipulation for link leave (no state updates)
  const handleLinkLeave = useCallback((e: React.MouseEvent<Element>) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Exit if not using interactive tooltips
    if (!showTooltips || !interactiveTooltips) return;
    
    const target = e.currentTarget;
    const pathElement = target.querySelector('path') || target;
    
    // Reset the visual styling
    pathElement.classList.remove('highlighted-link');
    pathElement.setAttribute('stroke-opacity', '0.4');
    
    // Restore the original width from data attribute instead of calculating
    const originalWidth = pathElement.getAttribute('data-hover-original-width') || 
                         pathElement.getAttribute('data-original-width') || 
                         '1';
    pathElement.setAttribute('stroke-width', originalWidth);
    
    // Clean up the temporary attribute 
    pathElement.removeAttribute('data-hover-original-width');
    
    // Clear active element reference
    activeElementRef.current = { type: 'node', id: null };
    
    // Use a timeout to hide the tooltip to avoid flash when moving between elements
    setTimeout(() => {
      // Only hide if we're not currently over another link or node
      if (!activeElementRef.current.id) {
        setTooltipVisible(false);
      }
    }, 200);
    
    // Call the original handler
    if (handleLinkMouseLeave && pathElement instanceof SVGPathElement) {
      handleLinkMouseLeave(e as React.MouseEvent<SVGPathElement>);
    }
  }, [handleLinkMouseLeave, showTooltips, interactiveTooltips]);
  
  // Similar improvements for node hover
  const handleNodeHover = useCallback((e: React.MouseEvent<Element>) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Exit early if tooltips are disabled
    if (!showTooltips || !interactiveTooltips) return;
    
    // Prevent re-entry if already processing an event
    if (isProcessingHoverEvent.current) return;
    isProcessingHoverEvent.current = true;
    
    try {
      // Get all elements that might be involved
      const svg = svgRef.current?.querySelector('.recharts-surface');
      if (!svg) return;
      
      // Remove any existing highlighted elements
      svg.querySelectorAll('.highlighted-node').forEach(el => {
        el.classList.remove('highlighted-node');
      });
      
      // Find the node information
      const target = e.currentTarget;
      const nodeElement = target.querySelector('rect') || target;
      const nodeId = nodeElement.getAttribute('data-node-id');
      
      if (!nodeId) return;
      
      // Update the active element reference
      activeElementRef.current = { type: 'node', id: nodeId };
      
      // Add highlight class
      nodeElement.classList.add('highlighted-node');
      
      // Apply direct style changes
      nodeElement.setAttribute('stroke', '#ffffff');
      nodeElement.setAttribute('stroke-width', '2');
      
      // Create tooltip content - ensure this has required data
      const node = nodeMap[nodeId];
      if (node) {
        // Use comprehensive tooltip data
        const tooltipData = {
          name: nodeId,
          value: node.value || 0,
          originalName: node.name || nodeId,
          step: node.step,
          color: node.color
        };
        
        console.log("Setting node tooltip content:", tooltipData);
        
        // Update tooltip settings with a small delay to ensure DOM updates first
        setTimeout(() => {
          // Update tooltip position
          setTooltipPosition({ 
            x: e.clientX + 30,
            y: Math.max(50, e.clientY - 40)
          });
          
          // Set tooltip content
          setTooltipContent([{ payload: tooltipData }]);
          
          // Make tooltip visible
          setTooltipVisible(true);
        }, 0);
      }
      
      // Call original handler
      if (handleNodeMouseEnter && nodeElement instanceof SVGRectElement) {
        handleNodeMouseEnter(e as React.MouseEvent<SVGRectElement>);
      }
    } finally {
      // Reset the processing flag after a delay
      setTimeout(() => {
        isProcessingHoverEvent.current = false;
      }, 100);
    }
  }, [handleNodeMouseEnter, nodeMap, showTooltips, interactiveTooltips]);
  
  // Direct DOM manipulation for node leave
  const handleNodeLeave = useCallback((e: React.MouseEvent<Element>) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Exit if tooltips not enabled
    if (!showTooltips || !interactiveTooltips) return;
    
    const target = e.currentTarget;
    const nodeElement = target.querySelector('rect') || target;
    
    // Reset visual styling
    nodeElement.classList.remove('highlighted-node');
    nodeElement.setAttribute('stroke', 'none');
    nodeElement.setAttribute('stroke-width', '0');
    
    // Clear active element reference
    activeElementRef.current = { type: 'node', id: null };
    
    // Hide tooltip with delay
    setTimeout(() => {
      // Only hide if we're not currently over another element
      if (!activeElementRef.current.id) {
        setTooltipVisible(false);
      }
    }, 200);
    
    // Call original handler
    if (handleNodeMouseLeave) {
      handleNodeMouseLeave();
    }
  }, [handleNodeMouseLeave, showTooltips, interactiveTooltips]);
  
  // Create enhanced components with non-state hover handling
  const EnhancedNode = useCallback((props: any) => {
    return (
      <g 
        onMouseEnter={handleNodeHover} 
        onMouseLeave={handleNodeLeave}
        className="sankey-node-container"
        style={{ cursor: 'pointer' }}
      >
        <CustomNode {...props} isActive={false} />
      </g>
    );
  }, [handleNodeHover, handleNodeLeave]);
  
  const EnhancedLink = useCallback((props: any) => {
    return (
      <g 
        onMouseEnter={handleLinkHover}
        onMouseLeave={handleLinkLeave}
        className="sankey-link-container"
        style={{ cursor: 'pointer' }}
        data-source-id={props.payload?.sourceId}
        data-target-id={props.payload?.targetId}
      >
        <CustomLink {...props} isActive={false} />
      </g>
    );
  }, [handleLinkHover, handleLinkLeave]);
  
  // Validate the data
  const validatedData = validateSankeyData(rechartsData);
  
  // Calculate layout dimensions
  const { diagramWidth, nodePadding, nodeWidth, margins } = useDiagramLayout(
    validatedData?.nodes?.length || 0,
    dimensions.width
  );
  
  // Prepare data with original names
  const enhancedData = React.useMemo(() => {
    if (!validatedData) return null;
    
    // Add original names to nodes
    const nodesWithNames = validatedData.nodes.map(node => {
      const mappedNode = nodeMap[node.name];
      return {
        ...node,
        originalName: mappedNode?.name || ''
      };
    });
    
    return {
      ...validatedData,
      nodes: nodesWithNames
    };
  }, [validatedData, nodeMap]);
  
  // Nothing to render if we don't have valid data
  if (!enhancedData || !enhancedData.nodes.length || !enhancedData.links.length) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-400">No valid funnel data available</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full funnel-visualization" 
      style={{ minHeight: '500px', position: 'relative' }}
    >
      {/* Global styles */}
      <style type="text/css">
        {`
          /* Fix hover effects */
          .funnel-visualization .highlighted-node {
            filter: brightness(1.1);
            stroke: #fff !important;
            stroke-width: 2px !important;
          }
          .funnel-visualization .highlighted-link {
            stroke-opacity: 0.85 !important;
            stroke-width: 3px !important;
          }
          
          /* Fix pointer events */
          .recharts-surface {
            overflow: visible !important;
          }
          
          /* Ensure tooltips don't interfere with mouse events */
          .recharts-tooltip-content, .tooltip-layer, .recharts-custom-tooltip {
            pointer-events: none !important;
            user-select: none;
          }
          
          /* Force tooltip visibility */
          .tooltip-layer {
            display: block !important;
            z-index: 9999 !important;
          }
        `}
      </style>
      
      {/* Always render the tooltip layer but control visibility with props */}
      <div 
        className="tooltip-layer" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        <CustomTooltip 
          active={tooltipVisible && !!tooltipContent}
          payload={tooltipContent || []}
          nodeMap={nodeMap}
          initialValue={initialValue}
          coordinate={tooltipPosition}
        />
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={enhancedData}
          node={EnhancedNode}
          link={EnhancedLink}
          nodePadding={nodePadding}
          nodeWidth={nodeWidth}
          width={diagramWidth}
          margin={margins}
          iterations={64}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default SankeyVisualization;
