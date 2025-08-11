import React from 'react';

export function useZoomPan(containerRef: React.RefObject<HTMLDivElement>, options?: { min?: number; max?: number }) {
  const MIN_ZOOM = options?.min ?? 0.1;
  const MAX_ZOOM = options?.max ?? 3;

  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleZoomIn = React.useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, MAX_ZOOM));
  }, [MAX_ZOOM]);

  const handleZoomOut = React.useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, MIN_ZOOM));
  }, [MIN_ZOOM]);

  const handleResetZoom = React.useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan.x, pan.y]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart.x, dragStart.y]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta)));
  }, [MAX_ZOOM, MIN_ZOOM]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta)));
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [containerRef, MAX_ZOOM, MIN_ZOOM]);

  return {
    zoom,
    pan,
    isDragging,
    MIN_ZOOM,
    MAX_ZOOM,
    setZoom,
    setPan,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } as const;
}


