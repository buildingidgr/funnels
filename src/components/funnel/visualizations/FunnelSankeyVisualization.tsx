import React, { useState, useEffect } from 'react';
import { ResponsiveSankey, SankeyNodeDatum, SankeyLinkDatum } from '@nivo/sankey';
import { FunnelStep } from '@/types/funnel';
import { FunnelApi } from '@/services/api';
import { Chip } from '@nivo/tooltip';

interface FunnelSankeyVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

// Helper to format large numbers (e.g., 10000 -> 10k)
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

interface SankeyInputNode {
    id: string;
    name: string;
    value: number;
    isOptional?: boolean;
    isSplit?: boolean;
    parentId?: string;
}

interface SankeyInputLink {
    source: string;
    target: string;
    value: number;
}

const FunnelSankeyVisualization: React.FC<FunnelSankeyVisualizationProps> = ({ steps, initialValue, funnelId }) => {
  const [calculatedResults, setCalculatedResults] = useState<Record<string, number> | null>(null);
  
  // Calculate step metrics
  const stepMetrics = steps.map((step, index) => {
    const currentValue = calculatedResults?.[step.id] || 0;
    const previousValue = index === 0 ? initialValue : (calculatedResults?.[steps[index - 1].id] || 0);
    const conversionRate = previousValue > 0 ? (currentValue / previousValue) * 100 : 0;
    const dropOff = previousValue - currentValue;
    const dropOffRate = previousValue > 0 ? (dropOff / previousValue) * 100 : 0;
    
    return {
      step,
      conversionRate,
      dropOff,
      dropOffRate
    };
  });

  const bestConvertingStep = stepMetrics.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );
  
  const highestDropOffStep = stepMetrics.reduce((worst, current) => 
    current.dropOffRate > worst.dropOffRate ? current : worst
  );

  useEffect(() => {
    if (!funnelId) return;
    const fetchResults = async () => {
      try {
        const results = await FunnelApi.calculateFunnel(funnelId);
        console.log('Calculated results from API:', results);
        setCalculatedResults(results);
      } catch (error) {
        console.error('Error calculating funnel:', error);
      }
    };
    fetchResults();
  }, [funnelId, steps]);

  if (!steps || steps.length === 0 || !calculatedResults) {
    return <div className="p-4 text-center text-gray-400">Loading data or no steps to display...</div>;
  }

  const nodeValuesForCalculation: Record<string, number> = { start: initialValue };
  steps.forEach(step => {
    const stepId = `step-${step.id}`;
    nodeValuesForCalculation[stepId] = calculatedResults[step.id] || 0;
    if (step.splitVariations) {
      step.splitVariations.forEach((sv, svi) => {
        const splitNodeId = `step-${step.id}-split-${svi}`;
        const variationApiId = `${step.id}-variation-${svi + 1}`;
        nodeValuesForCalculation[splitNodeId] = calculatedResults[variationApiId] || 0;
      });
    }
  });
  nodeValuesForCalculation['end'] = calculatedResults[steps[steps.length - 1].id] || 0;

  // Prepare nodes for Sankey. Nivo will add properties like x0, y0, color etc.
  const sankeyGraphNodesInput = [
    { id: 'start', name: 'Start', value: nodeValuesForCalculation['start'] },
    ...steps.map(step => ({
      id: `step-${step.id}`,
      name: step.name,
      isOptional: !step.isRequired,
      value: nodeValuesForCalculation[`step-${step.id}`] || 0
    })),
    ...steps.flatMap(step => 
      step.splitVariations
        ? step.splitVariations.map((split, splitIndex) => ({
            id: `step-${step.id}-split-${splitIndex}`,
            name: split.name,
            isSplit: true,
            value: nodeValuesForCalculation[`step-${step.id}-split-${splitIndex}`] || 0,
            parentId: `step-${step.id}`
          }))
        : []
    ),
    { id: 'end', name: 'End', value: nodeValuesForCalculation['end'] || 0 }
  ];

  const sankeyGraphLinksInput = [
      {
        source: 'start',
        target: `step-${steps[0].id}`,
        value: calculatedResults[steps[0].id] || 0
      },
      ...steps.slice(0, -1).flatMap((step, index) => {
        const nextStep = steps[index + 1];
        if (step.splitVariations && step.splitVariations.length > 0) return [];
        const nextStepValue = calculatedResults[nextStep.id] || 0;
        return [{
          source: `step-${step.id}`,
          target: `step-${nextStep.id}`,
          value: nextStepValue > 0 ? nextStepValue : 0
        }]; 
      }),
      ...steps.flatMap((step, stepIndex) => {
        if (!step.splitVariations || step.splitVariations.length === 0) return [];
        const totalSplitValue = step.splitVariations.reduce((total, s, i) => {
          const variationId = `${step.id}-variation-${i + 1}`;
          return total + (calculatedResults[variationId] || 0);
        }, 0);

        return step.splitVariations.flatMap((split, splitVarIndex) => {
          const variationId = `${step.id}-variation-${splitVarIndex + 1}`;
          const splitNodeId = `step-${step.id}-split-${splitVarIndex}`;
          const splitValue = calculatedResults[variationId] || 0;
          const safeSplitValue = splitValue > 0 ? splitValue : 0;
          const linksToAdd = [
            { source: `step-${step.id}`, target: splitNodeId, value: safeSplitValue }
          ];
          if (stepIndex < steps.length - 1) {
            const nextMainStep = steps[stepIndex + 1];
            const nextMainStepValue = calculatedResults[nextMainStep.id] || 0;
            const splitProportion = totalSplitValue > 0 ? safeSplitValue / totalSplitValue : 0;
            const contributionToNext = Math.round(nextMainStepValue * splitProportion);
            if (contributionToNext > 0) {
              linksToAdd.push({ source: splitNodeId, target: `step-${nextMainStep.id}`, value: contributionToNext });
            }
          }
          return linksToAdd;
        });
      }),
      {
        source: `step-${steps[steps.length - 1].id}`,
        target: 'end',
        value: calculatedResults[steps[steps.length - 1].id] || 0
      }
  ].filter(link => link && typeof link.value === 'number' && link.value > 0)
   .map(link => ({ ...link, value: Math.max(0.001, link.value) })); // Ensure tiny value to render zero-value links

  const data = { nodes: sankeyGraphNodesInput, links: sankeyGraphLinksInput };
  
  const NodeTooltipComponent: React.FC<{ node: SankeyNodeDatum<SankeyInputNode, SankeyInputLink> }> = ({ node }) => {
    let details = <></>;
    const isSplit = (node as { isSplit?: boolean }).isSplit;
    const parentId = (node as { parentId?: string }).parentId;
    const isOptional = (node as { isOptional?: boolean }).isOptional;
    const nodeName = (node as { name?: string }).name || node.id;

    if (node.id === 'start' || node.id === 'end') {
      details = (
        <div className="text-gray-700">
          <p className="text-lg font-semibold">{node.formattedValue || formatNumber(node.value)} users</p>
        </div>
      );
    } else if (isSplit && parentId && calculatedResults && nodeValuesForCalculation[parentId]) {
      const parentValue = nodeValuesForCalculation[parentId];
      const percentageOfParent = parentValue > 0 ? ((node.value / parentValue) * 100).toFixed(1) : '0.0';
      const parentNodeFromInput = sankeyGraphNodesInput.find(n => n.id === parentId);
      let dropOffInfo = '';

      // Calculate users from the parent step who did not take this specific variation path
      const usersNotTakingThisPath = parentValue - node.value;
      if (usersNotTakingThisPath > 0) {
           const percentageNotTakingThisPath = parentValue > 0 ? ((usersNotTakingThisPath / parentValue) * 100).toFixed(1) : '0.0';
           dropOffInfo = `${formatNumber(usersNotTakingThisPath)} (${percentageNotTakingThisPath}%) from ${parentNodeFromInput?.name || 'parent'} did not take this variation`;
      }

      details = (
        <div className="text-gray-700">
          <p className="text-lg font-semibold">{node.formattedValue || formatNumber(node.value)} users</p>
          <p className="text-sm text-gray-600 mt-1">{percentageOfParent}% of {parentNodeFromInput?.name || 'parent'}</p>
          {dropOffInfo && <p className="text-sm text-red-500 mt-1">{dropOffInfo}</p>}
        </div>
      );
    } else if (calculatedResults) {
      const stepIndex = steps.findIndex(s => `step-${s.id}` === node.id);
      let rateInfo = '';
      let dropOffInfo = '';

      if (stepIndex === 0) {
        const percentageOfTotal = initialValue > 0 ? ((node.value / initialValue) * 100).toFixed(1) : '0.0';
        rateInfo = `${percentageOfTotal}% of initial`;
        if (initialValue > node.value) {
          const dropOffCount = initialValue - node.value;
          const dropOffPercentage = initialValue > 0 ? ((dropOffCount / initialValue) * 100).toFixed(1) : '0.0';
          dropOffInfo = `${formatNumber(dropOffCount)} (${dropOffPercentage}%) users dropped off`;
        }
      } else if (stepIndex > 0) {
        const prevStep = steps[stepIndex-1];
        const prevStepValue = calculatedResults[prevStep.id] || 0;
        const conversionRate = prevStepValue > 0 ? ((node.value / prevStepValue) * 100).toFixed(1) : 'N/A';
        rateInfo = `${conversionRate}% from ${prevStep.name}`;
        if (prevStepValue > node.value) {
          const dropOffCount = prevStepValue - node.value;
          const dropOffPercentage = prevStepValue > 0 ? ((dropOffCount / prevStepValue) * 100).toFixed(1) : '0.0';
          dropOffInfo = `${formatNumber(dropOffCount)} (${dropOffPercentage}%) users dropped off`;
        }
      }
      details = (
        <div className="text-gray-700">
          <p className="text-lg font-semibold">{node.formattedValue || formatNumber(node.value)} users</p>
          {rateInfo && <p className="text-sm text-gray-600 mt-1">{rateInfo}</p>}
          {dropOffInfo && <p className="text-sm text-red-500 mt-1">{dropOffInfo}</p>}
          {isOptional && <p className="text-sm text-purple-600 italic mt-1">Optional Step</p>}
        </div>
      );
    }
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 min-w-[200px] border border-gray-200">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <Chip color={node.color} />
          <strong className="text-gray-900">{nodeName}</strong>
        </div>
        {details}
      </div>
    );
  };

  const LinkTooltipComponent: React.FC<{ link: SankeyLinkDatum<SankeyInputNode, SankeyInputLink> }> = ({ link }) => {
    const sourceNodeValue = link.source.value || 0;
    const percentageOfSource = sourceNodeValue > 0 
      ? ((link.value / sourceNodeValue) * 100).toFixed(1) 
      : '0.0';
    
    const sourceName = (link.source as { name?: string }).name || link.source.id;
    const targetName = (link.target as { name?: string }).name || link.target.id;
    
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 min-w-[250px] border border-gray-200">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <Chip color={link.color} />
          <strong className="text-gray-900">
            {sourceName} → {targetName}
          </strong>
        </div>
        <div className="text-gray-700">
          <p className="text-lg font-semibold">
            {link.formattedValue || formatNumber(link.value)} users
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {percentageOfSource}% of {sourceName}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Funnel Path Legend removed */}
      {/* Sankey Graph Container */}
      <div className="relative bg-white rounded-lg p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Sankey Graph */}
        <div style={{ height: '600px' }}>
          <ResponsiveSankey
            data={data}
            margin={{ top: 40, right: 160, bottom: 40, left: 100 }}
            align="justify"
            colors={(nodeFromData: SankeyInputNode) => {
              if (nodeFromData.id === 'start' || nodeFromData.id === 'end') return '#3b82f6';
              if (nodeFromData.isSplit) return '#6366f1';
              return nodeFromData.isOptional ? '#a855f7' : '#22c55e';
            }}
            nodeOpacity={1}
            nodeHoverOpacity={0.95}
            nodeHoverOthersOpacity={0.2}
            nodeThickness={16}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.7]] }}
            nodeBorderRadius={4}
            linkOpacity={0.5}
            linkHoverOpacity={0.8}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            label={() => ''}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
            nodeTooltip={NodeTooltipComponent}
            linkTooltip={LinkTooltipComponent}
            theme={{
              tooltip: {
                container: {
                  background: '#ffffff',
                  color: '#333333',
                  fontSize: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }
              }
            }}
            motionConfig="gentle"
            animate={true}
            role="application"
            ariaLabel="Funnel Sankey Diagram"
            ariaDescribedBy="funnel-sankey-description"
          />
        </div>

        {/* Accessibility Description */}
        <div id="funnel-sankey-description" className="sr-only">
          Interactive Sankey diagram showing the flow of users through the funnel steps.
          Each node represents a step in the funnel, and the links show the flow of users between steps.
          The width of each link represents the number of users flowing through that path.
        </div>
      </div>
    </div>
  );
};

export default FunnelSankeyVisualization; 