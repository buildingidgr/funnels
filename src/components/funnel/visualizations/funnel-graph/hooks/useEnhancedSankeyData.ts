import React from 'react';

type NodeInput = {
  name: string;
  value?: number;
  color?: string;
  index?: number;
};

type LinkInput = {
  source: number;
  target: number;
  value: number;
  sourceId?: string;
  targetId?: string;
  conversionRate?: number;
  sourceValue?: number;
};

export function useEnhancedSankeyData(rechartsData: { nodes: NodeInput[]; links: LinkInput[] }) {
  const enhancedData = React.useMemo(() => {
    const nodes = rechartsData.nodes.map((node, index) => {
      const rawValue = typeof node.value === 'number' ? node.value : 0;
      // Use a small epsilon for zero values to avoid NaN layout in d3-sankey divisions
      const safeValue = rawValue > 0 ? rawValue : 0.1;
      return {
      name: node.name,
      value: safeValue,
      color: node.color,
      index,
      conversionRate: 0,
    }});

    // Prepare links and sort for layering (optional behind, split middle, main on top)
    const rawLinks = rechartsData.links.map(link => ({
      source: link.source,
      target: link.target,
      value: typeof link.value === 'number' ? link.value : 0,
      sourceId: link.sourceId || '',
      targetId: link.targetId || '',
      conversionRate: link.conversionRate || 0,
      sourceValue: link.sourceValue || 0,
    }));

    const linkPriority = (l: { sourceId?: string; targetId?: string }) => {
      const s = l.sourceId || '';
      const t = l.targetId || '';
      const isSplit = s.includes('-split-') || t.includes('-split-');
      // Determine optional by step number gap
      const sNum = parseInt((s.match(/step-(\d+)/)?.[1] || ''), 10);
      const tNum = parseInt((t.match(/step-(\d+)/)?.[1] || ''), 10);
      const isOptional = Number.isFinite(sNum) && Number.isFinite(tNum) && Math.abs(tNum - sNum) > 1;
      // Lower number renders first (behind)
      return isOptional ? 0 : isSplit ? 1 : 2;
    };

    // Ensure link values have a minimum epsilon to avoid zero-width paths causing NaN in some renderers
    const links = rawLinks
      .map(l => ({ ...l, value: l.value > 0 ? l.value : 0.1 }))
      .sort((a, b) => linkPriority(a) - linkPriority(b));

    return { nodes, links };
  }, [rechartsData]);

  const isValidData = React.useMemo(() => {
    // Allow zero-value nodes/links; just require valid indices
    const nodesNonNegative = enhancedData.nodes.every(n => typeof n.value === 'number' && n.value >= 0);
    const linksNonNegative = enhancedData.links.every(l => typeof l.value === 'number' && l.value >= 0);
    const linksIndicesValid = enhancedData.links.every(l => l.source >= 0 && l.target >= 0 && l.source < enhancedData.nodes.length && l.target < enhancedData.nodes.length);
    return (
      enhancedData.nodes.length > 0 &&
      enhancedData.links.length > 0 &&
      nodesNonNegative &&
      linksNonNegative &&
      linksIndicesValid
    );
  }, [enhancedData]);

  const preCalculatedStepHeights = React.useMemo(() => {
    const heights: Record<string, number> = {};
    const maxValue = Math.max(...enhancedData.nodes.map(n => n.value || 0));
    const minHeight = 20;
    const maxHeight = 170;
    enhancedData.nodes.forEach((node, index) => {
      const nodeValue = node.value || 0;
      let calculatedHeight = minHeight;
      if (maxValue > 0) {
        calculatedHeight = Math.max(minHeight, Math.min(maxHeight, (nodeValue / maxValue) * 120 + 20));
      }
      heights[node.name] = calculatedHeight;
      heights[`step-${index}`] = calculatedHeight;
    });
    return heights;
  }, [enhancedData.nodes]);

  const dynamicContainerHeight = React.useMemo(() => {
    const splitNodes = enhancedData.nodes.filter(node => node.name.includes('split'));
    const maxSplits = Math.max(
      ...enhancedData.nodes.map(node => {
        const stepName = node.name;
        const stepIndex = enhancedData.nodes.findIndex(n => n.name === stepName);
        const nextStep = enhancedData.nodes[stepIndex + 1];
        if (nextStep && nextStep.name.includes('split')) {
          return enhancedData.nodes.filter(n => n.name.includes('split') && n.name.startsWith(stepName.split('-')[0])).length;
        }
        return 0;
      })
    );
    const baseHeight = 440;
    const extraHeightPerSplit = 40;
    const totalExtraHeight = Math.max(0, (isFinite(maxSplits) ? maxSplits : 0) * extraHeightPerSplit);
    return baseHeight + totalExtraHeight;
  }, [enhancedData.nodes]);

  return {
    enhancedData,
    isValidData,
    preCalculatedStepHeights,
    dynamicContainerHeight,
  } as const;
}


