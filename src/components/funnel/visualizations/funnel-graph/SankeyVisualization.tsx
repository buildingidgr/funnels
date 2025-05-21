import React, { useRef, useState, useEffect } from 'react';
import { Sankey, ResponsiveContainer } from 'recharts';
import { SankeyNode, SankeyLink } from './types';
import { SankeyLegend } from './components/SankeyLegend';

interface SankeyVisualizationProps {
  rechartsData: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
  nodeMap: Record<string, SankeyNode>;
  initialValue: number;
  handleNodeMouseEnter?: (nodeId: string) => void;
  handleNodeMouseLeave?: () => void;
  handleLinkMouseEnter?: (link: SankeyLink) => void;
  handleLinkMouseLeave?: () => void;
  showTooltips?: boolean;
  interactiveTooltips?: boolean;
}

// Define distinct colors for steps
const STEP_COLORS = {
  main: {
    landing: '#3b82f6', // Blue for landing page
    destination: '#10b981', // Green for destination selection
    travelDetails: '#8b5cf6', // Purple for travel details
    booking: '#f59e0b', // Amber for booking
    confirmation: '#ef4444', // Red for confirmation
  },
  split: {
    domestic: '#34d399', // Light green for domestic
    international: '#60a5fa', // Light blue for international
  },
  links: {
    main: '#93c5fd', // Light blue for main flows
    domestic: '#6ee7b7', // Light green for domestic flows
    international: '#93c5fd', // Light blue for international flows
  }
};

const EnhancedNode = ({ x, y, width, height, index, payload, ...props }: any) => {
  const isSplit = payload.id.includes('split');
  const isDomestic = payload.name.toLowerCase().includes('domestic');
  const isInternational = payload.name.toLowerCase().includes('international');
  
  let nodeColor = STEP_COLORS.main.landing;
  
  // Determine node color based on step type
  if (isSplit) {
    nodeColor = isDomestic ? STEP_COLORS.split.domestic : STEP_COLORS.split.international;
  } else {
    switch (payload.name.toLowerCase()) {
      case 'landing page visit':
        nodeColor = STEP_COLORS.main.landing;
        break;
      case 'destination selection':
        nodeColor = STEP_COLORS.main.destination;
        break;
      case 'travel details':
        nodeColor = STEP_COLORS.main.travelDetails;
        break;
      case 'booking':
        nodeColor = STEP_COLORS.main.booking;
        break;
      case 'confirmation':
        nodeColor = STEP_COLORS.main.confirmation;
        break;
    }
  }

  return (
    <g className={`sankey-node-group ${isSplit ? 'sankey-split-node' : ''}`}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeColor}
        rx={4}
        ry={4}
        className="sankey-node"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          transition: 'all 0.2s ease'
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 10}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight="bold"
        className="sankey-node-label"
      >
        {payload.name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        className="sankey-node-value"
      >
        {payload.value.toLocaleString()} users
      </text>
    </g>
  );
};

