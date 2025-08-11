import React from 'react';

type NodeLayout = {
  xLeft: number;
  xRight: number;
  yTop: number;
  yBottom: number;
};

interface OptionalMarkersOverlayProps {
  nodes: Array<{ name: string; isOptional?: boolean }>;
  getLayout: (id: string) => NodeLayout | undefined;
}

const OptionalMarkersOverlay: React.FC<OptionalMarkersOverlayProps> = ({ nodes, getLayout }) => {
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {nodes
        .filter((n: any) => (n as any).isOptional === true)
        .map((n: any, idx: number) => {
          const layout = getLayout(n.name);
          if (!layout) return null;
          const markerRectW = 28;
          const markerRectH = 16;
          const markerRectX = layout.xLeft + 8;
          const markerRectY = layout.yTop + 6;
          const markerTextX = markerRectX + markerRectW / 2;
          const markerTextY = markerRectY + markerRectH * 0.68;
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
  );
};

export default OptionalMarkersOverlay;


