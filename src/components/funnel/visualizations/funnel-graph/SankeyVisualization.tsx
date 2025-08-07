import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Sankey, ResponsiveContainer } from 'recharts';
import { SankeyNode, SankeyLink } from './types';
import { SankeyLegend } from './components/SankeyLegend';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Target, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
    low: '#6b7280', // Gray for low conversion (CHANGED FROM RED)
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
    name: payload.name,
    x,
    y,
    width,
    height,
    isFirstNode,
    isLastNode
  });
  
  // Removed text positioning calculations since step names are no longer displayed
  
  const isSplit = payload.name.includes('split');
  const isDomestic = payload.name.toLowerCase().includes('domestic');
  const isInternational = payload.name.toLowerCase().includes('international');
  
  // Use the same color array as the legend for consistency
  const stepColors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#06b6d4", // Cyan
  ];
  
  let nodeColor = stepColors[0]; // Default to first color
  
  // Determine node color based on step index or type
  if (isSplit) {
    nodeColor = isDomestic ? STEP_COLORS.split.domestic : STEP_COLORS.split.international;
  } else {
    // Use the payload.color if it exists (from useSankeyData), otherwise fall back to step-based logic
    if (payload.color) {
      nodeColor = payload.color;
    } else {
      // Fallback to step-based color assignment
      switch (payload.name.toLowerCase()) {
        case 'landing page visit':
        case 'support page visit':
        case 'product page visit':
          nodeColor = stepColors[0]; // Blue
          break;
        case 'destination selection':
        case 'support ticket created':
        case 'product interaction':
          nodeColor = stepColors[1]; // Green
          break;
        case 'travel details':
        case 'live chat initiated (optional)':
        case 'add to cart':
          nodeColor = stepColors[2]; // Purple
          break;
        case 'booking':
        case 'agent assigned':
        case 'checkout started':
          nodeColor = stepColors[3]; // Amber
          break;
        case 'confirmation':
        case 'first response sent':
        case 'payment completed':
          nodeColor = stepColors[4]; // Red
          break;
        case 'customer reply':
        case 'order confirmation':
          nodeColor = stepColors[5]; // Cyan
          break;
        default:
          // Use index-based color assignment as fallback
          const stepIndex = parseInt(payload.name.match(/step-(\d+)/)?.[1] || '0');
          nodeColor = stepColors[stepIndex % stepColors.length];
      }
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
      style={{ zIndex: 1 }}
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
      {/* Node background with enhanced styling - COMPLETELY REMOVED STROKES */}
      <rect
        x={x}
        y={y}
        width={width * 1.5} // INCREASED WIDTH
        height={height}
        fill={nodeColor}
        rx={8}
        ry={8}
        className="sankey-node"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          transition: 'all 0.3s ease',
          stroke: 'transparent', // COMPLETELY REMOVED ALL STROKES
          strokeWidth: 0
        }}
      />
      

      
      {/* Removed static step name labels */}
      
      {/* REMOVED WHITE TEXT - User count no longer displayed inside node */}
      
      {/* ENHANCED CONVERSION RATE - MADE TO STAND OUT */}
      {conversionRate > 0 && (
        <>
          {/* Background for conversion rate */}
          <rect
            x={x + (width * 1.5) / 2 - 40}
            y={y + height + 10}
            width={80}
            height={25}
            fill={isHighConversion ? 'rgba(16, 185, 129, 0.9)' : isLowConversion ? 'rgba(107, 114, 128, 0.9)' : 'rgba(251, 191, 36, 0.9)'}
            rx={12}
            ry={12}
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
              stroke: isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#fbbf24',
              strokeWidth: 2
            }}
          />
                    {/* Conversion rate text */}
          <text
            x={x + (width * 1.5) / 2}
            y={y + height + 25}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight="700"
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
        </>
      )}
    </g>
  );
};

