import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Sankey, ResponsiveContainer } from 'recharts';
import { SankeyNode, SankeyLink } from './types';
import { SankeyLegend } from './components/SankeyLegend';
import CustomTooltip from './components/CustomTooltip';
import EnhancedNode from './components/EnhancedNode';
import EnhancedLink from './components/EnhancedLink';
import TagsToolbar from './components/TagsToolbar';
import OptionalMarkersOverlay from './components/OptionalMarkersOverlay';
import { useZoomPan } from './hooks/useZoomPan';
import { useEnhancedSankeyData } from './hooks/useEnhancedSankeyData';
import { useSankeyTooltip } from './hooks/useSankeyTooltip';
import ZoomControls from './components/ZoomControls';
import NavigationHint from './components/NavigationHint';
import { useNodeLayouts } from './hooks/useNodeLayouts';
import RechartsSankey from './components/RechartsSankey';

interface SankeyVisualizationProps {
  rechartsData: {
    nodes: Array<{
      name: string;
      value?: number;
      color?: string;
      index?: number;
    }>;
    links: Array<{
      source: number;
      target: number;
      value: number;
      sourceId?: string;
      targetId?: string;
      conversionRate?: number;
      sourceValue?: number;
    }>;
  };
  nodeMap: Record<string, SankeyNode>;
  initialValue: number;
  handleNodeMouseEnter?: (nodeId: string) => void;
  handleNodeMouseLeave?: () => void;
  handleLinkMouseEnter?: (link: SankeyLink) => void;
  handleLinkMouseLeave?: () => void;
  showTooltips?: boolean;
  interactiveTooltips?: boolean;
  funnelId?: string;
  enableDebug?: boolean;
}

export const SankeyVisualization: React.FC<SankeyVisualizationProps> = ({
  rechartsData,
  nodeMap,
  initialValue,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleLinkMouseEnter,
  handleLinkMouseLeave,
  showTooltips = true,
  interactiveTooltips = true,
  funnelId,
  enableDebug = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const {
    tooltipPosition,
    tooltipContent,
    tooltipVisible,
    selectedNode,
    setTooltipVisible,
    setSelectedNode,
    setTooltipContent,
    setTooltipPosition,
    handleNodeHover,
    handleLinkHover,
  } = useSankeyTooltip({
    containerRef,
    nodeMap,
    initialValue,
    showTooltips,
    interactiveTooltips,
    rechartsData,
    funnelId,
  });
  const [stepHeights, setStepHeights] = useState<Record<string, number>>({});
  
  // Update dimensions when container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial measurement
    updateDimensions();
    
    // Create a ResizeObserver to track container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    // Start observing the container
    resizeObserver.observe(containerRef.current);
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // React-rendered tooltip overlay (replaces DOM injection)
  // Rendering handled below via <CustomTooltip />
  
  // Zoom state
  const {
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
  } = useZoomPan(containerRef, { min: 0.1, max: 3 });

  const { enhancedData, isValidData, preCalculatedStepHeights, dynamicContainerHeight } = useEnhancedSankeyData(rechartsData as any);

  // Node layout tracking and fit-to-view logic (depends on isValidData and zoom setters)
  const { onNodeLayout, getNodeLayout } = useNodeLayouts({
    containerRef,
    isValidData,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    setZoom,
    setPan,
    dimensions,
  });

  // Handle step height changes
  const handleStepHeightChange = React.useCallback((stepName: string, height: number) => {
    setStepHeights(prev => {
      // Use our pre-calculated proportional height instead of Sankey-calculated height
      const preCalculatedHeight = preCalculatedStepHeights[stepName];
      
      // Use pre-calculated height if available, otherwise use provided height
      let validHeight = preCalculatedHeight || height;
      
      // Only fix truly problematic values
      if (validHeight <= 0) {
        // For negative heights, use a reasonable default
        validHeight = 60;
      } else if (validHeight < 5) {
        // For extremely small positive heights, use a minimum
        validHeight = 30;
      }
      
      // Only update if the height actually changed
      if (prev[stepName] !== validHeight) {
        if (enableDebug) {
          try { console.log('[DEBUG] Updating step height:', { stepName, originalHeight: height, preCalculatedHeight, validHeight }); } catch {}
        }
        
        return {
          ...prev,
          [stepName]: validHeight
        };
      }
      return prev;
    });
  }, [preCalculatedStepHeights]);

  // Add wheel event listener with non-passive mode
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      // Only zoom when Ctrl (Windows/Linux) or ⌘/Meta (macOS) is held
      if (!(e.ctrlKey || e.metaKey)) {
        return; // allow normal page scroll
      }
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta));
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  // Initial fit-to-view handled by useNodeLayouts

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <TagsToolbar />
      
      
      <SankeyLegend />
      
      <NavigationHint visible={zoom === 1 && pan.x === 0 && pan.y === 0} />
      
      <ZoomControls
        zoom={zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        isPannedOrZoomed={zoom !== 1 || pan.x !== 0 || pan.y !== 0}
      />
      
      <div 
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            minHeight: '400px',
            background: 'transparent',
            borderRadius: 0,
            padding: '24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            position: 'relative',
            boxSizing: 'border-box'
          }}  
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Tooltip overlay inside container for correct positioning */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <CustomTooltip
            active={tooltipVisible && Array.isArray(tooltipContent)}
            payload={Array.isArray(tooltipContent) ? tooltipContent : []}
            nodeMap={nodeMap}
            initialValue={initialValue}
            coordinate={tooltipPosition}
            funnelId={funnelId}
            onTooltipMouseEnter={() => {
              // Keep tooltip visible when mouse enters tooltip content
              setTooltipVisible(true);
            }}
            onTooltipMouseLeave={() => {
              // Hide tooltip when leaving the tooltip content area
              setTooltipVisible(false);
            }}
          />
        </div>

        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {isValidData ? (
            <RechartsSankey
              data={enhancedData}
              renderNode={React.useCallback((props) => (
                <EnhancedNode
                  {...props}
                  preCalculatedStepHeights={preCalculatedStepHeights}
                  onStepHeightChange={handleStepHeightChange}
                  totalNodes={enhancedData?.nodes?.length || 0}
                  handleNodeHover={handleNodeHover}
                  setTooltipVisible={setTooltipVisible}
                  setSelectedNode={setSelectedNode}
                  onNodeLayout={onNodeLayout}
                  debug={enableDebug}
                />
              ), [preCalculatedStepHeights, handleStepHeightChange, enhancedData?.nodes?.length, handleNodeHover, onNodeLayout, setTooltipVisible])}
              renderLink={React.useCallback((props) => (
                <EnhancedLink
                  {...props}
                  stepHeights={stepHeights}
                  preCalculatedStepHeights={preCalculatedStepHeights}
                  handleLinkHover={handleLinkHover}
                  setTooltipVisible={setTooltipVisible}
                  nodes={rechartsData.nodes}
                  getNodeLayout={getNodeLayout}
                  debug={enableDebug}
                />
              ), [stepHeights, preCalculatedStepHeights, handleLinkHover, getNodeLayout, rechartsData.nodes, setTooltipVisible])}
              nodePadding={80}
              nodeWidth={20}
              margin={{ top: 80, right: 200, bottom: 80, left: 200 }}
              iterations={64}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
              <p>Invalid data for visualization</p>
            </div>
          )}
        </div>
      </div>
      {isValidData && (
        <OptionalMarkersOverlay
          nodes={rechartsData.nodes as any}
          getLayout={(id: string) => getNodeLayout(id)}
        />
      )}

    </div>
  );
};