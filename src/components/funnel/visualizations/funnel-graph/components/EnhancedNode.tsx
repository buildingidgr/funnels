import React from 'react';
import { STEP_COLORS } from '../constants';

type EnhancedNodeProps = any; // Kept flexible to match Recharts typing in current codebase

const EnhancedNode: React.FC<EnhancedNodeProps> = ({ x, y, width, height, index, payload, preCalculatedStepHeights, ...props }: any) => {
  const debug: boolean = props.debug === true;
  const isFirstNode = index === 0;
  const isLastNode = index === (props.totalNodes - 1);
  const isOptionalNode = !!props?.rechartsNodes?.[index]?.isOptional || !!payload?.isOptional;
  const optionalFlagOrigin = {
    fromRechartsNode: !!props?.rechartsNodes?.[index]?.isOptional,
    fromPayload: !!payload?.isOptional
  };

  const finalHeight = preCalculatedStepHeights[payload.name] || (height > 0 ? height : 30);
  const yOffset = (finalHeight - height) / 2;
  const finalY = y - yOffset;

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
    if (debug) {
      try { console.log('[DEBUG] Node layout computed:', { id: payload.name, ...layoutMetrics }); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y, width, height, finalY, finalHeight, payload?.name]);

  const isSplit = payload.name.includes('split');
  const isDomestic = payload.name.toLowerCase().includes('domestic');
  const isInternational = payload.name.toLowerCase().includes('international');

  const stepColors = [
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
  ];

  let nodeColor = stepColors[0];

  if (isSplit) {
    nodeColor = isDomestic ? STEP_COLORS.split.domestic : STEP_COLORS.split.international;
  } else {
    if (payload.color) {
      nodeColor = payload.color;
    } else {
      switch (payload.name.toLowerCase()) {
        case 'landing page visit':
        case 'support page visit':
        case 'product page visit':
          nodeColor = stepColors[0];
          break;
        case 'destination selection':
        case 'support ticket created':
        case 'product interaction':
          nodeColor = stepColors[1];
          break;
        case 'travel details':
        case 'live chat initiated (optional)':
        case 'add to cart':
          nodeColor = stepColors[2];
          break;
        case 'booking':
        case 'agent assigned':
        case 'checkout started':
          nodeColor = stepColors[3];
          break;
        case 'confirmation':
        case 'first response sent':
        case 'payment completed':
          nodeColor = stepColors[4];
          break;
        case 'customer reply':
        case 'order confirmation':
          nodeColor = stepColors[5];
          break;
        default:
          const stepIndex = parseInt(payload.name.match(/step-(\d+)/)?.[1] || '0');
          nodeColor = stepColors[stepIndex % stepColors.length];
      }
    }
  }

  const conversionRate = payload.conversionRate || 0;
  const isHighConversion = conversionRate >= 75;
  const isLowConversion = conversionRate < 40;

  React.useEffect(() => {
    if (props.onStepHeightChange) {
      const preCalculatedHeight = preCalculatedStepHeights[payload.name];
      let validHeight = preCalculatedHeight;
      if (!validHeight) {
        const nodeValue = payload.value || 0;
        const maxValue = 10000;
        const minHeight = 30;
        const maxHeight = 200;
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
        if (props.handleNodeHover) {
          props.handleNodeHover(e, payload);
        }
      }}
      onMouseLeave={() => {
        if (props.setTooltipVisible) {
          props.setTooltipVisible(false);
        }
        if (props.setSelectedNode) {
          props.setSelectedNode(null);
        }
      }}
    >
      <rect
        x={x}
        y={finalY}
        width={width * 1.5}
        height={finalHeight}
        fill={nodeColor}
        rx={8}
        ry={8}
        className="sankey-node"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          transition: 'all 0.3s ease',
          stroke: 'transparent',
          strokeWidth: 0,
        }}
      />

      {isOptionalNode && (() => {
        const markerRectW = 28;
        const markerRectH = 16;
        const markerRectX = x + 8;
        const markerRectY = finalY + 6;
        const markerTextX = markerRectX + markerRectW / 2;
        const markerTextY = markerRectY + markerRectH * 0.68;
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

      {conversionRate > 0 && (
        <>
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
              strokeWidth: 2,
            }}
          />
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
              strokeWidth: '2px',
            }}
          >
            {conversionRate.toFixed(1)}%
          </text>
        </>
      )}
    </g>
  );
};

export default EnhancedNode;


