import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Sankey } from '@nivo/sankey';
import { FunnelStep } from '@/types/funnel';
import { FunnelApi } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

interface FunnelSankeyVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

interface CustomLinkProps {
  link: any;
  sankeyData: {
    nodes: Array<{
      id: string;
      name: string;
      value: number;
      color: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
      color: string;
      percentage: string;
    }>;
  };
}

const CustomLink: React.FC<CustomLinkProps> = ({ link, sankeyData }) => {
  const { sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, targetWidth, targetHeight, value } = link;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Find the link data
  const linkData = sankeyData.links.find(l => 
    l.source === link.source.id && l.target === link.target.id
  );
  
  // Calculate the conversion rate for this link
  const sourceNode = sankeyData.nodes.find(n => n.id === link.source.id);
  const conversionRate = sourceNode ? (value / sourceNode.value) * 100 : 0;
  
  // Scale the width based on the conversion rate
  // Base width is 1, max width is 12
  const strokeWidth = Math.max(1, Math.min(12, conversionRate / 8));
  
  const handleMouseEnter = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  return (
    <g>
      <path
        d={`M${sourceX},${sourceY + sourceHeight / 2} C${sourceX + (targetX - sourceX) / 3},${sourceY + sourceHeight / 2} ${targetX - (targetX - sourceX) / 3},${targetY + targetHeight / 2} ${targetX},${targetY + targetHeight / 2}`}
        fill="none"
        stroke={link.color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.5}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {showTooltip && (
        <foreignObject
          x={tooltipPosition.x}
          y={tooltipPosition.y - 60}
          width={200}
          height={80}
          style={{ overflow: 'visible' }}
        >
          <div style={{
            background: 'white',
            padding: '9px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {sourceNode?.name} → {sankeyData.nodes.find(n => n.id === link.target.id)?.name}
            </div>
            <div style={{ fontSize: '14px' }}>
              Conversion Rate: {linkData?.percentage || `${conversionRate.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Users: {value.toLocaleString()}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const FunnelSankeyVisualization: React.FC<FunnelSankeyVisualizationProps> = ({ steps, initialValue, funnelId }) => {
  const isHoveringRef = useRef(false);
  const sankeyWidth = 1200;
  const [calculatedResults, setCalculatedResults] = useState<Record<string, number> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(1000);
  
  // Create a map to store node IDs and their corresponding UUIDs
  const nodeIdMap = useRef(new Map<string, string>());
  
  // Function to get or create a node ID
  const getNodeId = useCallback((originalId: string) => {
    if (!nodeIdMap.current.has(originalId)) {
      nodeIdMap.current.set(originalId, uuidv4());
    }
    return nodeIdMap.current.get(originalId)!;
  }, []);

  // Function to get the original ID from a UUID
  const getOriginalId = useCallback((uuid: string) => {
    for (const [originalId, id] of nodeIdMap.current.entries()) {
      if (id === uuid) return originalId;
    }
    return null;
  }, []);
  
  // Update container height when window resizes
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = Math.max(containerRef.current.clientHeight, 1000);
        setContainerHeight(height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  // Fetch calculated results when funnelId changes or when steps change
  useEffect(() => {
    if (!funnelId) return;
    
    const fetchResults = async () => {
      try {
        const results = await FunnelApi.calculateFunnel(funnelId);
        console.log('DEBUGFIX: Calculated results:', results);
        setCalculatedResults(results);
      } catch (error) {
        console.error('Error calculating funnel:', error);
      }
    };
    
    fetchResults();
  }, [funnelId, steps]);
  
  // Debug check to see if we're getting updated steps and results
  console.log('DEBUGFIX: Rendering with steps and results:', {
    steps,
    calculatedResults
  });
  
  // Build Sankey data using calculated results
  const sankeyData = {
    nodes: [],
    links: []
  };

  // Add initial node
  const startId = getNodeId('start');
  sankeyData.nodes.push({
    id: startId,
    name: 'Start',
    value: initialValue,
    color: '#2563eb'
  });

  // Process each step
  steps.forEach((step, index) => {
    console.log('\nProcessing step:', {
      name: step.name,
      id: step.id,
      isRequired: step.isRequired,
      calculatedValue: calculatedResults?.[step.id]
    });
    
    // Get UUID for this step
    const stepId = getNodeId(step.id);
    // Use exact API value
    const stepValue = calculatedResults?.[step.id] || 0;
    
    console.log(`Added main step node:`, {
      name: step.name,
      id: stepId,
      originalId: step.id,
      value: stepValue,
      isOptional: !step.isRequired,
      column: index + 1
    });
    
    sankeyData.nodes.push({
      id: stepId,
      name: step.name,
      value: stepValue,
      color: getStepColor(step, index)
    });

    // Add link from previous step or start
    const sourceId = index === 0 ? startId : getNodeId(steps[index - 1].id);
    const sourceValue = index === 0 ? initialValue : calculatedResults?.[steps[index - 1].id] || 0;
    
    if (!step.isRequired) {
      // For optional steps, create a clearer dual-flow representation
      const optionalValue = calculatedResults?.[step.id] || 0;
      const skipValue = sourceValue - optionalValue;
      
      console.log(`Added optional step dual flow:`, {
        source: sourceId,
        target: stepId,
        optionalValue,
        skipValue,
        sourceValue,
        sourceId,
        targetId: stepId
      });
      
      // Add link through the optional step (completed path)
      sankeyData.links.push({
        source: sourceId,
        target: stepId,
        value: optionalValue,
        color: getLinkColor(index, true), // Optional step path
        percentage: `${((optionalValue / sourceValue) * 100).toFixed(1)}%`
      });

      // Add link from optional step to next step (completed path continuation)
      if (index < steps.length - 1) {
        const nextStep = steps[index + 1];
        const nextStepId = getNodeId(nextStep.id);
        const nextStepValue = calculatedResults?.[nextStep.id] || 0;
        const optionalNextValue = Math.round(nextStepValue * (optionalValue / sourceValue));
        
        sankeyData.links.push({
          source: stepId,
          target: nextStepId,
          value: optionalNextValue,
          color: getLinkColor(index, true), // Optional step path
          percentage: `${((optionalNextValue / optionalValue) * 100).toFixed(1)}%`
        });
      }

      // Add bypass link directly to next step (skipped path)
      if (index < steps.length - 1) {
        const nextStep = steps[index + 1];
        const nextStepId = getNodeId(nextStep.id);
        const nextStepValue = calculatedResults?.[nextStep.id] || 0;
        const bypassValue = Math.round(nextStepValue * (skipValue / sourceValue));
        
        console.log(`Added skip path link:`, {
          source: sourceId,
          target: nextStepId,
          value: bypassValue,
          sourceId,
          targetId: nextStepId
        });
        
        sankeyData.links.push({
          source: sourceId,
          target: nextStepId,
          value: bypassValue,
          color: getLinkColor(index + 1, false), // Different color for skip path
          percentage: `${((bypassValue / skipValue) * 100).toFixed(1)}%`
        });
      }
    } else {
      // For required steps, add direct link with exact API value
      console.log(`Added main link:`, {
        source: sourceId,
        target: stepId,
        value: stepValue,
        sourceValue,
        sourceId,
        targetId: stepId
      });
      
      sankeyData.links.push({
        source: sourceId,
        target: stepId,
        value: stepValue,
        color: getLinkColor(index, false),
        percentage: `${((stepValue / sourceValue) * 100).toFixed(1)}%`
      });

      // Add link to next step if it exists
      if (index < steps.length - 1) {
        const nextStep = steps[index + 1];
        const nextStepId = getNodeId(nextStep.id);
        const nextStepValue = calculatedResults?.[nextStep.id] || 0;
        
        sankeyData.links.push({
          source: stepId,
          target: nextStepId,
          value: nextStepValue,
          color: getLinkColor(index + 1, false),
          percentage: `${((nextStepValue / stepValue) * 100).toFixed(1)}%`
        });
      }
    }

    // Handle split variations
    if (step.splitVariations && step.splitVariations.length > 0) {
      console.log(`DEBUGFIX: Processing splits for step:`, {
        name: step.name,
        id: step.id,
        stepValue,
        variations: step.splitVariations
      });
      
      // Calculate total value for all variations
      let totalVariationValue = 0;
      const variationValues = step.splitVariations.map((split, splitIndex) => {
        // Use the exact ID format that matches the API
        const variationId = `${step.id}-variation-${splitIndex + 1}`;
        const value = calculatedResults?.[variationId] || 0;
        console.log(`DEBUGFIX: Found variation value:`, {
          variationId,
          value,
          valueType: typeof value,
          name: split.name,
          calculatedValue: calculatedResults?.[variationId],
          calculatedValueType: typeof calculatedResults?.[variationId]
        });
        totalVariationValue += value;
        return { id: variationId, value, name: split.name };
      });
      
      console.log(`DEBUGFIX: Variation summary:`, {
        stepName: step.name,
        stepValue,
        totalVariationValue,
        variations: variationValues
      });
      
      // Process each variation
      variationValues.forEach(({ id, value, name }, variationIndex) => {
        const splitId = getNodeId(id);
        
        // IMPORTANT: Create a local constant to ensure we don't lose the value
        const splitValue = value;
        
        console.log(`DEBUGFIX: Added split node:`, {
          name: name,
          id: splitId,
          originalId: id,
          value: splitValue,
          isSplit: true,
          column: index + 1
        });
        
        // Add split node with exact API value
        sankeyData.nodes.push({
          id: splitId,
          name: name,
          value: splitValue,
          color: getStepColor(step, index + variationIndex + 1) // Different color for each split
        });

        // Add link from main step to split with exact API value
        console.log(`DEBUGFIX: Added split link:`, {
          source: stepId,
          target: splitId,
          value: splitValue,
          sourceId: stepId,
          targetId: splitId,
          percentage: `${((splitValue / stepValue) * 100).toFixed(1)}%`
        });
        
        sankeyData.links.push({
          source: stepId,
          target: splitId,
          value: splitValue,
          color: getLinkColor(index + variationIndex + 1, false),
          percentage: `${((splitValue / stepValue) * 100).toFixed(1)}%`
        });

        // Add link from split to next step if it exists
        if (index < steps.length - 1) {
          const nextStep = steps[index + 1];
          const nextStepId = getNodeId(nextStep.id);
          const nextStepValue = calculatedResults?.[nextStep.id] || 0;
          
          // Calculate the split's contribution to the next step based on its proportion
          const splitNextValue = Math.round(nextStepValue * (splitValue / totalVariationValue));
          
          console.log(`DEBUGFIX: Added split-to-next link:`, {
            source: splitId,
            target: nextStepId,
            value: splitNextValue,
            totalVariationValue,
            variationValue: splitValue,
            nextValue: nextStepValue,
            sourceId: splitId,
            targetId: nextStepId,
            percentage: `${((splitNextValue / splitValue) * 100).toFixed(1)}%`
          });
          
          sankeyData.links.push({
            source: splitId,
            target: nextStepId,
            value: splitNextValue,
            color: '#0891b290',
            percentage: `${((splitNextValue / splitValue) * 100).toFixed(1)}%`
          });
        }
      });

      // Remove the main step link since we're using split variations
      sankeyData.links = sankeyData.links.filter(link => 
        !(link.source === sourceId && link.target === stepId)
      );

      // Update the main step node value to match the total variation value
      const mainStepNode = sankeyData.nodes.find(node => node.id === stepId);
      if (mainStepNode) {
        mainStepNode.value = totalVariationValue;
      }
    }
  });

  // Add end node
  const lastStep = steps[steps.length - 1];
  const lastStepId = getNodeId(lastStep.id);
  const endId = getNodeId('end');
  const lastValue = calculatedResults?.[lastStep.id] || 0;
  
  sankeyData.nodes.push({
    id: endId,
    name: 'End',
    value: lastValue,
    color: '#2563eb'
  });

  console.log('\nAll nodes created:', sankeyData.nodes.map(node => ({
    ...node,
    originalId: getOriginalId(node.id)
  })));
  
  // Add final link
  console.log(`Added final link:`, {
    source: lastStepId,
    target: endId,
    value: lastValue
  });
  
  sankeyData.links.push({
    source: lastStepId,
    target: endId,
    value: lastValue,
    color: '#2563eb90',
    percentage: '100%'
  });

  const getNodeColor = (node: any) => {
    const originalId = getOriginalId(node.id);
    
    // Handle special cases first
    if (originalId === 'start') return '#3b82f6'; // Blue for start
    if (originalId === 'end') return '#ef4444'; // Red for end
    if (originalId?.includes('variation')) return '#0e7490'; // Cyan for variations
    
    // Find the step and its index
    const step = steps.find(s => s.id === originalId);
    if (!step) return '#6b7280'; // Gray for unknown steps
    
    const stepIndex = steps.findIndex(s => s.id === originalId);
    
    // Use the diverse color palette based on step index
    return getStepColor(step, stepIndex);
  };

  const sankeyGraphLinksInput = [
    {
      source: 'start',
      target: `step-${steps[0].id}`,
      value: calculatedResults[steps[0].id] || 0
    },
    ...steps.slice(0, -1).flatMap((step, index) => {
      const nextStep = steps[index + 1];
      const nextStepValue = calculatedResults[nextStep.id] || 0;
      const currentStepValue = calculatedResults[step.id] || 0;
      
      // For optional steps, add both the direct path and the bypass path
      if (!step.isRequired) {
        const skipValue = currentStepValue - nextStepValue;
        return [
          // Direct path through the optional step
          {
            source: `step-${step.id}`,
            target: `step-${nextStep.id}`,
            value: nextStepValue,
            color: getLinkColor(index, true) // Use diverse color for optional path
          },
          // Bypass path that skips the optional step
          {
            source: `step-${step.id}`,
            target: `step-${nextStep.id}`,
            value: skipValue,
            color: getLinkColor(index + 1, false) // Use diverse color for skip path
          }
        ];
      }
      
      // For required steps, just add the direct path
      return [{
        source: `step-${step.id}`,
        target: `step-${nextStep.id}`,
        value: nextStepValue > 0 ? nextStepValue : 0,
        color: getLinkColor(index, false) // Use diverse color for required path
      }];
    }),
    // ... existing code for split variations ...
    {
      source: `step-${steps[steps.length - 1].id}`,
      target: 'end',
      value: calculatedResults[steps[steps.length - 1].id] || 0
    }
  ].filter(link => link && typeof link.value === 'number' && link.value > 0)
   .map(link => ({ ...link, value: Math.max(0.001, link.value) })); // Ensure tiny value to render zero-value links

  // Enhanced color palette for better step distinction
  const getStepColor = (step: FunnelStep, index: number) => {
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#ec4899', // Pink
      '#84cc16', // Lime
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#f43f5e', // Rose
    ];
    
    // Use step index to cycle through colors
    return colors[index % colors.length];
  };

  const getLinkColor = (sourceIndex: number, isOptional: boolean = false) => {
    const colors = [
      '#3b82f680', // Blue
      '#10b98180', // Green
      '#f59e0b80', // Amber
      '#ef444480', // Red
      '#8b5cf680', // Purple
      '#06b6d480', // Cyan
      '#f9731680', // Orange
      '#ec489980', // Pink
      '#84cc1680', // Lime
      '#6366f180', // Indigo
      '#14b8a680', // Teal
      '#f43f5e80', // Rose
    ];
    
    // For optional steps, use a lighter variant
    if (isOptional) {
      return colors[sourceIndex % colors.length];
    }
    
    return colors[sourceIndex % colors.length];
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '1000px' }}>
      <Sankey
        width={sankeyWidth}
        height={containerHeight}
        data={sankeyData}
        margin={{ top: 100, right: 10, bottom: 60, left: 10 }}
        align="justify"
        colors={getNodeColor}
        nodeOpacity={0.95}
        nodeThickness={20}
        nodeInnerPadding={3}
        nodeBorderWidth={1}
        nodeBorderColor={node => {
          const originalId = getOriginalId(node.id);
          
          // Handle special cases first
          if (originalId === 'start') return '#3b82f6'; // Blue for start
          if (originalId === 'end') return '#ef4444'; // Red for end
          if (originalId?.includes('variation')) return '#0e7490'; // Cyan for variations
          
          // Find the step and its index
          const step = steps.find(s => s.id === originalId);
          if (!step) return '#6b7280'; // Gray for unknown steps
          
          const stepIndex = steps.findIndex(s => s.id === originalId);
          
          // Use the diverse color palette based on step index
          return getStepColor(step, stepIndex);
        }}
        linkOpacity={0.5}
        linkHoverOpacity={0.7}
        linkContract={0}
        enableLinkGradient={true}
        label={null}
        layout="horizontal"
        sort="input"
        nodeSpacing={24}
        linkBlendMode="multiply"
        theme={{
          tooltip: {
            container: {
              background: 'white',
              padding: '9px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }
        }}
        linkTooltip={({ link }) => {
          const linkData = sankeyData.links.find(l => 
            l.source === link.source.id && l.target === link.target.id
          );
          return (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {link.source.name} → {link.target.name}
              </div>
              <div style={{ fontSize: '14px' }}>
                Conversion Rate: {linkData?.percentage || '0.0%'}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Users: {link.value.toLocaleString()}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default FunnelSankeyVisualization; 