// Enhanced link component with better visual feedback and performance indicators
const EnhancedLink = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, stepHeights, nodes, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  console.log('[DEBUG] EnhancedLink rendered:', {
    payload,
    isHovered,
    timestamp: new Date().toISOString()
  });
  
  // Get the handleLinkHover function from props or context
  const handleLinkHover = props.handleLinkHover;
  
  const isSplit = payload.sourceId?.includes('split') || payload.targetId?.includes('split');
  const isSplitToNext = payload.sourceId?.includes('split') && payload.targetId?.includes('step-') && !payload.targetId?.includes('split');
  // Hide the main step → next step connection ONLY when there are split steps in between
  const isMainStepToNextStep = payload.sourceId?.includes('step-') && !payload.sourceId?.includes('-split-') && payload.targetId?.includes('step-') && !payload.targetId?.includes('-split-');
  // Only hide if this is a direct step-to-step connection AND there are split nodes for this step
  const shouldHideMainConnection = isMainStepToNextStep && 
    // Check if the source step has split variations by looking for split nodes with the same step number
    (() => {
      const sourceStepNum = payload.sourceId?.match(/step-(\d+)/)?.[1];
      if (!sourceStepNum) return false;
      
      // Check if there are split nodes for this step by looking for nodes with the same step number + "-split-"
      const hasSplitNodes = nodes?.some(node => 
        node.name?.includes(`step-${sourceStepNum}-split-`)
      );
      
      return hasSplitNodes;
    })();
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
    // Make split links completely invisible
    linkColor = 'transparent';
  } else if (isHighConversion) {
    linkColor = STEP_COLORS.links.high;
  } else if (isLowConversion) {
    linkColor = '#6b7280'; // CHANGED FROM RED TO GRAY
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
      style={{ zIndex: 1000 }}
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
      
      {/* Enhanced background flow path with gradient */}
      <defs>
        <linearGradient id={`gradient-${payload.sourceId}-${payload.targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
          <stop offset="50%" stopColor={isHighConversion ? '#34d399' : isLowConversion ? '#9ca3af' : '#60a5fa'} stopOpacity="0.6" />
          <stop offset="100%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {/* Background flow path with gradient fill */}
      <path
        d={path}
        fill="none"
        stroke={`url(#gradient-${payload.sourceId}-${payload.targetId})`}
        strokeWidth={shouldHideMainConnection ? 0 : hoverFlowWidth + 4}
        strokeOpacity={isHovered ? 0.8 : 0.5}
        strokeLinecap="round"
        className={`sankey-link-background ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.4s ease',
          filter: isHovered ? 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))' : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))'
        }}
      />
      
      {/* Enhanced main flow path with better colors and effects */}
      <path
        d={path}
        fill="none"
        stroke={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'}
        strokeWidth={shouldHideMainConnection ? 0 : hoverFlowWidth}
        strokeOpacity={isHovered ? 1 : 0.95}
        strokeLinecap="round"
        className={`sankey-link-path ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.4s ease',
          strokeDasharray: isSplit ? '4,2' : isBypass ? '6,3' : 'none',
          filter: isHovered 
            ? 'drop-shadow(0 4px 16px rgba(59, 130, 246, 0.7))' 
            : isHighConversion ? 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))' : 
              isLowConversion ? 'drop-shadow(0 2px 8px rgba(107, 114, 128, 0.4))' : 
              'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))'
        }}
      />
      
      {/* Enhanced flow animation overlay with gradient */}
      <defs>
        <linearGradient id={`flow-gradient-${payload.sourceId}-${payload.targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>
      
      {/* Enhanced flow animation overlay */}
      <path
        d={path}
        fill="none"
        stroke={`url(#flow-gradient-${payload.sourceId}-${payload.targetId})`}
        strokeWidth={shouldHideMainConnection ? 0 : Math.max(hoverFlowWidth / 1.5, 2)}
        strokeOpacity={isHovered ? 0.8 : 0.5}
        strokeLinecap="round"
        className="sankey-link-flow"
        style={{
          animation: 'flowAnimation 3s linear infinite',
          strokeDasharray: '6,6',
          transition: 'all 0.4s ease',
          filter: isHovered ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))' : 'none'
        }}
      />
      
      {/* Removed built-in tooltip - using custom tooltip system instead */}
      
      {/* Enhanced conversion rate label on link */}
      {conversionRate > 0 && payload.value > 20 && !isHovered && !shouldHideMainConnection && (
        <>
          {/* Background for conversion rate label */}
          <rect
            x={(sourceX + targetX) / 2 - 35}
            y={(sourceY + targetY) / 2 - 25}
            width={70}
            height={20}
            fill={isHighConversion ? 'rgba(16, 185, 129, 0.95)' : isLowConversion ? 'rgba(107, 114, 128, 0.95)' : 'rgba(59, 130, 246, 0.95)'}
            rx={10}
            ry={10}
            style={{
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))',
              stroke: isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6',
              strokeWidth: 1.5
            }}
          />
          {/* Conversion rate text */}
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 12}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontWeight="800"
            className="sankey-link-label"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              paintOrder: 'stroke fill',
              stroke: 'rgba(0, 0, 0, 0.4)',
              strokeWidth: '1px'
            }}
          >
            {conversionRate.toFixed(1)}%
          </text>
        </>
      )}
    </g>
  );
};

