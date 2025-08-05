import React, { useRef, useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sankey, ResponsiveContainer } from 'recharts';
import { SankeyNode, SankeyLink } from './types';
import { SankeyLegend } from './components/SankeyLegend';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Target, AlertCircle, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SankeyVisualizationProps {
  rechartsData: {
    nodes: Array<{
      name: string;
      value?: number;
      color?: string;
      index?: number;
    }>;
    links: Array<{
      source: number;
      target: number;
      value: number;
      sourceId?: string;
      targetId?: string;
      conversionRate?: number;
      sourceValue?: number;
    }>;
  };
  nodeMap: Record<string, SankeyNode>;
  initialValue: number;
  handleNodeMouseEnter?: (nodeId: string) => void;
  handleNodeMouseLeave?: () => void;
  handleLinkMouseEnter?: (link: SankeyLink) => void;
  handleLinkMouseLeave?: () => void;
  showTooltips?: boolean;
  interactiveTooltips?: boolean;
}

// Define distinct colors for steps with better contrast
const STEP_COLORS = {
  main: {
    landing: '#3b82f6', // Blue for landing page
    destination: '#10b981', // Green for destination selection
    travelDetails: '#8b5cf6', // Purple for travel details
    booking: '#f59e0b', // Amber for booking
    confirmation: '#ef4444', // Red for confirmation
  },
  split: {
    domestic: '#34d399', // Light green for domestic
    international: '#60a5fa', // Light blue for international
  },
  links: {
    main: '#93c5fd', // Light blue for main flows
    domestic: '#6ee7b7', // Light green for domestic flows
    international: '#93c5fd', // Light blue for international flows
    high: '#10b981', // Green for high conversion
    medium: '#f59e0b', // Yellow for medium conversion
    low: '#ef4444', // Red for low conversion
  }
};

