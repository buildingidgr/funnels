import React, { useState } from 'react';
import { STEP_COLORS } from '../constants';

type EnhancedLinkProps = any; // Keep flexible to align with current Recharts typing

const EnhancedLink: React.FC<EnhancedLinkProps> = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, stepHeights, nodes, preCalculatedStepHeights, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const debug: boolean = props.debug === true;

  const handleLinkHover = props.handleLinkHover;

  const isSplit = payload.sourceId?.includes('split') || payload.targetId?.includes('split');
  const isStepToStep = payload.sourceId?.includes('step-') && !payload.sourceId?.includes('-split-') && payload.targetId?.includes('step-') && !payload.targetId?.includes('-split-');
  const sourceStepNumStr = payload.sourceId?.match(/step-(\d+)/)?.[1] || '';
  const targetStepNumStr = payload.targetId?.match(/step-(\d+)/)?.[1] || '';
  const sourceStepNum = parseInt(sourceStepNumStr, 10);
  const targetStepNum = parseInt(targetStepNumStr, 10);
  const areValidStepNums = !Number.isNaN(sourceStepNum) && !Number.isNaN(targetStepNum);
  const isImmediateNext = isStepToStep && areValidStepNums && (targetStepNum - sourceStepNum === 1);
  const shouldHideMainConnection = isImmediateNext && (() => {
    if (!areValidStepNums) return false;
    const hasSplitNodes = nodes?.some((node: any) => node.name?.includes(`step-${sourceStepNum}-split-`));
    return !!hasSplitNodes;
  })();
  const isInitialBypass = payload.sourceId === 'initial' && !payload.targetId?.includes('step-1');
  const isOptional = isStepToStep && areValidStepNums && Math.abs(targetStepNum - sourceStepNum) > 1;
  const isBypass = isInitialBypass || isOptional;

  const conversionRate = payload.conversionRate || 0;
  const isHighConversion = conversionRate >= 75;
  const isLowConversion = conversionRate < 40;

  let linkColor: string = STEP_COLORS.links.main as string;
  if (isSplit) {
    linkColor = 'transparent';
  } else if (isHighConversion) {
    linkColor = STEP_COLORS.links.high;
  } else if (isLowConversion) {
    linkColor = '#6b7280';
  } else {
    linkColor = STEP_COLORS.links.medium;
  }
  if (isBypass) {
    linkColor = '#7c3aed';
  }

  let adjustedSourceX = sourceX;
  let adjustedSourceY = sourceY;
  let adjustedTargetX = targetX;
  let adjustedTargetY = targetY;

  try {
    if (props.getNodeLayout && typeof props.getNodeLayout === 'function') {
      const sourceLayout = props.getNodeLayout(payload.sourceId);
      const targetLayout = props.getNodeLayout(payload.targetId);
      if (sourceLayout) {
        adjustedSourceX = sourceLayout.xRight;
        adjustedSourceY = sourceLayout.yCenter;
      }
      if (targetLayout) {
        adjustedTargetX = targetLayout.xLeft;
        adjustedTargetY = targetLayout.yCenter;
      }
      if (isBypass && (sourceLayout || targetLayout)) {
        const sourceStepNum = parseInt((payload.sourceId || '').split('-')[1] || '0', 10);
        const routeAbove = isNaN(sourceStepNum) ? true : sourceStepNum % 2 === 0;
        const sourceEdgeOffset = sourceLayout ? Math.min(12, Math.max(8, sourceLayout.height * 0.2)) : 10;
        const targetEdgeOffset = targetLayout ? Math.min(12, Math.max(8, targetLayout.height * 0.2)) : 10;
        if (sourceLayout) {
          adjustedSourceY = routeAbove ? (sourceLayout.yTop + sourceEdgeOffset) : (sourceLayout.yBottom - sourceEdgeOffset);
        }
        if (targetLayout) {
          adjustedTargetY = routeAbove ? (targetLayout.yTop + targetEdgeOffset) : (targetLayout.yBottom - targetEdgeOffset);
        }
      }
    }
  } catch {}

  let path: string;
  const distance = Math.abs(adjustedTargetX - adjustedSourceX);
  const curveOffset = Math.min(distance * 0.15, 30);

  if (isBypass) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const arcHeight = Math.max(40, Math.min(120, distance * 0.35));
    const sourceStepNum = parseInt((payload.sourceId || '').split('-')[1] || '0', 10);
    const routeAbove = isNaN(sourceStepNum) ? true : sourceStepNum % 2 === 0;
    const verticalShift = routeAbove ? -arcHeight : arcHeight;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - 40},${adjustedSourceY + verticalShift} ${midX + 40},${adjustedTargetY + verticalShift} ${adjustedTargetX},${adjustedTargetY}`;
  } else if (isOptional) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - curveOffset},${adjustedSourceY} ${midX + curveOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  } else if (isSplit) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const splitOffset = Math.min(distance * 0.1, 20);
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - splitOffset},${adjustedSourceY} ${midX + splitOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  } else {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const regularOffset = Math.min(distance * 0.08, 15);
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - regularOffset},${adjustedSourceY} ${midX + regularOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  }

  const sourceValue = payload.sourceValue || payload.value;
  const percentage = sourceValue > 0 ? (payload.value / sourceValue) * 100 : 0;
  const sourceStepHeight = preCalculatedStepHeights[payload.sourceId]
    || preCalculatedStepHeights[`step-${payload.source}`]
    || preCalculatedStepHeights[payload.sourceId?.replace('step-', '')]
    || stepHeights[payload.sourceId]
    || stepHeights[`step-${payload.source}`]
    || stepHeights[payload.sourceId?.replace('step-', '')]
    || 60;

  const flowWidth = (percentage / 100) * sourceStepHeight;
  const strokeWidthScale = 0.3;
  const scaledFlowWidth = flowWidth * strokeWidthScale;
  const maxFlowWidth = 30;
  const minFlowWidth = 2;
  let actualFlowWidth = Math.max(minFlowWidth, Math.min(maxFlowWidth, scaledFlowWidth));
  const hoverFlowWidth = isHovered ? actualFlowWidth * 1.5 : actualFlowWidth;

  return (
    <g
      className="sankey-link-group"
      style={{ zIndex: 1000 }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (handleLinkHover) {
          handleLinkHover(e, payload);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (props.setTooltipVisible) {
          props.setTooltipVisible(false);
        }
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(hoverFlowWidth + 10, 20)}
        className="sankey-link-hover-area"
        style={{ cursor: 'pointer' }}
      />

      <defs>
        <linearGradient id={`gradient-${payload.sourceId}-${payload.targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
          <stop offset="50%" stopColor={isHighConversion ? '#34d399' : isLowConversion ? '#9ca3af' : '#60a5fa'} stopOpacity="0.6" />
          <stop offset="100%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <path
        d={path}
        fill="none"
        stroke={isBypass ? linkColor : `url(#gradient-${payload.sourceId}-${payload.targetId})`}
        strokeWidth={shouldHideMainConnection ? 0 : (hoverFlowWidth + 4)}
        strokeOpacity={isBypass ? 0.9 : (isHovered ? 0.8 : 0.5)}
        strokeLinecap="round"
        className={`sankey-link-background ${isSplit ? 'sankey-split-link' : ''} ${isBypass ? 'sankey-bypass-link' : ''} ${isOptional ? 'sankey-optional-link' : ''}`}
        style={{
          transition: 'all 0.4s ease',
          filter: isHovered ? 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))' : (isBypass ? 'drop-shadow(0 3px 10px rgba(124, 58, 237, 0.5))' : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))'),
        }}
      />

      <path
        d={path}
        fill="none"
        stroke={isBypass ? linkColor : (isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6')}
        strokeWidth={shouldHideMainConnection ? 0 : hoverFlowWidth}
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
              : isHighConversion ? 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))'
                : isLowConversion ? 'drop-shadow(0 2px 8px rgba(107, 114, 128, 0.4))'
                : 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))',
        }}
      />

      <defs>
        <linearGradient id={`flow-gradient-${payload.sourceId}-${payload.targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>

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
          filter: isHovered ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))' : 'none',
        }}
      />

      {conversionRate > 0 && payload.value > 20 && !isHovered && !shouldHideMainConnection && (
        <>
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
              strokeWidth: 1.5,
            }}
          />
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
              strokeWidth: '1px',
            }}
          >
            {conversionRate.toFixed(1)}%
          </text>
        </>
      )}
    </g>
  );
};

export default EnhancedLink;


