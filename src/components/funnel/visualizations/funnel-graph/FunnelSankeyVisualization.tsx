import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Sankey } from '@nivo/sankey';
import { FunnelStep } from '@/types/funnel';
import { FunnelApi } from '@/services/api';

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
  
  // Fetch calculated results when funnelId changes
  useEffect(() => {
    if (!funnelId) return;
    
    const fetchResults = async () => {
      try {
        const results = await FunnelApi.calculateFunnel(funnelId);
        setCalculatedResults(results);
      } catch (error) {
        console.error('Error calculating funnel:', error);
      }
    };
    
    fetchResults();
  }, [funnelId]);
  
  // Build Sankey data using calculated results
  const sankeyData = {
    nodes: steps.map((step, index) => ({
      id: `step-${index}`,
      name: step.name,
      value: calculatedResults?.[step.id] || step.visitorCount || 0,
      color: !step.isRequired ? '#7e22ce' : '#1e40af'
    })),
    links: steps.slice(1).map((step, index) => {
      const prevStep = steps[index];
      const prevValue = calculatedResults?.[prevStep.id] || prevStep.visitorCount || 0;
      const currentValue = calculatedResults?.[step.id] || step.visitorCount || 0;
      const percentage = prevValue > 0 ? ((currentValue / prevValue) * 100).toFixed(1) : '0.0';
      
      return {
        source: `step-${index}`,
        target: `step-${index + 1}`,
        value: currentValue,
        color: !step.isRequired ? '#7e22ce90' : '#1e40af90',
        percentage: `${percentage}%`
      };
    })
  };

  // Add split variations if they exist
  steps.forEach((step, index) => {
    if (step.splitVariations && step.splitVariations.length > 0) {
      step.splitVariations.forEach((split, splitIndex) => {
        const variationId = `${step.id}-variation-${splitIndex + 1}`;
        const splitValue = calculatedResults?.[variationId] || split.visitorCount || 0;
        const stepValue = calculatedResults?.[step.id] || step.visitorCount || 0;
        const percentage = stepValue > 0 ? ((splitValue / stepValue) * 100).toFixed(1) : '0.0';
        
        // Add split node
        sankeyData.nodes.push({
          id: `step-${index}-split-${splitIndex}`,
          name: split.name,
          value: splitValue,
          color: '#0e7490'
        });

        // Add link from main step to split
        sankeyData.links.push({
          source: `step-${index}`,
          target: `step-${index}-split-${splitIndex}`,
          value: splitValue,
          color: '#0e749090',
          percentage: `${percentage}%`
        });

        // Add link from split to next step if it exists
        if (index < steps.length - 1) {
          const nextStepValue = calculatedResults?.[steps[index + 1].id] || steps[index + 1].visitorCount || 0;
          const nextPercentage = splitValue > 0 ? ((nextStepValue / splitValue) * 100).toFixed(1) : '0.0';
          
          sankeyData.links.push({
            source: `step-${index}-split-${splitIndex}`,
            target: `step-${index + 1}`,
            value: nextStepValue,
            color: '#0e749090',
            percentage: `${nextPercentage}%`
          });
        }
      });
    }
  });

  const getNodeColor = (node: any) => {
    if (node.id.includes('split')) return '#0e7490';
    const step = steps.find(s => `step-${s.id}` === node.id);
    return step && !step.isRequired ? '#7e22ce' : '#1e40af';
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '750px' }}>
      <Sankey
        width={sankeyWidth}
        height={750}
        data={sankeyData}
        margin={{ top: 100, right: 10, bottom: 60, left: 10 }}
        align="justify"
        colors={getNodeColor}
        nodeOpacity={0.95}
        nodeThickness={12}
        nodeInnerPadding={3}
        nodeBorderWidth={1}
        nodeBorderColor={node => {
          if (node.id.includes('split')) return '#0e7490';
          const step = steps.find(s => `step-${s.id}` === node.id);
          return step && !step.isRequired ? '#7e22ce' : '#1e40af';
        }}
        linkOpacity={0.5}
        linkHoverOpacity={0.7}
        linkContract={2}
        enableLinkGradient={true}
        label={null}
        nodeSpacing={2}
        layout="horizontal"
        sort="input"
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