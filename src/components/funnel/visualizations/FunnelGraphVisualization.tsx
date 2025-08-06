// To use this component, install Nivo Funnel:
// npm install @nivo/funnel

import React from "react";
import { ResponsiveFunnel } from '@nivo/funnel';
import { FunnelStep as FunnelStepType } from '@/types/funnel';

interface FunnelGraphVisualizationProps {
  steps: FunnelStepType[];
  initialValue: number;
  funnelId?: string;
}

interface FunnelPart {
  id: string;
  value: number;
  label: string;
  conversionRate: string;
  dropoff: number;
  previousValue: number;
  isSplit: boolean;
  type: 'main' | 'split';
  parentStep?: string;
  actualValue?: number;
  color: string;
}

interface NivoPart {
  data: FunnelPart;
  index: number;
  value: number;
  formattedValue: string;
  color: string;
  label: string;
  id: string;
}

// Helper: hardcoded mapping for split-to-next values for content-platform-funnel-001
const splitToNextMap: Record<string, Record<string, number>> = {
  'content-platform-funnel-001': {
    'Homepage Visit|New Users|Content Discovery': 12000,
    'Homepage Visit|Returning Users|Content Discovery': 8000,
    'Content Discovery|Search|Content View': 5500,
    'Content Discovery|Recommendations|Content View': 6500,
    'Content View|Articles|Engagement': 2000,
    'Content View|Videos|Engagement': 1500,
    'Content View|Podcasts|Engagement': 500,
    'Engagement|Comments|Subscription': 1000,
    'Engagement|Shares|Subscription': 500,
    'Engagement|Bookmarks|Subscription': 500,
  }
};