// Enhanced CSS animations for flow effects with proper layering
const styles = `
  @keyframes flowAnimation {
    from {
      stroke-dashoffset: 12;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4));
    }
    50% {
      filter: drop-shadow(0 4px 16px rgba(59, 130, 246, 0.8));
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
  
  .sankey-node-group {
    z-index: 1;
    pointer-events: auto;
    position: relative;
  }
  
  .sankey-link-group {
    z-index: 1000;
    pointer-events: auto;
    position: relative;
  }
  
  /* Force links to render on top of nodes */
  .recharts-sankey-links {
    z-index: 1000 !important;
    position: relative;
  }
  
  .recharts-sankey-nodes {
    z-index: 1 !important;
    position: relative;
  }
  
  /* Additional CSS to ensure proper layering */
  .recharts-sankey {
    position: relative;
  }
  
  .recharts-sankey .recharts-sankey-links {
    z-index: 1000 !important;
    transform: translateZ(0);
    will-change: transform;
  }
  
  .recharts-sankey .recharts-sankey-nodes {
    z-index: 1 !important;
    transform: translateZ(0);
    will-change: transform;
  }
  
  /* Force links to be rendered after nodes */
  .recharts-sankey-links {
    position: relative !important;
    z-index: 1000 !important;
    transform: translateZ(0);
    order: 2;
  }
  
  .recharts-sankey-nodes {
    position: relative !important;
    z-index: 1 !important;
    transform: translateZ(0);
    order: 1;
  }
  
  .sankey-bypass-link {
    stroke-dasharray: 8,4;
    opacity: 0.85;
    stroke-linecap: round;
  }
  
  .sankey-optional-link {
    stroke-dasharray: 4,3;
    opacity: 0.9;
    stroke-linecap: round;
  }
  
  .sankey-split-link {
    stroke-dasharray: 6,3;
    opacity: 0.9;
    stroke-linecap: round;
  }
  
  .sankey-link-path:hover {
    stroke-width: calc(var(--stroke-width) + 3px);
    opacity: 1;
    animation: pulseGlow 2s ease-in-out infinite;
  }
  
  .sankey-link-background {
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sankey-link-path {
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sankey-link-flow {
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Force SVG elements to respect z-index */
  .recharts-sankey svg {
    position: relative;
  }
  
  .recharts-sankey svg g {
    position: relative;
  }
  
  /* Force links to be rendered last using CSS selectors */
  .recharts-sankey .recharts-sankey-links:last-child {
    z-index: 1000 !important;
  }
  
  /* Additional CSS to ensure proper layering */
  .recharts-sankey .recharts-sankey-links {
    z-index: 1000 !important;
    position: relative !important;
  }
  
  .recharts-sankey .recharts-sankey-nodes {
    z-index: 1 !important;
    position: relative !important;
  }
  
  /* Force the entire SVG to use proper stacking context */
  .recharts-sankey svg {
    position: relative !important;
    z-index: 1;
  }
  
  /* Ensure all child elements inherit the stacking context */
  .recharts-sankey svg * {
    position: relative;
  }
  
  /* More aggressive SVG layering approach */
  .recharts-sankey .recharts-sankey-links {
    z-index: 9999 !important;
    position: relative !important;
    transform: translateZ(0);
  }
  
  .recharts-sankey .recharts-sankey-nodes {
    z-index: 1 !important;
    position: relative !important;
    transform: translateZ(0);
  }
`;

