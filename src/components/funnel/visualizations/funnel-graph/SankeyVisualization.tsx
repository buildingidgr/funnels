import React, { useRef, useState, useMemo, useEffect } from 'react';
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
    <g className={`sankey-node-group ${isSplit ? 'sankey-split-node' : ''}`}>
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
      
      {/* Step name label - positioned above the node for better visibility */}
      <text
        x={x + width / 2}
        y={y - 8}
        textAnchor="middle"
        className="sankey-step-label"
        style={{
          fontSize: '12px',
          fontWeight: '600',
          fill: '#1f2937',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
          paintOrder: 'stroke fill',
          stroke: 'white',
          strokeWidth: '3px',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
      >
        {payload.name}
      </text>
      
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      
      {/* Hover tooltip with flow details */}
      {isHovered && (
        <g>
          {/* Background for tooltip */}
          <rect
            x={(sourceX + targetX) / 2 - 40}
            y={(sourceY + targetY) / 2 - 25}
            width={80}
            height={50}
            fill="rgba(0, 0, 0, 0.85)"
            rx={6}
            ry={6}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
          />
          
          {/* Flow percentage */}
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 8}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight="700"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {percentage.toFixed(1)}%
          </text>
          
          {/* User count */}
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 + 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={10}
            fontWeight="500"
          >
            {payload.value.toLocaleString()} users
          </text>
          
          {/* Conversion rate if available */}
          {conversionRate > 0 && (
            <text
              x={(sourceX + targetX) / 2}
              y={(sourceY + targetY) / 2 + 22}
              textAnchor="middle"
              fill={isHighConversion ? '#10b981' : isLowConversion ? '#ef4444' : '#fbbf24'}
              fontSize={9}
              fontWeight="600"
            >
              {conversionRate.toFixed(1)}% conversion
            </text>
          )}
        </g>
      )}
      
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
    if (!showTooltips || !interactiveTooltips) return;
    
    const nodeValue = node.value || 0;
    const percentage = ((nodeValue / initialValue) * 100).toFixed(1);
    const conversionRate = node.conversionRate || 0;
    
    setTooltipContent(
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontSize: '14px',
        lineHeight: 1.5,
        color: '#1e293b',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'opacity 0.2s ease',
        maxWidth: '320px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: 8, 
          color: '#0f172a',
          fontSize: '16px'
        }}>
          {node.name}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#334155' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Users</div>
            <div style={{ fontWeight: 600, fontSize: '18px' }}>
              {(nodeValue || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ color: '#334155', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>% of Total</div>
            <div style={{ fontWeight: 600, fontSize: '18px' }}>
              {percentage}%
            </div>
          </div>
        </div>
        
        {conversionRate > 0 && (
          <div style={{ 
            padding: '8px 12px', 
            background: conversionRate >= 75 ? '#f0fdf4' : 
                       conversionRate >= 40 ? '#fffbeb' : '#fef2f2',
            borderRadius: '6px',
            border: `1px solid ${conversionRate >= 75 ? '#bbf7d0' : 
                                 conversionRate >= 40 ? '#fed7aa' : '#fecaca'}`
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b',
              marginBottom: 2
            }}>
              Conversion Rate
            </div>
            <div style={{ 
              fontWeight: 600,
              color: conversionRate >= 75 ? '#059669' : 
                     conversionRate >= 40 ? '#d97706' : '#dc2626'
            }}>
              {conversionRate.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    );
    
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    setTooltipVisible(true);
    setSelectedNode(node.name);
  };

  const handleLinkHover = (event: any, link: any) => {
    if (!showTooltips || !interactiveTooltips) return;
    
    const sourceNode = rechartsData.nodes.find(n => n.name === link.sourceId);
    const targetNode = rechartsData.nodes.find(n => n.name === link.targetId);
    
    if (!sourceNode || !targetNode) return;
    
    const linkValue = link.value;
    const sourceValue = link.sourceValue || sourceNode.value;
    const percentage = ((linkValue / sourceValue) * 100).toFixed(1);
    const conversionRate = link.conversionRate || 0;
    
    setTooltipContent(
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontSize: '14px',
        lineHeight: 1.5,
        color: '#1e293b',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'opacity 0.2s ease',
        maxWidth: '320px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: 8, 
          color: '#0f172a',
          fontSize: '16px'
        }}>
          {sourceNode.name} → {targetNode.name}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#334155' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Users</div>
            <div style={{ fontWeight: 600, fontSize: '18px' }}>
              {(linkValue || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ color: '#334155', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Conversion</div>
            <div style={{ fontWeight: 600, fontSize: '18px' }}>
              {percentage}%
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: '8px 12px', 
          background: conversionRate >= 75 ? '#f0fdf4' : 
                     conversionRate >= 40 ? '#fffbeb' : '#fef2f2',
          borderRadius: '6px',
          border: `1px solid ${conversionRate >= 75 ? '#bbf7d0' : 
                               conversionRate >= 40 ? '#fed7aa' : '#fecaca'}`
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b',
            marginBottom: 2
          }}>
            Performance
          </div>
          <div style={{ 
            fontWeight: 600,
            color: conversionRate >= 75 ? '#059669' : 
                   conversionRate >= 40 ? '#d97706' : '#dc2626'
          }}>
            {conversionRate >= 75 ? 'Excellent' : 
             conversionRate >= 40 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
      </div>
    );
    
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
          height: '100%'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={enhancedData}
              node={(props) => <EnhancedNode {...props} onStepHeightChange={handleStepHeightChange} />}
              link={(props) => <EnhancedLink {...props} stepHeights={stepHeights} />}
              nodePadding={24}
              nodeWidth={20}
              width={dimensions.width}
              height={dimensions.height}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              iterations={64}
              onMouseEnter={handleNodeHover}
              onMouseLeave={() => {
                setTooltipVisible(false);
                setSelectedNode(null);
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>
      
      {showTooltips && tooltipVisible && tooltipContent && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};