const EnhancedLink = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, payload, ...props }: any) => {
  const isSplit = payload.sourceId?.includes('split') || payload.targetId?.includes('split');
  const isDomestic = payload.sourceId?.includes('domestic') || payload.targetId?.includes('domestic');
  
  let linkColor = STEP_COLORS.links.main;
  if (isSplit) {
    linkColor = isDomestic ? STEP_COLORS.links.domestic : STEP_COLORS.links.international;
  }

  const path = `M${sourceX},${sourceY} C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;
  
  return (
    <g className="sankey-link-group">
      <path
        d={path}
        fill="none"
        stroke={linkColor}
        strokeWidth={Math.max(payload.value / 100, 1)}
        strokeOpacity={0.6}
        className={`sankey-link-path ${isSplit ? 'sankey-split-link' : ''}`}
        style={{
          transition: 'all 0.2s ease',
          strokeDasharray: isSplit ? '4,2' : 'none'
        }}
      />
      <path
        d={path}
        fill="none"
        stroke="white"
        strokeWidth={Math.max(payload.value / 200, 0.5)}
        strokeOpacity={0.3}
        className="sankey-link-flow"
        style={{
          animation: 'flowAnimation 2s linear infinite',
          strokeDasharray: '4,4'
        }}
      />
    </g>
  );
};

// Add CSS animation for flow effect
const styles = `
  @keyframes flowAnimation {
    from {
      stroke-dashoffset: 8;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
`;

export const SankeyVisualization: React.FC<SankeyVisualizationProps> = ({
  rechartsData,
  nodeMap,
  initialValue,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleLinkMouseEnter,
  handleLinkMouseLeave,
  showTooltips = true,
  interactiveTooltips = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Transform data for Recharts Sankey
  const enhancedData = {
    nodes: rechartsData.nodes.map((node, index) => ({
      ...node,
      name: node.name,
      value: node.value,
      index // Add index for Recharts Sankey
    })),
    links: rechartsData.links.map(link => {
      const sourceNode = rechartsData.nodes.find(n => n.id === link.source);
      const targetNode = rechartsData.nodes.find(n => n.id === link.target);
      return {
        source: rechartsData.nodes.findIndex(n => n.id === link.source),
        target: rechartsData.nodes.findIndex(n => n.id === link.target),
        value: link.value,
        sourceId: link.source,
        targetId: link.target,
        color: link.color,
        sourceColor: sourceNode?.color,
        targetColor: targetNode?.color
      };
    })
  };

  const handleNodeHover = (event: any, node: any) => {
    if (!showTooltips || !interactiveTooltips) return;
    
    const nodeValue = node.value;
    const percentage = ((nodeValue / initialValue) * 100).toFixed(1);
    
    setTooltipContent(
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '13px',
        lineHeight: 1.4,
        color: '#1e293b',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'opacity 0.2s ease',
        maxWidth: '280px'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#0f172a' }}>{node.name}</div>
        <div style={{ color: '#334155', marginBottom: 2 }}>
          <b>{nodeValue.toLocaleString()}</b> users
        </div>
        <div style={{ color: '#64748b', fontSize: '12px' }}>
          {percentage}% of total
        </div>
      </div>
    );
    
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    setTooltipVisible(true);
  };

  const handleLinkHover = (event: any, link: any) => {
    if (!showTooltips || !interactiveTooltips) return;
    
    const sourceNode = rechartsData.nodes.find(n => n.id === link.sourceId);
    const targetNode = rechartsData.nodes.find(n => n.id === link.targetId);
    
    if (!sourceNode || !targetNode) return;
    
    const linkValue = link.value;
    const sourceValue = sourceNode.value;
    const percentage = ((linkValue / sourceValue) * 100).toFixed(1);
    
    setTooltipContent(
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '13px',
        lineHeight: 1.4,
        color: '#1e293b',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'opacity 0.2s ease',
        maxWidth: '280px'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#0f172a' }}>
          {sourceNode.name} → {targetNode.name}
        </div>
        <div style={{ color: '#334155', marginBottom: 2 }}>
          <b>{linkValue.toLocaleString()}</b> users
        </div>
        <div style={{ color: '#64748b', fontSize: '12px' }}>
          {percentage}% conversion
        </div>
      </div>
    );
    
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    setTooltipVisible(true);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: '#f8fafc',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <SankeyLegend />
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(30,41,59,0.08)'
      }} ref={containerRef}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={enhancedData}
            node={EnhancedNode}
            link={EnhancedLink}
            nodePadding={24}
            nodeWidth={20}
            width={dimensions.width}
            height={dimensions.height}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            iterations={64}
            onMouseEnter={handleNodeHover}
            onMouseLeave={() => setTooltipVisible(false)}
          />
        </ResponsiveContainer>
      </div>
      {showTooltips && tooltipVisible && tooltipContent && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}; 