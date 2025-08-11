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
}

export function useNodeLayouts({ containerRef, isValidData, minZoom, maxZoom, setZoom, setPan, dimensions }: UseNodeLayoutsArgs) {
  const nodeLayoutsRef = React.useRef<Record<string, NodeLayout>>({});
  const [layoutVersion, setLayoutVersion] = React.useState(0);
  const didInitialFitRef = React.useRef(false);

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

    const padding = 120;
    const fitScaleX = (containerWidth - padding) / contentWidth;
    const fitScaleY = (containerHeight - padding) / contentHeight;
    const fitScale = Math.min(maxZoom, Math.max(minZoom, Math.min(fitScaleX, fitScaleY)));

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    const newPanX = (containerCenterX - contentCenterX * fitScale);
    const newPanY = (containerCenterY - contentCenterY * fitScale);

    setZoom(fitScale);
    setPan({ x: newPanX, y: newPanY });
    didInitialFitRef.current = true;
  }, [containerRef, isValidData, layoutVersion, dimensions.width, dimensions.height, maxZoom, minZoom, setPan, setZoom]);

  return { onNodeLayout, getNodeLayout } as const;
}


