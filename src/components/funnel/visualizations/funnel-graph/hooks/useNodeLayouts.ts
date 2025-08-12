import React from 'react';

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

interface UseNodeLayoutsArgs {
  containerRef: React.RefObject<HTMLDivElement>;
  isValidData: boolean;
  minZoom: number;
  maxZoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  dimensions: { width: number; height: number };
  expectedNodes?: number;
}

export function useNodeLayouts({ containerRef, isValidData, minZoom, maxZoom, setZoom, setPan, dimensions, expectedNodes }: UseNodeLayoutsArgs) {
  const nodeLayoutsRef = React.useRef<Record<string, NodeLayout>>({});
  const [layoutVersion, setLayoutVersion] = React.useState(0);
  const lastFitSignatureRef = React.useRef<string | null>(null);

  const onNodeLayout = React.useCallback((id: string, layout: NodeLayout) => {
    nodeLayoutsRef.current[id] = layout;
    setLayoutVersion(v => v + 1);
  }, []);

  const getNodeLayout = React.useCallback((id?: string) => {
    if (!id) return undefined;
    return nodeLayoutsRef.current[id];
  }, []);

  // Fit-to-view when layouts settle and container is ready
  React.useEffect(() => {
    if (!isValidData) return;
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    const layouts = nodeLayoutsRef.current;
    const ids = Object.keys(layouts);
    if (ids.length === 0) return;

    const isFiniteNumber = (v: any) => typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v);
    const validIds = ids.filter(id => {
      const l = layouts[id];
      return l && isFiniteNumber(l.xLeft) && isFiniteNumber(l.xRight) && isFiniteNumber(l.yTop) && isFiniteNumber(l.yBottom) && l.height > 0 && l.width > 0;
    });
    if (expectedNodes && validIds.length < expectedNodes) return; // wait until all nodes are laid out
    if (!expectedNodes && validIds.length < 2) return;

    // Prefer main step nodes (exclude split nodes) for centering to keep a single row
    const mainIds = validIds.filter(id => !id.includes('split'));
    const idsForBounds = mainIds.length > 0 ? mainIds : validIds;
    const hasSplitNodes = validIds.some(id => id.includes('split'));

    // Use ALL nodes for horizontal and vertical bounds to avoid clipping
    const xs = validIds.flatMap(id => [layouts[id].xLeft, layouts[id].xRight]);
    const ys = validIds.flatMap(id => [layouts[id].yTop, layouts[id].yBottom]);
    let minX = Math.min(...xs);
    let maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);

    // Expand bounds slightly to account for stroke widths, labels, and halos
    const boundsExpandX = hasSplitNodes ? 36 : 24;
    const boundsExpandY = 24;
    minX -= boundsExpandX; maxX += boundsExpandX;
    minY -= boundsExpandY; maxY += boundsExpandY;
    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);

    // Avoid redundant re-fits if bounds haven't changed
    const signature = `${minX.toFixed(1)}:${maxX.toFixed(1)}:${minY.toFixed(1)}:${maxY.toFixed(1)}:${containerWidth}x${containerHeight}`;
    if (lastFitSignatureRef.current === signature) {
      return;
    }

    // Responsive padding based on container size and content aspect ratio
    const basePX = 140;
    const basePY = 140;
    const extraPY = Math.max(0, Math.min(120, contentHeight * 0.08));
    const paddingX = basePX;
    const paddingY = basePY + extraPY; // add more vertical padding for taller graphs
    const fitScaleX = (containerWidth - paddingX) / contentWidth;
    const fitScaleY = (containerHeight - paddingY) / contentHeight;
    // Choose the smaller scale to ensure both dimensions fit, but clamp to sensible limits
    let fitScale = Math.min(maxZoom, Math.max(minZoom, Math.min(fitScaleX, fitScaleY)));
    // Apply a small safety factor to avoid edge clipping due to strokes/labels/rounding
    const safety = hasSplitNodes ? 0.94 : 0.96;
    fitScale = Math.max(minZoom, Math.min(maxZoom, fitScale * safety));

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    // Center content exactly in both directions
    const newPanX = Math.round(containerCenterX - contentCenterX * fitScale);
    const newPanY = Math.round(containerCenterY - contentCenterY * fitScale);

    setZoom(fitScale);
    setPan({ x: newPanX, y: newPanY });
    lastFitSignatureRef.current = signature;
  }, [containerRef, isValidData, layoutVersion, dimensions.width, dimensions.height, maxZoom, minZoom, setPan, setZoom]);

  return { onNodeLayout, getNodeLayout } as const;
}


