import React from 'react';

type SankeyNodeMap = Record<string, { value?: number }>;

type RechartsData = {
  nodes: Array<{ name: string; value?: number }>;
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

export function useSankeyTooltip(params: {
  containerRef: React.RefObject<HTMLDivElement>;
  nodeMap: SankeyNodeMap;
  initialValue: number;
  showTooltips: boolean;
  interactiveTooltips: boolean;
  rechartsData: RechartsData;
  funnelId?: string;
}) {
  const { containerRef, nodeMap, initialValue, showTooltips, interactiveTooltips, rechartsData } = params;

  type NodeTooltipPayload = { name: string; value: number };
  type LinkTooltipPayload = { source: number; target: number; value: number; sourceId?: string; targetId?: string };
  type TooltipArray = Array<{ payload: NodeTooltipPayload | LinkTooltipPayload }>;

  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = React.useState<TooltipArray | null>(null);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

  const handleNodeHover = React.useCallback((event: any, node: any) => {
    if (!showTooltips || !interactiveTooltips) return;

    const nodeId = node.name || node.id;
    const correctNode = nodeMap[nodeId] || rechartsData.nodes.find(n => n.name === nodeId);
    const nodeValue = correctNode?.value || node.value || 0;

    const tooltipData: NodeTooltipPayload = { name: nodeId, value: nodeValue };

    setTooltipContent([{ payload: tooltipData }]);

    const rect = containerRef.current?.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    // Position near cursor, but don't apply anchor offset here; leave to clamping layer
    let relX = clientX - (rect?.left || 0);
    let relY = clientY - (rect?.top || 0);
    const preClamp = { x: relX, y: relY };
    // Clamp tooltip within container with margins
    const margin = 12;
    const containerW = rect?.width || 0;
    const containerH = rect?.height || 0;
    const tooltipW = 260; // approximate tooltip width
    const tooltipH = 120; // approximate tooltip height
    // Light clamp margins to keep within view but let CustomTooltip finalize
    relX = Math.max(margin, Math.min(relX, containerW - margin));
    relY = Math.max(margin, Math.min(relY, containerH - margin));
    setTooltipPosition({ x: relX, y: relY });
    try {
      // Strategic debug logging for tooltip placement
      // eslint-disable-next-line no-console
      console.log('[DEBUG][Tooltip][Node] placement', {
        nodeId,
        client: { x: clientX, y: clientY },
        container: { width: containerW, height: containerH },
        preClamp,
        postClamp: { x: relX, y: relY },
        clamped: preClamp.x !== relX || preClamp.y !== relY
      });
    } catch {}
    setTooltipVisible(true);
    setSelectedNode(node.name || node.id);
  }, [containerRef, interactiveTooltips, nodeMap, rechartsData.nodes, showTooltips]);

  const handleLinkHover = React.useCallback((event: any, link: any) => {
    if (!showTooltips || !interactiveTooltips) return;
    const sourceNode = rechartsData.nodes.find(n => n.name === link.sourceId);
    const targetNode = rechartsData.nodes.find(n => n.name === link.targetId);
    if (!sourceNode || !targetNode) return;

    const linkValue = link.value;
    const sourceValue = link.sourceValue || sourceNode.value;

    const tooltipData: LinkTooltipPayload = {
      source: typeof link.source === 'number' ? link.source : 0,
      target: typeof link.target === 'number' ? link.target : 0,
      value: linkValue,
      sourceId: link.sourceId,
      targetId: link.targetId,
    };

    setTooltipContent([{ payload: tooltipData }]);
    const rect = containerRef.current?.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    let relX = clientX - (rect?.left || 0);
    let relY = clientY - (rect?.top || 0);
    const preClamp = { x: relX, y: relY };
    // Clamp tooltip within container with margins
    const margin = 12;
    const containerW = rect?.width || 0;
    const containerH = rect?.height || 0;
    const tooltipW = 260; // approximate tooltip width
    const tooltipH = 120; // approximate tooltip height
    relX = Math.max(margin, Math.min(relX, containerW - margin));
    relY = Math.max(margin, Math.min(relY, containerH - margin));
    setTooltipPosition({ x: relX, y: relY });
    try {
      // eslint-disable-next-line no-console
      console.log('[DEBUG][Tooltip][Link] placement', {
        link: { sourceId: link.sourceId, targetId: link.targetId, value: linkValue },
        client: { x: clientX, y: clientY },
        container: { width: containerW, height: containerH },
        preClamp,
        postClamp: { x: relX, y: relY },
        clamped: preClamp.x !== relX || preClamp.y !== relY
      });
    } catch {}
    setTooltipVisible(true);
  }, [containerRef, interactiveTooltips, rechartsData.nodes, showTooltips]);

  return {
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
  } as const;
}