// Enhanced node component with better visual feedback
const EnhancedNode = ({ x, y, width, height, index, payload, ...props }: any) => {
  // Determine if this is the first or last node to adjust text positioning
  const isFirstNode = index === 0;
  const isLastNode = index === (props.totalNodes - 1);
  
  // Debug logging to see what's being passed to the node
  console.log(`[DEBUG] EnhancedNode props for index ${index}:`, {
    payload,
    displayName: payload.displayName,
    name: payload.name,
    x,
    y,
    width,
    height,
    isFirstNode,
    isLastNode
  });
  
  // Calculate text positioning based on node position
  const textX = x + width / 2;
  const textY = y - 12;
  
  // Create a temporary element to measure text width
  const textContent = `${payload.displayName || payload.name} (${payload.value?.toLocaleString() || 0})`;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = context.measureText(textContent).width;
  
  // Add some padding around the text
  const padding = 16;
  const backgroundWidth = Math.max(textWidth + padding * 2, 120); // Minimum width of 120px
  
  // Ensure the background doesn't extend beyond reasonable bounds
  const maxBackgroundWidth = 300; // Maximum background width
  const finalBackgroundWidth = Math.min(backgroundWidth, maxBackgroundWidth);
  const backgroundX = textX - finalBackgroundWidth / 2;
  
  // Ensure the background is properly centered
  const adjustedBackgroundX = Math.max(0, backgroundX); // Don't let it go negative
  
  const isSplit = payload.id.includes('split');
  const isDomestic = payload.name.toLowerCase().includes('domestic');
  const isInternational = payload.name.toLowerCase().includes('international');
  
  let nodeColor = STEP_COLORS.main.landing;
  
  // Determine node color based on step type
  if (isSplit) {
    nodeColor = isDomestic ? STEP_COLORS.split.domestic : STEP_COLORS.split.international;
  } else {
    switch (payload.name.toLowerCase()) {
      case 'landing page visit':
        nodeColor = STEP_COLORS.main.landing;
        break;
      case 'destination selection':
        nodeColor = STEP_COLORS.main.destination;
        break;
      case 'travel details':
        nodeColor = STEP_COLORS.main.travelDetails;
        break;
      case 'booking':
        nodeColor = STEP_COLORS.main.booking;
        break;
      case 'confirmation':
        nodeColor = STEP_COLORS.main.confirmation;
        break;
    }
  }

  // Calculate conversion rate for this node
  const conversionRate = payload.conversionRate || 0;
  const isHighConversion = conversionRate >= 75;
  const isLowConversion = conversionRate < 40;

  // Store the step height for use in link calculations
  React.useEffect(() => {
    if (props.onStepHeightChange) {
      props.onStepHeightChange(payload.name, height);
    }
  }, [height, payload.name, props.onStepHeightChange]);

  return (
    <g 
      className={`sankey-node-group ${isSplit ? 'sankey-split-node' : ''}`}
      onMouseEnter={(e) => {
        console.log('[DEBUG] EnhancedNode mouse enter event:', {
          payload,
          event: { clientX: e.clientX, clientY: e.clientY },
          timestamp: new Date().toISOString()
        });
        
        // Call the handleNodeHover function if available
        if (props.handleNodeHover) {
          props.handleNodeHover(e, payload);
        }
      }}
      onMouseLeave={(e) => {
        console.log('[DEBUG] EnhancedNode mouse leave event:', {
          payload,
          timestamp: new Date().toISOString()
        });
        
        // Hide tooltip when mouse leaves node
        if (props.setTooltipVisible) {
          props.setTooltipVisible(false);
        }
        if (props.setSelectedNode) {
          props.setSelectedNode(null);
        }
      }}
    >
      {/* Node background with enhanced styling */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeColor}
        rx={6}
        ry={6}
        className="sankey-node"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
          transition: 'all 0.3s ease',
          stroke: isHighConversion ? '#10b981' : isLowConversion ? '#ef4444' : 'transparent',
          strokeWidth: isHighConversion || isLowConversion ? 2 : 0
        }}
      />
      

      
      {/* Add a background rectangle for better text visibility, especially for edge nodes */}
      <rect
        x={adjustedBackgroundX}
        y={y - 30}
        width={finalBackgroundWidth}
        height={25}
        fill="rgba(255, 255, 255, 0.95)"
        rx={6}
        ry={6}
      />
      
      {/* Step name label with value - positioned above the node with background */}
      <foreignObject
        x={adjustedBackgroundX}
        y={y - 35}
        width={finalBackgroundWidth}
        height={30}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textShadow: 'none',
            margin: 0,
            padding: 0
          }}
        >
          {payload.displayName || payload.name} ({payload.value?.toLocaleString() || 0})
        </div>
      </foreignObject>
      
      {/* User count with better formatting - positioned inside the node */}
      <text
        x={x + width / 2}
        y={y + height / 2 - 2}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight="700"
        className="sankey-node-value"
        style={{ 
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          paintOrder: 'stroke fill',
          stroke: 'rgba(0, 0, 0, 0.3)',
          strokeWidth: '1px'
        }}
      >
        {payload.value.toLocaleString()}
      </text>
      
      {/* Conversion rate indicator - positioned below the node */}
      {conversionRate > 0 && (
        <text
          x={x + width / 2}
          y={y + height + 20}
          textAnchor="middle"
          fill={isHighConversion ? '#10b981' : isLowConversion ? '#ef4444' : '#fbbf24'}
          fontSize={10}
          fontWeight="600"
          className="sankey-node-conversion"
          style={{
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            paintOrder: 'stroke fill',
            stroke: 'white',
            strokeWidth: '2px'
          }}
        >
          {conversionRate.toFixed(1)}%
        </text>
      )}
    </g>
  );
};

