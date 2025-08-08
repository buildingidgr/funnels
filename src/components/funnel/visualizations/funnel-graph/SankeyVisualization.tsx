import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Sankey, ResponsiveContainer } from 'recharts';
import { SankeyNode, SankeyLink } from './types';
import { SankeyLegend } from './components/SankeyLegend';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Target, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CustomTooltip from './components/CustomTooltip';

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
const EnhancedNode = ({ x, y, width, height, index, payload, preCalculatedStepHeights, ...props }: any) => {
  // Determine if this is the first or last node to adjust text positioning
  const isFirstNode = index === 0;
  const isLastNode = index === (props.totalNodes - 1);
  const isOptionalNode = !!props?.rechartsNodes?.[index]?.isOptional || !!payload?.isOptional;
  const optionalFlagOrigin = {
    fromRechartsNode: !!props?.rechartsNodes?.[index]?.isOptional,
    fromPayload: !!payload?.isOptional
  };
  
  // Debug logging to see what's being passed to the node
  const finalHeight = preCalculatedStepHeights[payload.name] || (height > 0 ? height : 30);
  const yOffset = (finalHeight - height) / 2;
  const finalY = y - yOffset;
  
  console.log(`[DEBUG] EnhancedNode props for index ${index}:`, {
    payload,
    name: payload.name,
    x,
    y,
    width,
    height,
    preCalculatedHeight: preCalculatedStepHeights[payload.name],
    validatedHeight: finalHeight,
    yOffset,
    finalY,
    nodeValue: payload.value,
    isFirstNode,
    isLastNode,
    isOptionalNode,
    optionalFlagOrigin
  });

  // Report layout to parent for cross-checking link endpoints vs node edges
  React.useEffect(() => {
    const computedWidth = width * 1.5;
    const layoutMetrics = {
      x,
      yOriginal: y,
      widthOriginal: width,
      heightOriginal: height,
      xLeft: x,
      xRight: x + computedWidth,
      yTop: finalY,
      yBottom: finalY + finalHeight,
      yCenter: finalY + finalHeight / 2,
      width: computedWidth,
      height: finalHeight,
    };
    if (props.onNodeLayout && typeof props.onNodeLayout === 'function') {
      props.onNodeLayout(payload.name, layoutMetrics);
    }
    console.log('[DEBUG] Node layout computed:', { id: payload.name, ...layoutMetrics });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y, width, height, finalY, finalHeight, payload?.name]);
  
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
      // Use our pre-calculated proportional height instead of Sankey-calculated height
      const preCalculatedHeight = preCalculatedStepHeights[payload.name];
      
      // Use pre-calculated height if available, otherwise calculate based on node value
      let validHeight = preCalculatedHeight;
      if (!validHeight) {
        const nodeValue = payload.value || 0;
        const maxValue = 10000; // Assume max value for scaling
        const minHeight = 30; // Minimum reasonable height
        const maxHeight = 200; // Maximum reasonable height
        
        // Calculate height proportionally based on node value
        validHeight = minHeight;
        if (maxValue > 0) {
          validHeight = Math.max(minHeight, Math.min(maxHeight, (nodeValue / maxValue) * 150 + 30));
        }
      }
      
      props.onStepHeightChange(payload.name, validHeight);
    }
  }, [height, payload.name, payload.value, props.onStepHeightChange, preCalculatedStepHeights]);



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
      {/* Node background with enhanced styling */}
      <rect
        x={x} // Use original x coordinate
        y={finalY} // Center the node vertically
        width={width * 1.5} // Use original width
        height={finalHeight} // Use pre-calculated height
        fill={nodeColor}
        rx={8}
        ry={8}
        className="sankey-node"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          transition: 'all 0.3s ease',
          // keep base rect without stroke; draw optional outline as a separate overlay so it stays on top
          stroke: 'transparent',
          strokeWidth: 0
        }}
      />

      {/* Optional indicator INSIDE the column */}
      {isOptionalNode && (() => {
        // Compute inline marker positions so we can log them
        // Place badge inside top-left of the column for maximum contrast and to avoid right-edge overlaps
        const markerRectW = 28;
        const markerRectH = 16;
        const markerRectX = x + 8;
        const markerRectY = finalY + 6;
        const markerTextX = markerRectX + markerRectW / 2;
        const markerTextY = markerRectY + markerRectH * 0.68;
        // Compute containment and overlap diagnostics
        const nodeBounds = {
          left: x,
          right: x + (width * 1.5),
          top: finalY,
          bottom: finalY + finalHeight,
          width: width * 1.5,
          height: finalHeight
        };
        const markerBounds = {
          left: markerRectX,
          right: markerRectX + markerRectW,
          top: markerRectY,
          bottom: markerRectY + markerRectH,
          width: markerRectW,
          height: markerRectH
        };
        const isContained = 
          markerBounds.left >= nodeBounds.left &&
          markerBounds.right <= nodeBounds.right &&
          markerBounds.top >= nodeBounds.top &&
          markerBounds.bottom <= nodeBounds.bottom;
        try {
          console.log('[DEBUG] Optional marker inline render:', {
            nodeId: payload.name,
            index,
            isOptionalNode,
            optionalFlagOrigin,
            rect: { x: markerRectX, y: markerRectY, w: markerRectW, h: markerRectH },
            text: { x: markerTextX, y: markerTextY },
            nodeBounds,
            markerBounds,
            isContained
          });
        } catch {}
        return (
          <g className="sankey-node-optional-inline" style={{ pointerEvents: 'none' }}>
            <rect
              x={markerRectX}
              y={markerRectY}
              width={markerRectW}
              height={markerRectH}
              rx={7}
              ry={7}
              fill={'rgba(255,255,255,0.95)'}
              stroke={'#7c3aed'}
              strokeWidth={1.25}
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
            />
            <text
              x={markerTextX}
              y={markerTextY}
              textAnchor="middle"
              fontSize={9}
              fontWeight={800}
              fill={'#4c1d95'}
              style={{ letterSpacing: 0.5, paintOrder: 'stroke', stroke: 'white', strokeWidth: 2 }}
            >
              OPT
            </text>
          </g>
        );
      })()}


      
      {/* Removed static step name labels */}
      
      {/* REMOVED WHITE TEXT - User count no longer displayed inside node */}
      
      {/* ENHANCED CONVERSION RATE - MADE TO STAND OUT */}
      {conversionRate > 0 && (
        <>
          {/* Background for conversion rate */}
          <rect
            x={x + (width * 1.5) / 2 - 40}
            y={finalY + finalHeight + 10}
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
            y={finalY + finalHeight + 25}
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
const EnhancedLink = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, stepHeights, nodes, preCalculatedStepHeights, ...props }: any) => {
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
  const isInitialBypass = payload.sourceId === 'initial' && !payload.targetId?.includes('step-1');
  const isOptional = payload.sourceId?.includes('step-') && payload.targetId?.includes('step-') && 
                     Math.abs(parseInt(payload.sourceId.split('-')[1]) - parseInt(payload.targetId.split('-')[1])) > 1;
  const isBypass = isInitialBypass || isOptional;

  // Classification log for link types
  try {
    console.log('[DEBUG] Link classification:', {
      sourceId: payload.sourceId,
      targetId: payload.targetId,
      isSplit,
      isMainStepToNextStep,
      isSplitToNext,
      isOptional,
      isBypass,
      shouldHideMainConnection
    });
  } catch {}
  
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
  // Force a distinct color for bypass/optional so it visibly stands out
  if (isBypass) {
    linkColor = '#7c3aed'; // vivid violet
  }

  // Use adjusted endpoints that match our custom node rectangles
  let adjustedSourceX = sourceX;
  let adjustedSourceY = sourceY;
  let adjustedTargetX = targetX;
  let adjustedTargetY = targetY;

  try {
    if (props.getNodeLayout && typeof props.getNodeLayout === 'function') {
      const sourceLayout = props.getNodeLayout(payload.sourceId);
      const targetLayout = props.getNodeLayout(payload.targetId);
      if (sourceLayout) {
        adjustedSourceX = sourceLayout.xRight; // attach from the drawn right edge
        adjustedSourceY = sourceLayout.yCenter; // attach at vertical center of drawn node
      }
      if (targetLayout) {
        adjustedTargetX = targetLayout.xLeft; // attach to the drawn left edge
        adjustedTargetY = targetLayout.yCenter; // attach at vertical center
      }
      // If bypass, re-route anchors to avoid overlapping: snap near top or bottom edges
      if (isBypass && (sourceLayout || targetLayout)) {
        const sourceStepNum = parseInt((payload.sourceId || '').split('-')[1] || '0', 10);
        const routeAbove = isNaN(sourceStepNum) ? true : sourceStepNum % 2 === 0; // alternate to reduce collisions
        const sourceEdgeOffset = sourceLayout ? Math.min(12, Math.max(8, sourceLayout.height * 0.2)) : 10;
        const targetEdgeOffset = targetLayout ? Math.min(12, Math.max(8, targetLayout.height * 0.2)) : 10;
        if (sourceLayout) {
          adjustedSourceY = routeAbove ? (sourceLayout.yTop + sourceEdgeOffset) : (sourceLayout.yBottom - sourceEdgeOffset);
        }
        if (targetLayout) {
          adjustedTargetY = routeAbove ? (targetLayout.yTop + targetEdgeOffset) : (targetLayout.yBottom - targetEdgeOffset);
        }
        console.log('[DEBUG] Bypass routing anchors adjusted:', {
          sourceId: payload.sourceId,
          targetId: payload.targetId,
          routeAbove,
          adjustedSourceY,
          adjustedTargetY,
          sourceEdgeOffset,
          targetEdgeOffset
        });
      }
      console.log('[DEBUG] Adjusted link endpoints:', {
        sourceId: payload.sourceId,
        targetId: payload.targetId,
        adjustedSourceX,
        adjustedSourceY,
        adjustedTargetX,
        adjustedTargetY
      });
      if (sourceLayout) {
        console.log('[DEBUG] Adjusted vs Source node alignment:', {
          sourceId: payload.sourceId,
          nodeRightEdge: sourceLayout.xRight,
          nodeCenterY: sourceLayout.yCenter,
          adjustedSourceX,
          adjustedSourceY,
          deltaX: adjustedSourceX - sourceLayout.xRight,
          deltaY: adjustedSourceY - sourceLayout.yCenter
        });
      }
      if (targetLayout) {
        console.log('[DEBUG] Adjusted vs Target node alignment:', {
          targetId: payload.targetId,
          nodeLeftEdge: targetLayout.xLeft,
          nodeCenterY: targetLayout.yCenter,
          adjustedTargetX,
          adjustedTargetY,
          deltaX: adjustedTargetX - targetLayout.xLeft,
          deltaY: adjustedTargetY - targetLayout.yCenter
        });
      }
    }
  } catch {}

  // Calculate path with different curvature based on link type
  let path;
  const distance = Math.abs(adjustedTargetX - adjustedSourceX);
  const curveOffset = Math.min(distance * 0.15, 30); // Subtle curve, max 30px

  // Strategic log: raw link endpoints and positions
  console.log('[DEBUG] Link endpoints & positions:', {
    sourceId: payload.sourceId,
    targetId: payload.targetId,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    distance,
    curveOffset,
    shouldHideMainConnection,
    isSplit,
    isOptional,
    isBypass
  });
  
  if (isBypass) {
    // Bypass links: route with a noticeable vertical arc above/below other flows
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const arcHeight = Math.max(40, Math.min(120, distance * 0.35));
    const sourceStepNum = parseInt((payload.sourceId || '').split('-')[1] || '0', 10);
    const routeAbove = isNaN(sourceStepNum) ? true : sourceStepNum % 2 === 0; // alternate pathing
    const verticalShift = routeAbove ? -arcHeight : arcHeight;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - 40},${adjustedSourceY + verticalShift} ${midX + 40},${adjustedTargetY + verticalShift} ${adjustedTargetX},${adjustedTargetY}`;
    console.log('[DEBUG] Bypass curvature:', { arcHeight, routeAbove, verticalShift, midX });
  } else if (isOptional) {
    // Optional step links: moderate curve
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - curveOffset},${adjustedSourceY} ${midX + curveOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  } else if (isSplit) {
    // Split links: very subtle curve
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const splitOffset = Math.min(distance * 0.1, 20);
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - splitOffset},${adjustedSourceY} ${midX + splitOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  } else {
    // Regular links: straight with minimal curve
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const regularOffset = Math.min(distance * 0.08, 15);
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - regularOffset},${adjustedSourceY} ${midX + regularOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  }
  
  // Calculate the actual width of the flow path based on source step height
  const sourceValue = payload.sourceValue || payload.value;
  const percentage = sourceValue > 0 ? (payload.value / sourceValue) * 100 : 0;
  
  // Get the actual source step height - prioritize pre-calculated heights for consistency
  // Try multiple keys to find the correct step height
  const possibleKeys = [
    payload.sourceId,
    `step-${payload.source}`,
    payload.sourceId?.replace('step-', ''),
    payload.sourceId?.replace('step-', 'step-')
  ];
  
  // Prioritize pre-calculated heights for consistent proportional sizing
  const sourceStepHeight = preCalculatedStepHeights[payload.sourceId] ||
                          preCalculatedStepHeights[`step-${payload.source}`] ||
                          preCalculatedStepHeights[payload.sourceId?.replace('step-', '')] ||
                          stepHeights[payload.sourceId] || 
                          stepHeights[`step-${payload.source}`] || 
                          stepHeights[payload.sourceId?.replace('step-', '')] ||
                          60; // Use original height
                          
  // Debug the step height lookup
  console.log('[DEBUG] Step height lookup:', {
    sourceId: payload.sourceId,
    source: payload.source,
    possibleKeys,
    stepHeightsKeys: Object.keys(stepHeights),
    preCalculatedKeys: Object.keys(preCalculatedStepHeights),
    foundHeight: sourceStepHeight,
    allStepHeights: stepHeights,
    preCalculatedHeights: preCalculatedStepHeights
  });
  
  // Calculate flow width based on the actual percentage of the source step height
  // This should represent the actual height the flow occupies on the source step
  const flowWidth = (percentage / 100) * sourceStepHeight;
  
  // Scale down the stroke width for better visual representation
  // We'll use a scaling factor to make the stroke width more appropriate
  const strokeWidthScale = 0.3; // Scale factor to make stroke width more reasonable
  const scaledFlowWidth = flowWidth * strokeWidthScale;
  const maxFlowWidth = 30; // Maximum stroke width
  const minFlowWidth = 2;  // Minimum stroke width
  let actualFlowWidth = Math.max(minFlowWidth, Math.min(maxFlowWidth, scaledFlowWidth));
  // Ensure bypass links are sufficiently thick to be visible over other flows
  if (isBypass) {
    actualFlowWidth = Math.max(actualFlowWidth, 6);
  }
  
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
    hoverFlowWidth: hoverFlowWidth.toFixed(1),
    isSplit: payload.sourceId?.includes('split') || payload.targetId?.includes('split')
  });

  // Compare link endpoints against node rectangles if available
  try {
    if (props.getNodeLayout && typeof props.getNodeLayout === 'function') {
      const sourceLayout = props.getNodeLayout(payload.sourceId);
      const targetLayout = props.getNodeLayout(payload.targetId);
      if (sourceLayout) {
        const sourceDeltaX = sourceX - sourceLayout.xRight;
        const sourceDeltaY = sourceY - sourceLayout.yCenter;
        console.log('[DEBUG] Link vs Source node alignment:', {
          sourceId: payload.sourceId,
          nodeRightEdge: sourceLayout.xRight,
          nodeCenterY: sourceLayout.yCenter,
          linkSourceX: sourceX,
          linkSourceY: sourceY,
          deltaX: sourceDeltaX,
          deltaY: sourceDeltaY,
          nodeRect: {
            left: sourceLayout.xLeft,
            right: sourceLayout.xRight,
            top: sourceLayout.yTop,
            bottom: sourceLayout.yBottom,
            width: sourceLayout.width,
            height: sourceLayout.height,
          }
        });
      }
      if (targetLayout) {
        const targetDeltaX = targetX - targetLayout.xLeft;
        const targetDeltaY = targetY - targetLayout.yCenter;
        console.log('[DEBUG] Link vs Target node alignment:', {
          targetId: payload.targetId,
          nodeLeftEdge: targetLayout.xLeft,
          nodeCenterY: targetLayout.yCenter,
          linkTargetX: targetX,
          linkTargetY: targetY,
          deltaX: targetDeltaX,
          deltaY: targetDeltaY,
          nodeRect: {
            left: targetLayout.xLeft,
            right: targetLayout.xRight,
            top: targetLayout.yTop,
            bottom: targetLayout.yBottom,
            width: targetLayout.width,
            height: targetLayout.height,
          }
        });
      }
    }
  } catch (e) {
    console.log('[DEBUG] Error comparing link endpoints to node layouts:', e);
  }
  
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
        stroke={isBypass ? linkColor : `url(#gradient-${payload.sourceId}-${payload.targetId})`}
        strokeWidth={shouldHideMainConnection ? 0 : (isBypass ? hoverFlowWidth + 6 : hoverFlowWidth + 4)}
        strokeOpacity={isBypass ? 0.9 : (isHovered ? 0.8 : 0.5)}
        strokeLinecap="round"
        className={`sankey-link-background ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.4s ease',
          filter: isHovered ? 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))' : (isBypass ? 'drop-shadow(0 3px 10px rgba(124, 58, 237, 0.5))' : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))')
        }}
      />
      
      {/* Enhanced main flow path with better colors and effects */}
      <path
        d={path}
        fill="none"
        stroke={isBypass ? linkColor : (isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6')}
        strokeWidth={shouldHideMainConnection ? 0 : (isBypass ? hoverFlowWidth + 2 : hoverFlowWidth)}
        strokeOpacity={isBypass ? 1 : (isHovered ? 1 : 0.95)}
        strokeLinecap="round"
        className={`sankey-link-path ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.4s ease',
          strokeDasharray: isSplit ? '4,2' : isBypass ? '6,3' : 'none',
          filter: isHovered 
            ? 'drop-shadow(0 4px 16px rgba(59, 130, 246, 0.7))' 
            : isBypass 
              ? 'drop-shadow(0 3px 12px rgba(124, 58, 237, 0.6))'
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

  // Track node rectangles for alignment diagnostics
  type NodeLayout = {
    x: number;
    yOriginal: number;
    widthOriginal: number;
    heightOriginal: number;
    xLeft: number;
    xRight: number;
    yTop: number;
    yBottom: number;
    yCenter: number;
    width: number;
    height: number;
  };
  const nodeLayoutsRef = useRef<Record<string, NodeLayout>>({});
  const onNodeLayout = React.useCallback((id: string, layout: NodeLayout) => {
    nodeLayoutsRef.current[id] = layout;
    // bump layout version so fit-to-view can run when all nodes report
    setLayoutVersion(v => v + 1);
  }, []);
  const getNodeLayout = React.useCallback((id?: string) => {
    if (!id) return undefined;
    return nodeLayoutsRef.current[id];
  }, []);
  
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
  
  // React-rendered tooltip overlay (replaces DOM injection)
  // Rendering handled below via <CustomTooltip />
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom bounds
  const MIN_ZOOM = 0.1; // allow zooming out to 50%
  const MAX_ZOOM = 3;   // keep current max

  // Fit-to-view versioning to re-run when node layouts settle
  const [layoutVersion, setLayoutVersion] = useState(0);
  const didInitialFitRef = useRef(false);

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
      const newZoom = Math.max(prev / 1.2, MIN_ZOOM);
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
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta));
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

  // Pre-calculate step heights based on node values to avoid first render issues
  const preCalculatedStepHeights = useMemo(() => {
    const heights: Record<string, number> = {};
    
    enhancedData.nodes.forEach((node, index) => {
      const nodeValue = node.value || 0;
      const maxValue = Math.max(...enhancedData.nodes.map(n => n.value || 0));
      const minHeight = 20; // was 30
      const maxHeight = 170; // was 200
      
      // Calculate height proportionally based on node value
      let calculatedHeight = minHeight;
      if (maxValue > 0) {
        calculatedHeight = Math.max(minHeight, Math.min(maxHeight, (nodeValue / maxValue) * 120 + 20));
      }
      
      // Use the node name as the key
      heights[node.name] = calculatedHeight;
      
      // Also store with step-X format for compatibility
      heights[`step-${index}`] = calculatedHeight;
    });
    
    console.log('[DEBUG] Pre-calculated step heights:', heights);
    return heights;
  }, [enhancedData.nodes]);

  // Calculate dynamic container height based on split variations
  const dynamicContainerHeight = useMemo(() => {
    const splitNodes = enhancedData.nodes.filter(node => node.name.includes('split'));
    const maxSplits = Math.max(...enhancedData.nodes.map(node => {
      const stepName = node.name;
      const stepIndex = enhancedData.nodes.findIndex(n => n.name === stepName);
      const nextStep = enhancedData.nodes[stepIndex + 1];
      if (nextStep && nextStep.name.includes('split')) {
        return enhancedData.nodes.filter(n => n.name.includes('split') && n.name.startsWith(stepName.split('-')[0])).length;
      }
      return 0;
    }));
    
    // Base height plus extra space for splits (reduced to tighten vertical spacing)
    const baseHeight = 440; // tighter
    const extraHeightPerSplit = 40; // tighter
    const totalExtraHeight = Math.max(0, maxSplits * extraHeightPerSplit);
    
    console.log('[DEBUG] Dynamic container height calculation:', {
      splitNodes: splitNodes.length,
      maxSplits,
      baseHeight,
      totalExtraHeight,
      finalHeight: baseHeight + totalExtraHeight
    });
    
    return baseHeight + totalExtraHeight;
  }, [enhancedData.nodes]);

  // Handle step height changes
  const handleStepHeightChange = React.useCallback((stepName: string, height: number) => {
    setStepHeights(prev => {
      // Use our pre-calculated proportional height instead of Sankey-calculated height
      const preCalculatedHeight = preCalculatedStepHeights[stepName];
      
      // Use pre-calculated height if available, otherwise use provided height
      let validHeight = preCalculatedHeight || height;
      
      // Only fix truly problematic values
      if (validHeight <= 0) {
        // For negative heights, use a reasonable default
        validHeight = 60;
      } else if (validHeight < 5) {
        // For extremely small positive heights, use a minimum
        validHeight = 30;
      }
      
      // Only update if the height actually changed
      if (prev[stepName] !== validHeight) {
        console.log('[DEBUG] Updating step height:', {
          stepName,
          originalHeight: height,
          preCalculatedHeight,
          validHeight,
          allStepHeights: { ...prev, [stepName]: validHeight }
        });
        
        return {
          ...prev,
          [stepName]: validHeight
        };
      }
      return prev;
    });
  }, [preCalculatedStepHeights]);

  // Add wheel event listener with non-passive mode
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => {
          const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta));
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
      dynamicHeight: dynamicContainerHeight,
      isValidData,
      nodesCount: enhancedData.nodes.length,
      linksCount: enhancedData.links.length
    });
          if (isValidData) {
        console.log('[DEBUG] Rendering Sankey with data:', { 
          nodesCount: enhancedData.nodes.length, 
          linksCount: enhancedData.links.length,
          containerHeight: dynamicContainerHeight,
          responsiveContainerHeight: dynamicContainerHeight
        });
        // Summarize current node layouts snapshot for diagnostics
        const snapshot = nodeLayoutsRef.current;
        console.log('[DEBUG] Node layout snapshot:', Object.keys(snapshot).map(k => ({
          id: k,
          xLeft: snapshot[k].xLeft,
          xRight: snapshot[k].xRight,
          yTop: snapshot[k].yTop,
          yBottom: snapshot[k].yBottom,
          yCenter: snapshot[k].yCenter,
          width: snapshot[k].width,
          height: snapshot[k].height,
        })));
      }
      }, [isValidData, enhancedData.nodes.length, enhancedData.links.length, dynamicContainerHeight]);

  // Perform initial fit-to-view when we have node layouts and container size
  useEffect(() => {
    if (!isValidData || didInitialFitRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    const layouts = nodeLayoutsRef.current;
    const ids = Object.keys(layouts);
    if (ids.length === 0) return;

    const xs = ids.flatMap(id => [layouts[id].xLeft, layouts[id].xRight]);
    const ys = ids.flatMap(id => [layouts[id].yTop, layouts[id].yBottom]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);

    const padding = 120; // increased padding to avoid any clipping
    const fitScaleX = (containerWidth - padding) / contentWidth;
    const fitScaleY = (containerHeight - padding) / contentHeight;
    const fitScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(fitScaleX, fitScaleY)));

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    // With transformOrigin set to top-left (0,0), pan is in screen pixels
    const newPanX = (containerCenterX - contentCenterX * fitScale);
    const newPanY = (containerCenterY - contentCenterY * fitScale);

    setZoom(fitScale);
    setPan({ x: newPanX, y: newPanY });
    didInitialFitRef.current = true;
    console.log('[DEBUG] Initial fit-to-view applied:', { containerWidth, containerHeight, minX, maxX, minY, maxY, contentWidth, contentHeight, fitScale, newPanX, newPanY });
  }, [isValidData, layoutVersion, dimensions.width, dimensions.height]);

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
    

    
    // Shape payload for SankeyTooltip (node path)
    const tooltipData = {
      name: nodeId,
      value: nodeValue,
      // We don't rely on index for display; omit to satisfy types
    } as any;
    
    console.log('[DEBUG] Setting tooltip state in handleNodeHover:', {
      position: { x: event.clientX, y: event.clientY },
      visible: true,
      content: 'Node data object created',
      tooltipData
    });
    
    setTooltipContent([{ payload: tooltipData }]);
    
    // Position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    const relX = event.clientX - (rect?.left || 0) + 12;
    const relY = event.clientY - (rect?.top || 0) + 12;
    setTooltipPosition({ x: relX, y: relY });
    
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
    
    // Shape payload for SankeyTooltip (link path expects source/target indices)
    const tooltipData = {
      source: typeof link.source === 'number' ? link.source : 0,
      target: typeof link.target === 'number' ? link.target : 0,
      value: linkValue,
      sourceId: link.sourceId,
      targetId: link.targetId,
    };
    
    console.log('[DEBUG] Setting tooltip state in handleLinkHover:', {
      position: { x: event.clientX, y: event.clientY },
      visible: true,
      content: 'Link data object created',
      tooltipData
    });
    
    setTooltipContent([{ payload: tooltipData }]);
    
    // Position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    const relX = event.clientX - (rect?.left || 0) + 12;
    const relY = event.clientY - (rect?.top || 0) + 12;
    setTooltipPosition({ x: relX, y: relY });
    
    setTooltipVisible(true);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: 'transparent',
      borderRadius: 0,
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
                  disabled={zoom <= MIN_ZOOM}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: zoom <= MIN_ZOOM ? '#f1f5f9' : '#ffffff', color: zoom <= MIN_ZOOM ? '#94a3b8' : '#64748b',
                    cursor: zoom <= MIN_ZOOM ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            height: '100%',
            minHeight: '400px',
            background: 'transparent',
            borderRadius: 0,
            padding: '24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            position: 'relative',
            boxSizing: 'border-box'
          }}  
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Tooltip overlay inside container for correct positioning */}
        <div
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
            active={tooltipVisible && Array.isArray(tooltipContent)}
            payload={Array.isArray(tooltipContent) ? tooltipContent : []}
            nodeMap={nodeMap}
            initialValue={initialValue}
            coordinate={tooltipPosition}
          />
        </div>

        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {isValidData ? (
              <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={enhancedData}
                node={(props) => <EnhancedNode {...props} preCalculatedStepHeights={preCalculatedStepHeights} onStepHeightChange={handleStepHeightChange} totalNodes={enhancedData?.nodes?.length || 0} handleNodeHover={handleNodeHover} setTooltipVisible={setTooltipVisible} setSelectedNode={setSelectedNode} onNodeLayout={onNodeLayout} />}
                link={(props) => {
                  // Render ALL links, including optional bypass links
                  try {
                    console.log('[DEBUG] Rendering link component:', {
                      sourceId: props?.payload?.sourceId,
                      targetId: props?.payload?.targetId,
                      value: props?.payload?.value
                    });
                  } catch {}
                  return (
                    <EnhancedLink
                      {...props}
                      stepHeights={stepHeights}
                      preCalculatedStepHeights={preCalculatedStepHeights}
                      handleLinkHover={handleLinkHover}
                      setTooltipVisible={setTooltipVisible}
                      nodes={rechartsData.nodes}
                      getNodeLayout={getNodeLayout}
                    />
                  );
                }}
                nodePadding={80}
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
      {/* Overlay to draw optional markers ABOVE everything, using measured node layouts */}
      {isValidData && (
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {rechartsData.nodes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((n: any) => (n as any).isOptional === true)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((n: any, idx: number) => {
              const layout = nodeLayoutsRef.current[n.name];
              if (!layout) {
                try { console.log('[DEBUG] Optional marker overlay: missing layout for node', n.name); } catch {}
                return null;
              }
              const markerRectW = 28;
              const markerRectH = 16;
              const markerRectX = layout.xLeft + 8;
              const markerRectY = layout.yTop + 6;
              const markerTextX = markerRectX + markerRectW / 2;
              const markerTextY = markerRectY + markerRectH * 0.68;
              try {
                console.log('[DEBUG] Optional marker overlay render:', {
                  nodeId: n.name,
                  idx,
                  rect: { x: markerRectX, y: markerRectY, w: markerRectW, h: markerRectH },
                  text: { x: markerTextX, y: markerTextY },
                  nodeBounds: { left: layout.xLeft, right: layout.xRight, top: layout.yTop, bottom: layout.yBottom }
                });
              } catch {}
              return (
                <g key={`opt-overlay-${n.name}-${idx}`}>
                  <rect
                    x={markerRectX}
                    y={markerRectY}
                    width={markerRectW}
                    height={markerRectH}
                    rx={7}
                    ry={7}
                    fill={'rgba(255,255,255,0.95)'}
                    stroke={'#7c3aed'}
                    strokeWidth={1.25}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                  />
                  <text
                    x={markerTextX}
                    y={markerTextY}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={800}
                    fill={'#4c1d95'}
                    style={{ letterSpacing: 0.5, paintOrder: 'stroke', stroke: 'white', strokeWidth: 2 }}
                  >
                    OPT
                  </text>
                </g>
              );
            })}
        </svg>
      )}

    </div>
  );
};