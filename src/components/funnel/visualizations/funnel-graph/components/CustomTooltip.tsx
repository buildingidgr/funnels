import React, { useRef, useEffect } from 'react';
import SankeyTooltip from './SankeyTooltip';

interface CustomTooltipProps {
  payload: any[];
  nodeMap: Record<string, any>;
  initialValue: number;
  active?: boolean;
  label?: string;
  coordinate?: { x: number, y: number };
}

/**
 * Custom wrapper for SankeyTooltip to ensure proper rendering with Recharts
 * Simplified implementation that doesn't update position during hover to avoid loops
 */
const CustomTooltip: React.FC<CustomTooltipProps> = (props) => {
  const { active, payload, nodeMap, initialValue, coordinate } = props;
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only update position when props change, not on every render
    const el = tooltipRef.current;
    if (!el || !coordinate) return;

    // Determine container bounds using the overlay (parent) element
    const parent = el.parentElement as HTMLElement | null;
    const containerWidth = parent?.clientWidth ?? 0;
    const containerHeight = parent?.clientHeight ?? 0;

    // Start with requested coordinates
    let nextX = coordinate.x;
    let nextY = coordinate.y;

    // If we will show content, make the element measurable first
    if (active && payload && payload.length > 0) {
      // Temporarily make visible but transparent to measure size
      el.style.visibility = 'visible';
      el.style.opacity = '0';
    }

    // Measure tooltip size
    const tooltipWidth = el.offsetWidth;
    const tooltipHeight = el.offsetHeight;
    const padding = 8; // minimal inset from edges

    // Clamp within container bounds
    if (tooltipWidth > 0 && containerWidth > 0) {
      if (nextX + tooltipWidth + padding > containerWidth) {
        nextX = Math.max(padding, containerWidth - tooltipWidth - padding);
      } else if (nextX < padding) {
        nextX = padding;
      }
    }
    if (tooltipHeight > 0 && containerHeight > 0) {
      if (nextY + tooltipHeight + padding > containerHeight) {
        nextY = Math.max(padding, containerHeight - tooltipHeight - padding);
      } else if (nextY < padding) {
        nextY = padding;
      }
    }

    // Apply final position
    el.style.left = `${nextX}px`;
    el.style.top = `${nextY}px`;

    // Control visibility based on active state
    if (active && payload && payload.length > 0) {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    } else {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
    }
  }, [active, coordinate, payload]);

  // Always render the container, but control visibility with CSS
  return (
    <div 
      ref={tooltipRef}
      className="recharts-custom-tooltip"
      style={{ 
        zIndex: 1000, 
        position: 'absolute',
        backgroundColor: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'unset',
        pointerEvents: 'none',
        // Initial visibility
        visibility: (active && payload && payload.length > 0) ? 'visible' : 'hidden',
        opacity: (active && payload && payload.length > 0) ? 1 : 0,
        // Make sure it's positioned initially
        left: coordinate?.x || 0,
        top: coordinate?.y || 0,
        // Don't use any transitions or animations
        transition: 'none'
      }}
    >
      {/* Always render the content, let CSS control visibility */}
      {payload && payload.length > 0 && (
        <SankeyTooltip 
          payload={payload} 
          nodeMap={nodeMap} 
          initialValue={initialValue} 
        />
      )}
    </div>
  );
};

export default CustomTooltip; 