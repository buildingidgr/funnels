import React, { useRef, useEffect } from 'react';
import SankeyTooltip from './SankeyTooltip';

interface CustomTooltipProps {
  payload: any[];
  nodeMap: Record<string, any>;
  initialValue: number;
  active?: boolean;
  label?: string;
  coordinate?: { x: number, y: number };
  funnelId?: string;
  onTooltipMouseEnter?: () => void;
  onTooltipMouseLeave?: () => void;
}

/**
 * Custom wrapper for SankeyTooltip to ensure proper rendering with Recharts
 * Simplified implementation that doesn't update position during hover to avoid loops
 */
const CustomTooltip: React.FC<CustomTooltipProps> = (props) => {
  const { active, payload, nodeMap, initialValue, coordinate, funnelId, onTooltipMouseEnter, onTooltipMouseLeave } = props;
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only update position when props change, not on every render
    const el = tooltipRef.current;
    if (!el || !coordinate) return;

    // Determine container bounds by finding the nearest marked container ancestor
    const containerEl = (el.closest('[data-tooltip-container="true"]') as HTMLElement | null) || el.parentElement;
    const containerRect = containerEl?.getBoundingClientRect();
    const containerWidth = containerRect?.width ?? containerEl?.clientWidth ?? 0;
    const containerHeight = containerRect?.height ?? containerEl?.clientHeight ?? 0;
    const cs = containerEl ? window.getComputedStyle(containerEl) : null;
    const padTop = cs ? parseFloat(cs.paddingTop || '0') : 0;
    const padRight = cs ? parseFloat(cs.paddingRight || '0') : 0;
    const padBottom = cs ? parseFloat(cs.paddingBottom || '0') : 0;
    const padLeft = cs ? parseFloat(cs.paddingLeft || '0') : 0;

    // Start with requested coordinates
    let nextX = coordinate.x;
    let nextY = coordinate.y;

    // If we will show content, make the element measurable first
    if (active && payload && payload.length > 0) {
      // Temporarily make visible but transparent to measure size
      el.style.visibility = 'visible';
      el.style.opacity = '0';
    }

    // Measure tooltip size (fallbacks if not yet measurable)
    const tooltipWidth = el.offsetWidth || 260;
    const tooltipHeight = el.offsetHeight || 120;
    const padding = 8; // minimal inset from edges

    // Place relative to cursor with small anchor, then clamp inside container padding box
    const anchor = 12;
    let flippedX = false;
    let flippedY = false;

    // Horizontal placement: prefer right of cursor, else left
    const minX = padLeft + padding;
    const maxX = Math.max(minX, containerWidth - padRight - tooltipWidth - padding);
    if (nextX + anchor + tooltipWidth + padRight + padding <= containerWidth) {
      nextX = nextX + anchor;
    } else {
      nextX = nextX - anchor - tooltipWidth;
      flippedX = true;
    }
    nextX = Math.max(minX, Math.min(nextX, maxX));

    // Vertical placement: prefer below cursor, else above
    const minY = padTop + padding;
    const maxY = Math.max(minY, containerHeight - padBottom - tooltipHeight - padding);
    if (nextY + anchor + tooltipHeight + padBottom + padding <= containerHeight) {
      nextY = nextY + anchor;
    } else {
      nextY = nextY - anchor - tooltipHeight;
      flippedY = true;
    }
    nextY = Math.max(minY, Math.min(nextY, maxY));

    // Apply final position
    el.style.left = `${nextX}px`;
    el.style.top = `${nextY}px`;

    // Second pass after paint to catch late content reflow (two-step re-clamp)
    const rafId = requestAnimationFrame(() => {
      const tW = el.offsetWidth || tooltipWidth;
      const tH = el.offsetHeight || tooltipHeight;
      let adjX = nextX;
      let adjY = nextY;
      const minXRaf = padLeft + padding;
      const maxXRaf = Math.max(minXRaf, containerWidth - padRight - tW - padding);
      const minYRaf = padTop + padding;
      const maxYRaf = Math.max(minYRaf, containerHeight - padBottom - tH - padding);
      const overflowRight = adjX + tW + padRight + padding > containerWidth;
      const overflowBottom = adjY + tH + padBottom + padding > containerHeight;
      const overflowLeft = adjX < minXRaf;
      const overflowTop = adjY < minYRaf;
      if (overflowRight) adjX = maxXRaf;
      if (overflowLeft) adjX = minXRaf;
      if (overflowBottom) adjY = maxYRaf;
      if (overflowTop) adjY = minYRaf;
      el.style.left = `${adjX}px`;
      el.style.top = `${adjY}px`;
      try {
        // eslint-disable-next-line no-console
        console.log('[DEBUG][Tooltip] raf reclamp', { tW, tH, adjX, adjY, overflowRight, overflowBottom, overflowLeft, overflowTop, padTop, padRight, padBottom, padLeft });
      } catch (error) {
        // Silently handle any console logging errors
      }
    });

    try {
      // Strategic logs for diagnosing cut-offs
      // eslint-disable-next-line no-console
      console.log('[DEBUG][Tooltip] measured & clamped', {
        container: { width: containerWidth, height: containerHeight },
        tooltip: { width: tooltipWidth, height: tooltipHeight },
        requested: coordinate,
        applied: { x: nextX, y: nextY },
        flipped: { x: flippedX, y: flippedY },
        clippedRight: nextX + tooltipWidth + padRight + padding > containerWidth,
        clippedBottom: nextY + tooltipHeight + padBottom + padding > containerHeight,
        padding: { top: padTop, right: padRight, bottom: padBottom, left: padLeft }
      });
    } catch (error) {
      // Silently handle any console logging errors
    }

    // Control visibility based on active state
    if (active && payload && payload.length > 0) {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    } else {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
    }

    return () => cancelAnimationFrame(rafId);
  }, [active, coordinate, payload]);

  // Always render the container, but control visibility with CSS
  return (
    <div 
      ref={tooltipRef}
      className="recharts-custom-tooltip"
      onMouseEnter={onTooltipMouseEnter}
      onMouseLeave={onTooltipMouseLeave}
      style={{ 
        zIndex: 1000, 
        position: 'absolute',
        backgroundColor: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'unset',
        // Allow pointer interactions within tooltip
        pointerEvents: 'auto',
        maxWidth: 'calc(100% - 16px)',
        maxHeight: 'calc(100% - 16px)',
        overflow: 'auto',
        // Initial visibility
        visibility: (active && payload && payload.length > 0) ? 'visible' : 'hidden',
        opacity: (active && payload && payload.length > 0) ? 1 : 0,
        // Make sure it's positioned initially
        left: coordinate?.x || 0,
        top: coordinate?.y || 0,
        // Don't use any transitions or animations
        transition: 'none',
        // Prevent clipping by parent overflow hidden
        willChange: 'transform'
      }}
    >
      {/* Always render the content, let CSS control visibility */}
      {payload && payload.length > 0 && (
        <SankeyTooltip 
          payload={payload} 
          nodeMap={nodeMap} 
          initialValue={initialValue} 
          funnelId={funnelId}
        />
      )}
    </div>
  );
};

export default CustomTooltip; 