// Enhanced link component with better visual feedback and performance indicators
const EnhancedLink = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, stepHeights, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  console.log('[DEBUG] EnhancedLink rendered:', {
    payload,
    isHovered,
    timestamp: new Date().toISOString()
  });
  
  // Get the handleLinkHover function from props or context
  const handleLinkHover = props.handleLinkHover;
  
  const isSplit = payload.sourceId?.includes('split') || payload.targetId?.includes('split');
  const isDomestic = payload.sourceId?.includes('domestic') || payload.targetId?.includes('international');
  const isBypass = payload.sourceId === 'initial' && !payload.targetId?.includes('step-1');
  const isOptional = payload.sourceId?.includes('step-') && payload.targetId?.includes('step-') && 
                     Math.abs(parseInt(payload.sourceId.split('-')[1]) - parseInt(payload.targetId.split('-')[1])) > 1;
  
  // Calculate conversion rate for this link
  const conversionRate = payload.conversionRate || 0;
  const isHighConversion = conversionRate >= 75;
  const isLowConversion = conversionRate < 40;
  
  let linkColor = STEP_COLORS.links.main;
  if (isSplit) {
    linkColor = isDomestic ? STEP_COLORS.links.domestic : STEP_COLORS.links.international;
  } else if (isHighConversion) {
    linkColor = STEP_COLORS.links.high;
  } else if (isLowConversion) {
    linkColor = STEP_COLORS.links.low;
  } else {
    linkColor = STEP_COLORS.links.medium;
  }

  // Calculate path with different curvature based on link type
  let path;
  const distance = Math.abs(targetX - sourceX);
  const curveOffset = Math.min(distance * 0.15, 30); // Subtle curve, max 30px
  
  if (isBypass) {
    // Bypass links: more curved to show they skip steps
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const bypassOffset = Math.min(distance * 0.25, 50);
    path = `M${sourceX},${sourceY} C${midX - bypassOffset},${sourceY} ${midX + bypassOffset},${targetY} ${targetX},${targetY}`;
  } else if (isOptional) {
    // Optional step links: moderate curve
    const midX = (sourceX + targetX) / 2;
    path = `M${sourceX},${sourceY} C${midX - curveOffset},${sourceY} ${midX + curveOffset},${targetY} ${targetX},${targetY}`;
  } else if (isSplit) {
    // Split links: very subtle curve
    const midX = (sourceX + targetX) / 2;
    const splitOffset = Math.min(distance * 0.1, 20);
    path = `M${sourceX},${sourceY} C${midX - splitOffset},${sourceY} ${midX + splitOffset},${targetY} ${targetX},${targetY}`;
  } else {
    // Regular links: straight with minimal curve
    const midX = (sourceX + targetX) / 2;
    const regularOffset = Math.min(distance * 0.08, 15);
    path = `M${sourceX},${sourceY} C${midX - regularOffset},${sourceY} ${midX + regularOffset},${targetY} ${targetX},${targetY}`;
  }
  
  // Calculate the actual width of the flow path based on source step height
  const sourceValue = payload.sourceValue || payload.value;
  const percentage = sourceValue > 0 ? (payload.value / sourceValue) * 100 : 0;
  
  // Get the actual source step height from the stepHeights state
  const sourceStepHeight = stepHeights[payload.sourceId] || 60; // Fallback to 60 if not available
  
  // Calculate flow width based on the actual percentage of the source step height
  // This should represent the actual height the flow occupies on the source step
  const flowWidth = (percentage / 100) * sourceStepHeight;
  
  // Scale down the stroke width for better visual representation
  // We'll use a scaling factor to make the stroke width more appropriate
  const strokeWidthScale = 0.3; // Scale factor to make stroke width more reasonable
  const scaledFlowWidth = flowWidth * strokeWidthScale;
  const maxFlowWidth = 30; // Maximum stroke width
  const minFlowWidth = 2;  // Minimum stroke width
  const actualFlowWidth = Math.max(minFlowWidth, Math.min(maxFlowWidth, scaledFlowWidth));
  
  // Enhanced flow width on hover
  const hoverFlowWidth = isHovered ? actualFlowWidth * 1.5 : actualFlowWidth;
  
  // Debug log for flow width calculation
  console.log('[DEBUG] Flow width:', {
    sourceId: payload.sourceId,
    targetId: payload.targetId,
    percentage: percentage.toFixed(1) + '%',
    sourceStepHeight,
    flowWidth: flowWidth.toFixed(1),
    scaledFlowWidth: scaledFlowWidth.toFixed(1),
    actualFlowWidth: actualFlowWidth.toFixed(1),
    isSplit: payload.sourceId?.includes('split') || payload.targetId?.includes('split')
  });
  
  // Create a proper filled flow path with actual width
  // For a true Sankey diagram, we need filled rectangles, not just strokes
  // We'll use a thick stroke as a proxy for the filled area width
  
  return (
    <g 
      className="sankey-link-group"
      onMouseEnter={(e) => {
        console.log('[DEBUG] EnhancedLink mouse enter event:', {
          payload,
          event: { clientX: e.clientX, clientY: e.clientY },
          timestamp: new Date().toISOString()
        });
        setIsHovered(true);
        
        // Call the handleLinkHover function if available
        if (handleLinkHover) {
          handleLinkHover(e, payload);
        }
      }}
      onMouseLeave={(e) => {
        console.log('[DEBUG] EnhancedLink mouse leave event:', {
          payload,
          timestamp: new Date().toISOString()
        });
        setIsHovered(false);
        
        // Hide tooltip when mouse leaves link
        if (props.setTooltipVisible) {
          props.setTooltipVisible(false);
        }
      }}
    >
      {/* Hover area for better interaction */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(hoverFlowWidth + 10, 20)}
        className="sankey-link-hover-area"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Background flow path - creates the filled area with actual width */}
      <path
        d={path}
        fill="none"
        stroke={linkColor}
        strokeWidth={hoverFlowWidth}
        strokeOpacity={isHovered ? 0.9 : 0.7}
        strokeLinecap="round"
        className={`sankey-link-background ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          filter: isHovered ? 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))' : 'none'
        }}
      />
      
      {/* Main flow path with actual width - using thick stroke as filled area */}
      <path
        d={path}
        fill="none"
        stroke={linkColor}
        strokeWidth={hoverFlowWidth}
        strokeOpacity={isHovered ? 1 : 0.9}
        strokeLinecap="round"
        className={`sankey-link-path ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          strokeDasharray: isSplit ? '4,2' : isBypass ? '6,3' : 'none',
          filter: isHovered 
            ? 'drop-shadow(0 3px 12px rgba(59, 130, 246, 0.6))' 
            : isHighConversion ? 'drop-shadow(0 1px 3px rgba(16, 185, 129, 0.3))' : 
              isLowConversion ? 'drop-shadow(0 1px 3px rgba(239, 68, 68, 0.3))' : 'none'
        }}
      />
      
      {/* Flow animation overlay */}
      <path
        d={path}
        fill="none"
        stroke="white"
        strokeWidth={Math.max(hoverFlowWidth / 2, 1)}
        strokeOpacity={isHovered ? 0.6 : 0.4}
        className="sankey-link-flow"
        style={{
          animation: 'flowAnimation 2s linear infinite',
          strokeDasharray: '4,4',
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* Removed built-in tooltip - using custom tooltip system instead */}
      
      {/* Conversion rate label on link (when not hovered) */}
      {conversionRate > 0 && payload.value > 50 && !isHovered && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          fill={isHighConversion ? '#10b981' : isLowConversion ? '#ef4444' : '#f59e0b'}
          fontSize={10}
          fontWeight="600"
          className="sankey-link-label"
          style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
        >
          {conversionRate.toFixed(1)}%
        </text>
      )}
    </g>
  );
};

