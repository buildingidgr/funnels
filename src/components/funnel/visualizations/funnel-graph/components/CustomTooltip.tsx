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
    if (tooltipRef.current && coordinate) {
      tooltipRef.current.style.left = `${coordinate.x}px`;
      tooltipRef.current.style.top = `${coordinate.y}px`;
      
      // Control visibility based on active state
      if (active && payload && payload.length > 0) {
        tooltipRef.current.style.visibility = 'visible';
        tooltipRef.current.style.opacity = '1';
      } else {
        tooltipRef.current.style.visibility = 'hidden';
        tooltipRef.current.style.opacity = '0';
      }
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
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        padding: '8px',
        minWidth: '200px',
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