const FunnelGraphVisualization: React.FC<FunnelGraphVisualizationProps> = ({ steps, initialValue, funnelId }) => {
  // Enhanced color palette for better step distinction
  const getStepColor = (index: number) => {
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
    
    return colors[index % colors.length];
  };

  const getSplitColor = (parentIndex: number, splitIndex: number) => {
    const colors = [
      '#34d399', // Light Green
      '#60a5fa', // Light Blue
      '#fbbf24', // Light Amber
      '#f87171', // Light Red
      '#a78bfa', // Light Purple
      '#22d3ee', // Light Cyan
      '#fb923c', // Light Orange
      '#f472b6', // Light Pink
      '#a3e635', // Light Lime
      '#818cf8', // Light Indigo
      '#5eead4', // Light Teal
      '#fb7185', // Light Rose
    ];
    
    return colors[(parentIndex + splitIndex) % colors.length];
  };

  // Filter to only enabled steps
  const enabledSteps = steps.filter(step => step.isEnabled);
  
  console.log('FunnelGraphVisualization received:', {
    totalSteps: steps.length,
    enabledSteps: enabledSteps.length,
    initialValue,
    steps: enabledSteps.map(s => ({ name: s.name, value: s.value, visitorCount: s.visitorCount }))
  });

  // Process the data for the funnel chart
  const data = enabledSteps.flatMap((step, idx) => {
    // Use the API-calculated value as the single source of truth
    const currentValue = step.value || step.visitorCount || 0;
    const previousValue = idx === 0 ? initialValue : (enabledSteps[idx - 1].value || enabledSteps[idx - 1].visitorCount || 0);
    const conversionRate = previousValue > 0 ? ((currentValue / previousValue) * 100).toFixed(1) : '0.0';
    const dropoff = previousValue - currentValue;
    const hasSplits = step.splitVariations && step.splitVariations.length > 0;

    console.log(`Processing step ${step.name}:`, {
      previousValue,
      currentValue,
      conversionRate,
      dropoff,
      hasSplits
    });

    // If this step has splits, create multiple parts
    if (hasSplits && step.splitVariations) {
      // First add the main step
      const mainStep = {
        id: step.name,
        value: currentValue,
        label: `${step.name}\n${currentValue.toLocaleString()} users`,
        conversionRate,
        dropoff,
        previousValue,
        isSplit: false,
        type: 'main',
        color: getStepColor(idx)
      };

      // Then add each split as a separate path
      const splitSteps = step.splitVariations.map((splitStep, splitIdx) => {
        // Calculate the split value based on the proportion from the funnel data
        const totalSplitVisitorCount = step.splitVariations.reduce((total, variation) => {
          return total + (variation.visitorCount || 0);
        }, 0);
        
        const splitProportion = totalSplitVisitorCount > 0 ? (splitStep.visitorCount || 0) / totalSplitVisitorCount : 0;
        const splitValue = Math.round(currentValue * splitProportion);
        
        // Calculate conversion rate from main step to this split
        const splitConversionRate = currentValue > 0 ? ((splitValue / currentValue) * 100).toFixed(1) : '0.0';
        const splitDropoff = currentValue - splitValue;
        
        return {
          id: `${step.name} - ${splitStep.name}`,
          value: splitValue,
          label: `${splitStep.name}\n${splitValue.toLocaleString()} users\n(${splitConversionRate}% of ${step.name})`,
          conversionRate: splitConversionRate,
          dropoff: splitDropoff,
          previousValue: currentValue,
          isSplit: true,
          type: 'split' as const,
          parentStep: step.name,
          actualValue: splitValue,
          color: getSplitColor(idx, splitIdx)
        };
      });

      // Return main step first, then splits
      return [mainStep, ...splitSteps];
    }

    // For steps without splits, just return the main step
    return [{
      id: step.name,
      value: currentValue,
      label: `${step.name}\n${currentValue.toLocaleString()} users`,
      conversionRate,
      dropoff,
      previousValue,
      isSplit: false,
      type: 'main',
      color: getStepColor(idx)
    }];
  });

  // Log the processed data for debugging
  console.log('Processed funnel data:', data.map(d => ({
    id: d.id,
    label: d.label,
    value: d.value,
    isSplit: d.isSplit,
    conversionRate: d.conversionRate,
    dropoff: d.dropoff,
    color: d.color
  })));

  console.log('About to render ResponsiveFunnel with data:', data);

  // Custom color scheme for main steps and splits
  const getColor = (part: any) => {
    console.log('getColor called with part:', part);
    
    if (!part || !part.data) {
      console.log('No part or part.data, returning default color');
      return getStepColor(0);
    }
    
    // If the color is already in the data, use it
    if (part.data.color) {
      console.log('Using color from data:', part.data.color);
      return part.data.color;
    }
    
    // Fallback: use the index-based approach
    const stepIndex = part.index ?? 0;
    const color = getStepColor(stepIndex);
    console.log('Using fallback color:', color, 'at index:', stepIndex);
    return color;
  };

  // Custom tooltip component
  const CustomTooltip = ({ part }: { part: any }) => {
    if (!part || !part.data) return null;

    const isSplit = part.data.isSplit;
    const parentStep = part.data.parentStep;
    const actualValue = part.data.actualValue || part.data.value;

    return (
      <div style={{ 
        padding: '16px',
        background: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '280px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '12px',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: isSplit ? getSplitColor(0, 0) : getStepColor(0),
            border: `2px solid ${isSplit ? '#047857' : '#1e40af'}`,
            position: 'relative'
          }}>
            {isSplit && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                background: '#047857',
                borderRadius: '50%'
              }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ 
              fontSize: '15px',
              color: '#1e293b',
              display: 'block',
              marginBottom: '2px'
            }}>
              {isSplit ? `${parentStep} → ${part.data.label.split(' → ')[1]}` : part.data.label}
            </strong>
            <span style={{ 
              fontSize: '12px', 
              color: '#64748b',
              background: isSplit ? '#ecfdf5' : '#eff6ff',
              padding: '2px 8px',
              borderRadius: '4px',
              border: `1px solid ${isSplit ? '#a7f3d0' : '#bfdbfe'}`
            }}>
              {isSplit ? 'Split Path' : 'Main Step'}
            </span>
          </div>
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#475569',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span>Users:</span>
            <strong style={{ color: '#1e293b' }}>{actualValue.toLocaleString()}</strong>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span>Conversion:</span>
            <strong style={{ color: '#1e293b' }}>{part.data.conversionRate}%</strong>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between'
          }}>
            <span>Drop-off:</span>
            <strong style={{ color: '#1e293b' }}>{part.data.dropoff.toLocaleString()}</strong>
          </div>
          {isSplit && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#166534'
            }}>
              This is a split path from the main step "{parentStep}"
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom label component
  const CustomLabel = ({ part }: { part: any }) => {
    if (!part || !part.data) return null;
    
    const isSplit = part.data.isSplit;
    const label = isSplit ? part.data.label : part.data.label;
    
    return (
      <text
        x={part.x + part.width / 2}
        y={part.y + part.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: '#000',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        {label}
      </text>
    );
  };

  return (
    <div style={{ height: 600 }}>
      <div style={{ 
        marginBottom: '16px', 
        padding: '8px 12px',
        background: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ 
          fontSize: '13px', 
          color: '#64748b', 
          fontWeight: 500,
          marginRight: '8px'
        }}>
          Legend:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: getStepColor(0),
              border: '1px solid #1e40af'
            }} />
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Main Steps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: getSplitColor(0, 0),
              border: '1px solid #047857',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                background: '#047857',
                borderRadius: '50%'
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Split Paths</span>
          </div>
        </div>
      </div>
      <ResponsiveFunnel
        data={data}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        valueFormat=">-,"
        borderWidth={20}
        labelColor={{
          from: 'color',
          modifiers: [['darker', 3]]
        }}
        beforeSeparatorLength={100}
        afterSeparatorLength={100}
        currentPartSizeExtension={10}
        currentBorderWidth={40}
        motionConfig="gentle"
        theme={{
          tooltip: {
            container: {
              background: '#ffffff',
              color: '#333333',
              fontSize: '12px',
              borderRadius: '4px',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)'
            }
          }
        }}
        tooltip={({ part }) => <CustomTooltip part={part} />}
        enableLabel={true}
        labelFormat={(label) => label}
      />
    </div>
  );
};

export default FunnelGraphVisualization; 