// Add CSS animation for flow effect
const styles = `
  @keyframes flowAnimation {
    from {
      stroke-dashoffset: 8;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  .sankey-bypass-link {
    stroke-dasharray: 6,3;
    opacity: 0.8;
  }
  
  .sankey-optional-link {
    stroke-dasharray: 3,2;
    opacity: 0.9;
  }
  
  .sankey-split-link {
    stroke-dasharray: 4,2;
    opacity: 0.85;
  }
  
  .sankey-link-path:hover {
    stroke-width: calc(var(--stroke-width) + 2px);
    opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  
  .sankey-link-background {
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .sankey-link-path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

// Performance metrics component
const PerformanceMetrics = ({ data, initialValue }: { data: any, initialValue: number }) => {
  const totalUsers = data.nodes.reduce((sum: number, node: any) => sum + node.value, 0);
  const overallConversion = ((totalUsers / initialValue) * 100);
  
  const bestPerformingNode = data.nodes.reduce((best: any, current: any) => 
    (current.conversionRate || 0) > (best.conversionRate || 0) ? current : best
  );
  
  const worstPerformingNode = data.nodes.reduce((worst: any, current: any) => 
    (current.conversionRate || 0) < (worst.conversionRate || 0) ? current : worst
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Total Users</p>
            <p className="text-lg font-bold text-blue-800">{totalUsers.toLocaleString()}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs text-green-600 font-medium">Overall Conversion</p>
            <p className="text-lg font-bold text-green-800">{overallConversion.toFixed(1)}%</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-600 font-medium">Best Performing</p>
            <p className="text-sm font-bold text-emerald-800">{bestPerformingNode.name}</p>
            <p className="text-xs text-emerald-600">{(bestPerformingNode.conversionRate || 0).toFixed(1)}%</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-xs text-red-600 font-medium">Needs Attention</p>
            <p className="text-sm font-bold text-red-800">{worstPerformingNode.name}</p>
            <p className="text-xs text-red-600">{(worstPerformingNode.conversionRate || 0).toFixed(1)}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

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
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [stepHeights, setStepHeights] = useState<Record<string, number>>({});
  
  // Render tooltip outside component lifecycle
  useEffect(() => {
    console.log('[DEBUG] Tooltip useEffect triggered:', {
      showTooltips,
      tooltipVisible,
      tooltipContent: tooltipContent ? 'has content' : 'no content',
      tooltipPosition,
      timestamp: new Date().toISOString()
    });
    
    if (showTooltips && tooltipVisible && tooltipContent) {
      console.log('[DEBUG] Creating tooltip element');
      
      const tooltipElement = document.createElement('div');
      tooltipElement.id = 'sankey-tooltip';
      tooltipElement.style.cssText = `
        position: fixed;
        left: ${tooltipPosition.x}px;
        top: ${tooltipPosition.y}px;
        transform: translate(-50%, -100%);
        z-index: 2147483647;
        pointer-events: none;
        user-select: none;
        isolation: isolate;
        background: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        font-size: 14px;
        line-height: 1.5;
        color: #1e293b;
        max-width: 320px;
        border: 1px solid #e2e8f0;
      `;
      
      // Create a simple text-based tooltip instead of trying to render React elements
      console.log('[DEBUG] Tooltip content object:', tooltipContent);
      
      if (tooltipContent.type === 'link') {
        // Handle link tooltip
        const sourceNode = rechartsData.nodes.find(n => n.name === tooltipContent.sourceId);
        const targetNode = rechartsData.nodes.find(n => n.name === tooltipContent.targetId);
        
        console.log('[DEBUG] Found nodes for link tooltip:', { sourceNode, targetNode });
        
        if (sourceNode && targetNode) {
          const linkValue = tooltipContent.value || 0;
          const sourceValue = tooltipContent.sourceValue || sourceNode.value || 0;
          const percentage = ((linkValue / sourceValue) * 100).toFixed(1);
          const conversionRate = tooltipContent.conversionRate || 0;
          
          // Get the actual step names from the nodeMap
          const sourceStepName = nodeMap[sourceNode.name]?.name || sourceNode.name;
          const targetStepName = nodeMap[targetNode.name]?.name || targetNode.name;
          
          console.log('[DEBUG] Link tooltip data:', {
            linkValue,
            sourceValue,
            percentage,
            conversionRate,
            sourceNodeName: sourceStepName,
            targetNodeName: targetStepName
          });
          
          tooltipElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a; font-size: 16px;">
              ${sourceStepName} → ${targetStepName}
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div style="color: #334155;">
                <div style="font-size: 12px; color: #64748b;">Users</div>
                <div style="font-weight: 600; font-size: 18px;">
                  ${linkValue.toLocaleString()}
                </div>
              </div>
              <div style="color: #334155; text-align: right;">
                <div style="font-size: 12px; color: #64748b;">Conversion</div>
                <div style="font-weight: 600; font-size: 18px;">
                  ${percentage}%
                </div>
              </div>
            </div>
            
            <div style="
              padding: 8px 12px; 
              background: ${conversionRate >= 75 ? '#f0fdf4' : conversionRate >= 40 ? '#fffbeb' : '#fef2f2'};
              border-radius: 6px;
              border: 1px solid ${conversionRate >= 75 ? '#bbf7d0' : conversionRate >= 40 ? '#fed7aa' : '#fecaca'};
            ">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
                Performance
              </div>
              <div style="
                font-weight: 600;
                color: ${conversionRate >= 75 ? '#059669' : conversionRate >= 40 ? '#d97706' : '#dc2626'};
              ">
                ${conversionRate >= 75 ? 'Excellent' : conversionRate >= 40 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          `;
          
          console.log('[DEBUG] Link tooltip HTML generated:', tooltipElement.innerHTML);
        } else {
          console.log('[DEBUG] Could not find source or target node for link tooltip:', {
            sourceId: tooltipContent.sourceId,
            targetId: tooltipContent.targetId,
            availableNodes: rechartsData.nodes.map(n => ({ name: n.name, id: n.name }))
          });
          
          // Fallback tooltip for link
          tooltipElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a; font-size: 16px;">
              Flow Information
            </div>
            <div style="color: #334155;">
              <div style="font-size: 12px; color: #64748b;">Users</div>
              <div style="font-weight: 600; font-size: 18px;">
                ${(tooltipContent.value || 0).toLocaleString()}
              </div>
            </div>
          `;
        }
      } else if (tooltipContent.type === 'node') {
        // Handle node tooltip
        const nodeValue = tooltipContent.value || 0;
        const percentage = tooltipContent.percentage || 0;
        const conversionRate = tooltipContent.conversionRate || 0;
        
        // Get the actual step name from the nodeMap
        const stepName = nodeMap[tooltipContent.nodeId]?.name || tooltipContent.nodeId;
        
        console.log('[DEBUG] Node tooltip data:', {
          nodeValue,
          percentage,
          conversionRate,
          stepName
        });
        
        tooltipElement.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a; font-size: 16px;">
            ${stepName}
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="color: #334155;">
              <div style="font-size: 12px; color: #64748b;">Users</div>
              <div style="font-weight: 600; font-size: 18px;">
                ${nodeValue.toLocaleString()}
              </div>
            </div>
            <div style="color: #334155; text-align: right;">
              <div style="font-size: 12px; color: #64748b;">% of Total</div>
              <div style="font-weight: 600; font-size: 18px;">
                ${percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          
          ${conversionRate > 0 ? `
            <div style="
              padding: 8px 12px; 
              background: ${conversionRate >= 75 ? '#f0fdf4' : conversionRate >= 40 ? '#fffbeb' : '#fef2f2'};
              border-radius: 6px;
              border: 1px solid ${conversionRate >= 75 ? '#bbf7d0' : conversionRate >= 40 ? '#fed7aa' : '#fecaca'};
            ">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
                Conversion Rate
              </div>
              <div style="
                font-weight: 600;
                color: ${conversionRate >= 75 ? '#059669' : conversionRate >= 40 ? '#d97706' : '#dc2626'};
              ">
                ${conversionRate.toFixed(1)}%
              </div>
            </div>
          ` : ''}
        `;
        
        console.log('[DEBUG] Node tooltip HTML generated:', tooltipElement.innerHTML);
      } else {
        console.log('[DEBUG] Unknown tooltip type:', tooltipContent.type);
        
        // Fallback tooltip for unknown type
        tooltipElement.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a; font-size: 16px;">
            Information
          </div>
          <div style="color: #334155;">
            <div style="font-size: 12px; color: #64748b;">Users</div>
            <div style="font-weight: 600; font-size: 18px;">
              ${(tooltipContent.value || 0).toLocaleString()}
            </div>
          </div>
        `;
      }
      
      console.log('[DEBUG] Tooltip element created:', {
        id: tooltipElement.id,
        style: tooltipElement.style.cssText,
        content: tooltipElement.innerHTML,
        position: { x: tooltipPosition.x, y: tooltipPosition.y }
      });
      
      document.body.appendChild(tooltipElement);
      
      console.log('[DEBUG] Tooltip added to DOM:', {
        bodyChildren: document.body.children.length,
        tooltipInBody: document.body.contains(tooltipElement),
        tooltipZIndex: tooltipElement.style.zIndex
      });
      
      return () => {
        console.log('[DEBUG] Cleaning up tooltip element');
        if (document.body.contains(tooltipElement)) {
          document.body.removeChild(tooltipElement);
          console.log('[DEBUG] Tooltip removed from DOM');
        }
      };
    } else {
      console.log('[DEBUG] Tooltip conditions not met:', {
        showTooltips,
        tooltipVisible,
        hasContent: !!tooltipContent
      });
    }
  }, [showTooltips, tooltipVisible, tooltipContent, tooltipPosition]);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => {
      const newZoom = Math.min(prev * 1.2, 3);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev / 1.2, 0.3);
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPan(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => {
      const newZoom = Math.max(0.3, Math.min(3, prev * delta));
      return newZoom;
    });
  };

  // Transform data for Recharts Sankey with enhanced properties
  const enhancedData = {
    nodes: rechartsData.nodes.map((node, index) => ({
      ...node,
      name: node.name,
      value: node.value || 0,
      index,
      conversionRate: 0 // Will be calculated in the component
    })),
    links: rechartsData.links.map(link => {
      return {
        source: link.source,
        target: link.target,
        value: link.value || 0,
        sourceId: link.sourceId || '',
        targetId: link.targetId || '',
        conversionRate: link.conversionRate || 0,
        sourceValue: link.sourceValue || 0
      };
    })
  };

  // Handle step height changes
  const handleStepHeightChange = React.useCallback((stepName: string, height: number) => {
    setStepHeights(prev => {
      // Only update if the height actually changed
      if (prev[stepName] !== height) {
        return {
          ...prev,
          [stepName]: height
        };
      }
      return prev;
    });
  }, []);

  // Add wheel event listener with non-passive mode
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => {
        const newZoom = Math.max(0.3, Math.min(3, prev * delta));
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [zoom]);

  const handleNodeHover = (event: any, node: any) => {
    console.log('[DEBUG] Node hover triggered:', {
      event: { clientX: event.clientX, clientY: event.clientY },
      node,
      showTooltips,
      interactiveTooltips,
      timestamp: new Date().toISOString()
    });
    
    if (!showTooltips || !interactiveTooltips) {
      console.log('[DEBUG] Tooltips disabled, returning');
      return;
    }
    
    const nodeValue = node.value || 0;
    const percentage = ((nodeValue / initialValue) * 100).toFixed(1);
    const conversionRate = node.conversionRate || 0;
    
    // Pass the node data as an object instead of a React element
    const tooltipData = {
      type: 'node',
      nodeId: node.name || node.id,
      value: nodeValue,
      percentage: parseFloat(percentage),
      conversionRate: conversionRate
    };
    
    console.log('[DEBUG] Setting tooltip state in handleNodeHover:', {
      position: { x: event.clientX, y: event.clientY },
      visible: true,
      content: 'Node data object created',
      tooltipData
    });
    
    setTooltipContent(tooltipData);
    
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    setTooltipVisible(true);
    setSelectedNode(node.name || node.id);
  };

  const handleLinkHover = (event: any, link: any) => {
    console.log('[DEBUG] Link hover triggered:', {
      event: { clientX: event.clientX, clientY: event.clientY },
      link,
      showTooltips,
      interactiveTooltips,
      timestamp: new Date().toISOString()
    });
    
    if (!showTooltips || !interactiveTooltips) {
      console.log('[DEBUG] Tooltips disabled, returning');
      return;
    }
    
    const sourceNode = rechartsData.nodes.find(n => n.name === link.sourceId);
    const targetNode = rechartsData.nodes.find(n => n.name === link.targetId);
    
    if (!sourceNode || !targetNode) return;
    
    const linkValue = link.value;
    const sourceValue = link.sourceValue || sourceNode.value;
    const percentage = ((linkValue / sourceValue) * 100).toFixed(1);
    const conversionRate = link.conversionRate || 0;
    
    // Pass the link data instead of a React element
    const tooltipData = {
      type: 'link',
      sourceId: link.sourceId,
      targetId: link.targetId,
      value: linkValue,
      sourceValue: sourceValue,
      conversionRate: conversionRate
    };
    
    console.log('[DEBUG] Setting tooltip state in handleLinkHover:', {
      position: { x: event.clientX, y: event.clientY },
      visible: true,
      content: 'Link data object created',
      tooltipData
    });
    
    setTooltipContent(tooltipData);
    
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    setTooltipVisible(true);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: '#f8fafc',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Performance Metrics */}
      <PerformanceMetrics data={enhancedData} initialValue={initialValue} />
      
      <SankeyLegend />
      
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        gap: '8px'
      }}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: zoom >= 3 ? '#f1f5f9' : '#ffffff',
                  color: zoom >= 3 ? '#94a3b8' : '#64748b',
                  cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ZoomIn size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.3}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: zoom <= 0.3 ? '#f1f5f9' : '#ffffff',
                  color: zoom <= 0.3 ? '#94a3b8' : '#64748b',
                  cursor: zoom <= 0.3 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ZoomOut size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleResetZoom}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <RotateCcw size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Zoom Level Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 10,
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '500'
      }}>
        {Math.round(zoom * 100)}%
      </div>
      
      <div 
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }} 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.1s ease',
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={enhancedData}
              node={(props) => <EnhancedNode {...props} onStepHeightChange={handleStepHeightChange} totalNodes={enhancedData?.nodes?.length || 0} handleNodeHover={handleNodeHover} setTooltipVisible={setTooltipVisible} setSelectedNode={setSelectedNode} />}
              link={(props) => <EnhancedLink {...props} stepHeights={stepHeights} handleLinkHover={handleLinkHover} setTooltipVisible={setTooltipVisible} />}
              nodePadding={24}
              nodeWidth={20}
              width={dimensions.width}
              height={dimensions.height}
              margin={{ top: 80, right: 80, bottom: 80, left: 80 }}
              iterations={64}
            />
          </ResponsiveContainer>
        </div>
      </div>
      

    </div>
  );
};