// Performance metrics component
const PerformanceMetrics = ({ data, initialValue }: { data: any, initialValue: number }) => {
  // Find the last step (final users who completed the flow)
  // The last step should be the one with the highest index or the last node in the array
  const lastStep = data.nodes.length > 0 ? data.nodes[data.nodes.length - 1] : null;
  const totalUsers = lastStep ? lastStep.value : 0;
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
  
  // Update dimensions when container resizes
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
    console.log('[DEBUG] Zoom in clicked, current zoom:', zoom);
    setZoom(prev => {
      const newZoom = Math.min(prev * 1.2, 3);
      console.log('[DEBUG] New zoom level:', newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    console.log('[DEBUG] Zoom out clicked, current zoom:', zoom);
    setZoom(prev => {
      const newZoom = Math.max(prev / 1.2, 0.9);
      console.log('[DEBUG] New zoom level:', newZoom);
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    console.log('[DEBUG] Reset zoom clicked');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      console.log('[DEBUG] Mouse down - starting drag');
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
      console.log('[DEBUG] Mouse move - pan:', newPan);
      setPan(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    console.log('[DEBUG] Wheel event triggered:', { deltaY: e.deltaY, currentZoom: zoom });
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => {
      const newZoom = Math.max(0.9, Math.min(3, prev * delta));
      console.log('[DEBUG] Wheel zoom - old:', prev, 'new:', newZoom);
      return newZoom;
    });
  };

  // Transform data for Recharts Sankey with enhanced properties
  const enhancedData = {
    nodes: rechartsData.nodes.map((node, index) => ({
      name: node.name,
      value: node.value || 0,
      color: node.color,
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

  // Debug the enhanced data structure
  console.log('[DEBUG] Enhanced data structure:', {
    nodesCount: enhancedData.nodes.length,
    linksCount: enhancedData.links.length,
    nodes: enhancedData.nodes.map(n => ({ name: n.name, value: n.value, index: n.index })),
    links: enhancedData.links.map(l => ({ source: l.source, target: l.target, value: l.value })),
    // Add more detailed debugging for potential issues
    hasZeroValues: enhancedData.nodes.some(n => n.value === 0),
    hasNegativeValues: enhancedData.nodes.some(n => n.value < 0),
    hasInvalidLinks: enhancedData.links.some(l => l.source < 0 || l.target < 0 || l.source >= enhancedData.nodes.length || l.target >= enhancedData.nodes.length),
    linkSourceTargets: enhancedData.links.map(l => ({ source: l.source, target: l.target, sourceValid: l.source >= 0 && l.source < enhancedData.nodes.length, targetValid: l.target >= 0 && l.target < enhancedData.nodes.length }))
  });

  // Validate data before passing to Sankey
  const isValidData = enhancedData.nodes.length > 0 && 
                     enhancedData.links.length > 0 && 
                     enhancedData.nodes.every(n => typeof n.value === 'number' && n.value > 0) &&
                     enhancedData.links.every(l => typeof l.value === 'number' && l.value > 0) &&
                     enhancedData.links.every(l => l.source >= 0 && l.target >= 0 && l.source < enhancedData.nodes.length && l.target < enhancedData.nodes.length);

  console.log('[DEBUG] Data validation:', {
    isValidData,
    nodesValid: enhancedData.nodes.every(n => typeof n.value === 'number' && n.value > 0),
    linksValid: enhancedData.links.every(l => typeof l.value === 'number' && l.value > 0),
    linkIndicesValid: enhancedData.links.every(l => l.source >= 0 && l.target >= 0 && l.source < enhancedData.nodes.length && l.target < enhancedData.nodes.length),
    nodeValues: enhancedData.nodes.map(n => n.value),
    linkValues: enhancedData.links.map(l => l.value),
    linkIndices: enhancedData.links.map(l => ({ source: l.source, target: l.target, nodesLength: enhancedData.nodes.length }))
  });

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
        const newZoom = Math.max(0.9, Math.min(3, prev * delta));
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  // Debug container dimensions
  useEffect(() => {
    console.log('[DEBUG] Container dimensions:', { 
      width: containerRef.current?.clientWidth, 
      height: containerRef.current?.clientHeight,
      isValidData,
      nodesCount: enhancedData.nodes.length,
      linksCount: enhancedData.links.length
    });
    if (isValidData) {
      console.log('[DEBUG] Rendering Sankey with data:', { nodesCount: enhancedData.nodes.length, linksCount: enhancedData.links.length });
    }
  }, [isValidData, enhancedData.nodes.length, enhancedData.links.length]);

  // Debug zoom and pan changes
  useEffect(() => {
    console.log('[DEBUG] Zoom/Pan state changed:', { zoom, pan, isDragging });
  }, [zoom, pan, isDragging]);

  const handleNodeHover = (event: any, node: any) => {
    console.log('[DEBUG] Node hover triggered:', {
      event: { clientX: event.clientX, clientY: event.clientY },
      node,
      nodeId: node.id,
      nodeName: node.name,
      nodeValue: node.value,
      showTooltips,
      interactiveTooltips,
      timestamp: new Date().toISOString()
    });
    
    if (!showTooltips || !interactiveTooltips) {
      console.log('[DEBUG] Tooltips disabled, returning');
      return;
    }
    
    // Get the correct node data from nodeMap or enhancedData
    const nodeId = node.name || node.id;
    const correctNode = nodeMap[nodeId] || enhancedData.nodes.find(n => n.name === nodeId);
    const nodeValue = correctNode?.value || node.value || 0;
    const percentage = ((nodeValue / initialValue) * 100).toFixed(1);
    const conversionRate = node.conversionRate || 0;
    

    
    // Pass the node data as an object instead of a React element
    const tooltipData = {
      type: 'node',
      nodeId: nodeId,
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
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Performance Metrics */}
      {/* REMOVE the PerformanceMetrics legend grid and its function */}
      
      <SankeyLegend />
      
      {/* Zoom Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#64748b',
        maxWidth: '200px',
        opacity: zoom === 1 && pan.x === 0 && pan.y === 0 ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none'
      }}>
        <div style={{fontWeight: '600', marginBottom: '4px'}}>Navigation</div>
        <div>• Scroll to zoom</div>
        <div>• Drag to pan</div>
        <div>• Use controls to reset</div>
      </div>
      
      {/* Zoom Controls */}
      {/* REMOVE the Zoom Controls div */}
      
      {/* Zoom Level Indicator and Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: zoom !== 1 || pan.x !== 0 || pan.y !== 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease'
      }}>
        <span style={{
          minWidth: 40, 
          textAlign: 'right', 
          fontWeight: '600',
          color: zoom !== 1 || pan.x !== 0 || pan.y !== 0 ? '#3b82f6' : '#64748b'
        }}>{Math.round(zoom * 100)}%</span>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#3b82f6',
            animation: 'pulse 2s infinite'
          }} />
        )}
        <div style={{display: 'flex', gap: '8px'}}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: zoom >= 3 ? '#f1f5f9' : '#ffffff', color: zoom >= 3 ? '#94a3b8' : '#64748b',
                    cursor: zoom >= 3 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
                  disabled={zoom <= 0.9}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: zoom <= 0.9 ? '#f1f5f9' : '#ffffff', color: zoom <= 0.9 ? '#94a3b8' : '#64748b',
                    cursor: zoom <= 0.9 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: '#ffffff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <RotateCcw size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div 
        style={{
          flex: 1,
          width: '100%',
          height: '400px',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          position: 'relative'
        }} 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {isValidData ? (
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={enhancedData}
                node={(props) => <EnhancedNode {...props} onStepHeightChange={handleStepHeightChange} totalNodes={enhancedData?.nodes?.length || 0} handleNodeHover={handleNodeHover} setTooltipVisible={setTooltipVisible} setSelectedNode={setSelectedNode} />}
                link={(props) => {
                  // Only render regular (non-optional) links in the main component
                  const isOptionalLink = props.payload.sourceId?.includes('step-') && 
                                       props.payload.targetId?.includes('step-') && 
                                       Math.abs(parseInt(props.payload.sourceId.split('-')[1]) - parseInt(props.payload.targetId.split('-')[1])) > 1;
                  
                  if (!isOptionalLink) {
                    return <EnhancedLink {...props} stepHeights={stepHeights} handleLinkHover={handleLinkHover} setTooltipVisible={setTooltipVisible} nodes={rechartsData.nodes} />;
                  }
                  return null;
                }}
                nodePadding={200}
                nodeWidth={20}
                margin={{ top: 80, right: 200, bottom: 80, left: 200 }}
                iterations={64}
              />
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
              <p>Invalid data for visualization</p>
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
};