import React, { useState } from 'react';
import { STEP_COLORS } from '../constants';

type EnhancedLinkProps = any; // Keep flexible to align with current Recharts typing

const EnhancedLink: React.FC<EnhancedLinkProps> = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, stepHeights, nodes, preCalculatedStepHeights, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const debug: boolean = props.debug === true;
  const renderMode: 'classic' | 'semantic' | 'monochrome' = props.linkRenderMode || 'classic';
  const animationSpeed: number = props.animationSpeed || 1;

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
  const linkType: 'main' | 'split' | 'optional' = isBypass ? 'optional' : (isSplit ? 'split' : 'main');

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

  // Compute sibling offsets for split branches to reduce overlap
  let siblingIndex = 0;
  let siblingCount = 1;
  try {
    if (isSplit && Array.isArray(nodes)) {
      const sourceMatch = (payload.sourceId || '').match(/step-(\d+)/);
      const targetMatch = (payload.targetId || '').match(/step-(\d+)-split-(\d+)/);
      const fromMainToSplit = !!targetMatch;
      const fromSplitToMain = (payload.sourceId || '').includes('-split-') && (payload.targetId || '').includes('step-');
      if (fromMainToSplit && sourceMatch) {
        const stepIdx = parseInt(sourceMatch[1], 10);
        siblingIndex = parseInt(targetMatch?.[2] || '0', 10) || 0;
        siblingCount = nodes.filter((n: any) => typeof n.name === 'string' && n.name.startsWith(`step-${stepIdx}-split-`)).length || 1;
      } else if (fromSplitToMain) {
        const splitMatch = (payload.sourceId || '').match(/step-(\d+)-split-(\d+)/);
        const stepIdx = parseInt(splitMatch?.[1] || '0', 10);
        siblingIndex = parseInt(splitMatch?.[2] || '0', 10) || 0;
        siblingCount = nodes.filter((n: any) => typeof n.name === 'string' && n.name.startsWith(`step-${stepIdx}-split-`)).length || 1;
      }
    }
  } catch {}

  // We don't yet know hoverFlowWidth; use a base estimate then scale later in y offsets via path recompute
  const baseWidthEstimate = 8;
  const siblingOffsetPx = siblingCount > 1 ? (siblingIndex - (siblingCount - 1) / 2) * Math.max(6, Math.min(12, baseWidthEstimate * 0.4)) : 0;

  let path: string;
  const distance = Math.abs(adjustedTargetX - adjustedSourceX);
  const curveOffset = Math.min(distance * 0.15, 30);

  // Track actual y used for rendering (used by glyphs)
  let renderSourceYUsed = adjustedSourceY;
  let renderTargetYUsed = adjustedTargetY;

  if (isBypass) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const arcHeight = Math.max(40, Math.min(120, distance * 0.35));
    const sourceStepNum = parseInt((payload.sourceId || '').split('-')[1] || '0', 10);
    const routeAbove = isNaN(sourceStepNum) ? true : sourceStepNum % 2 === 0;
    const verticalShift = routeAbove ? -arcHeight : arcHeight;
    renderSourceYUsed = adjustedSourceY + verticalShift * 0.1;
    renderTargetYUsed = adjustedTargetY + verticalShift * 0.1;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - 40},${adjustedSourceY + verticalShift} ${midX + 40},${adjustedTargetY + verticalShift} ${adjustedTargetX},${adjustedTargetY}`;
  } else if (isOptional) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    renderSourceYUsed = adjustedSourceY;
    renderTargetYUsed = adjustedTargetY;
    path = `M${adjustedSourceX},${adjustedSourceY} C${midX - curveOffset},${adjustedSourceY} ${midX + curveOffset},${adjustedTargetY} ${adjustedTargetX},${adjustedTargetY}`;
  } else if (isSplit) {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const splitOffset = Math.min(distance * 0.1, 20);
    const fromMainToSplit = (payload.targetId || '').includes('-split-');
    const fromSplitToMain = (payload.sourceId || '').includes('-split-');
    const sourceY = fromMainToSplit ? adjustedSourceY : adjustedSourceY + siblingOffsetPx;
    const targetY = fromMainToSplit ? adjustedTargetY + siblingOffsetPx : adjustedTargetY;
    renderSourceYUsed = sourceY;
    renderTargetYUsed = targetY;
    path = `M${adjustedSourceX},${sourceY} C${midX - splitOffset},${sourceY} ${midX + splitOffset},${targetY} ${adjustedTargetX},${targetY}`;
  } else {
    const midX = (adjustedSourceX + adjustedTargetX) / 2;
    const regularOffset = Math.min(distance * 0.08, 15);
    renderSourceYUsed = adjustedSourceY;
    renderTargetYUsed = adjustedTargetY;
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

  // IDs for defs that need to be unique per link
  const gradientId = `gradient-${payload.sourceId}-${payload.targetId}`;
  const flowGradientId = `flow-gradient-${payload.sourceId}-${payload.targetId}`;
  const arrowId = `arrow-${payload.sourceId}-${payload.targetId}`;
  const labelPathId = `lp-${payload.sourceId}-${payload.targetId}`;

  // Renderers for semantic mode
  const renderRibbonMain = () => (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.5" />
          <stop offset="50%" stopColor={isHighConversion ? '#34d399' : isLowConversion ? '#9ca3af' : '#60a5fa'} stopOpacity="0.9" />
          <stop offset="100%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.5" />
        </linearGradient>
        <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L10,5 L0,10 z" fill={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} />
        </marker>
        <path id={labelPathId} d={path} />
      </defs>
      {/* Soft halo */}
      <path
        d={path}
        fill="none"
        stroke={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'}
        strokeWidth={shouldHideMainConnection ? 0 : (hoverFlowWidth + 12)}
        strokeOpacity={0.12}
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Base ribbon */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={shouldHideMainConnection ? 0 : (hoverFlowWidth + 6)}
        strokeOpacity={isHovered ? 0.9 : 0.7}
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease', filter: isHovered ? 'drop-shadow(0 6px 18px rgba(59,130,246,0.35))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
      />
      {/* Inner highlight track */}
      <path
        d={path}
        fill="none"
        stroke="#ffffff"
        strokeWidth={shouldHideMainConnection ? 0 : Math.max(2, hoverFlowWidth * 0.35)}
        strokeOpacity={0.35}
        strokeLinecap="round"
        style={{ transition: 'stroke-width 0.3s ease', mixBlendMode: 'overlay' }}
      />
      {/* Curved value label */}
      {payload?.value && !isHovered && !shouldHideMainConnection && (
        <text fontSize={10} fill="#475569">
          <textPath href={`#${labelPathId}`} startOffset="50%" textAnchor="middle">
            {`${payload.value.toLocaleString()} users`}
          </textPath>
        </text>
      )}
    </>
  );

  const renderForkedSplit = () => (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={linkColor === 'transparent' ? '#8b5cf6' : linkColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={linkColor === 'transparent' ? '#60a5fa' : linkColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Solid inner line */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={hoverFlowWidth * 0.9}
        strokeOpacity={isHovered ? 0.95 : 0.8}
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Dotted outer outline */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={Math.max(hoverFlowWidth * 1.15, 2)}
        strokeOpacity={0.5}
        strokeLinecap="round"
        strokeDasharray="4 3"
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Beads animation */}
      <defs>
        <path id={labelPathId} d={path} />
      </defs>
      <circle r={Math.max(1.5, hoverFlowWidth * 0.18)} fill="#ffffff">
        <animateMotion dur={`${(1.6 / animationSpeed).toFixed(2)}s`} repeatCount="indefinite">
          <mpath href={`#${labelPathId}`} />
        </animateMotion>
      </circle>
      {/* Fork glyph near branch origin (main -> split only) */}
      {((payload.targetId || '').includes('-split-')) && (
        <g transform={`translate(${adjustedSourceX + 8}, ${renderSourceYUsed})`} style={{ pointerEvents: 'none' }}>
          <path d="M0,0 L10,0 M10,0 L16,-5 M10,0 L16,5" fill="none" stroke="#374151" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      )}
    </>
  );

  const renderGhostOptional = () => (
    <>
      <path
        d={path}
        fill="none"
        stroke={linkColor}
        strokeWidth={Math.max(1, hoverFlowWidth * 0.6)}
        strokeDasharray="10 6"
        strokeLinecap="round"
        style={{ opacity: 0.35, filter: 'blur(0.4px)' }}
      >
        <animate attributeName="stroke-dashoffset" from="0" to="16" dur={`${(2.5 / animationSpeed).toFixed(2)}s`} repeatCount="indefinite" />
      </path>
    </>
  );

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
      {/* Extended hover area */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(hoverFlowWidth + 10, 20)}
        className="sankey-link-hover-area"
        style={{ cursor: 'pointer' }}
      />

      {renderMode === 'semantic' ? (
        linkType === 'main' ? renderRibbonMain() : linkType === 'split' ? renderForkedSplit() : renderGhostOptional()
      ) : renderMode === 'monochrome' ? (
        <>
          {/* Arrow marker for monochrome */}
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#111827" />
            </marker>
            <path id={labelPathId} d={path} />
          </defs>
          <path
            d={path}
            fill="none"
            stroke="#111827"
            strokeWidth={hoverFlowWidth}
            strokeOpacity={0.6}
            strokeLinecap="round"
            style={{ strokeDasharray: isSplit ? '4 3' : isBypass ? '8 6' : 'none' }}
            markerEnd={!isBypass ? `url(#${arrowId})` : undefined}
          />
          {/* Curved label in monochrome */}
          {payload?.value && !isHovered && (
            <text fontSize={10} fill="#374151">
              <textPath href={`#${labelPathId}`} startOffset="50%" textAnchor="middle">
                {`${payload.value.toLocaleString()} users`}
              </textPath>
            </text>
          )}
        </>
      ) : (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
              <stop offset="50%" stopColor={isHighConversion ? '#34d399' : isLowConversion ? '#9ca3af' : '#60a5fa'} stopOpacity="0.6" />
              <stop offset="100%" stopColor={isHighConversion ? '#10b981' : isLowConversion ? '#6b7280' : '#3b82f6'} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <path
            d={path}
            fill="none"
            stroke={isBypass ? linkColor : `url(#${gradientId})`}
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
            <linearGradient id={flowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>

          <path
            d={path}
            fill="none"
            stroke={`url(#${flowGradientId})`}
            strokeWidth={shouldHideMainConnection ? 0 : Math.max(hoverFlowWidth / 1.5, 2)}
            strokeOpacity={isHovered ? 0.8 : 0.5}
            strokeLinecap="round"
            className="sankey-link-flow"
            style={{
              animation: `flowAnimation ${(3 / animationSpeed).toFixed(2)}s linear infinite`,
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
        </>
      )}
    </g>
  );
};

export default EnhancedLink;


