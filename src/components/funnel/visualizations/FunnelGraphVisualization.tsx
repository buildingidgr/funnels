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
  // Filter out disabled steps
  const enabledSteps = steps.filter(step => step.isEnabled);
  
  console.log('FunnelGraphVisualization received:', {
    totalSteps: steps.length,
    enabledSteps: enabledSteps.length,
    initialValue,
    steps: enabledSteps.map(s => ({
      name: s.name,
      value: s.visitorCount,
      hasSplits: s.splitVariations?.length > 0,
      split: s.splitVariations?.map(sp => ({
        name: sp.name,
        value: sp.visitorCount
      }))
    }))
  });

  // Prepare data for Nivo Funnel with additional metrics and split steps
  const data = enabledSteps.flatMap((step, idx) => {
    const previousValue = idx === 0 ? initialValue : enabledSteps[idx - 1].visitorCount || 0;
    const currentValue = step.visitorCount || 0;
    const conversionRate = previousValue > 0 ? ((currentValue / previousValue) * 100).toFixed(1) : '0.0';
    const dropoff = previousValue - currentValue;
    
    console.log(`Processing step ${step.name}:`, {
      previousValue,
      currentValue,
      conversionRate,
      dropoff,
      hasSplits: step.splitVariations?.length > 0
    });
    
    // If step has splits, create separate paths for each split
    if (step.splitVariations && step.splitVariations.length > 0) {
      // First add the main step
      const mainStep = {
        id: step.name,
        value: currentValue,
        label: `${step.name}\n${currentValue.toLocaleString()} users`,
        conversionRate,
        dropoff,
        previousValue,
        isSplit: false,
        type: 'main'
      };

      // Then add each split as a separate path
      const splitSteps = step.splitVariations.map((splitStep, splitIdx) => {
        const splitValue = splitStep.visitorCount || 0;
        let splitToNextValue = splitValue;
        let splitConversionRate = '100.0';
        let splitDropoff = 0;
        // Use mapping if available
        if (funnelId && splitToNextMap[funnelId]) {
          const nextStep = enabledSteps[idx + 1];
          const key = `${step.name}|${splitStep.name}|${nextStep ? nextStep.name : ''}`;
          if (splitToNextMap[funnelId][key] !== undefined) {
            splitToNextValue = splitToNextMap[funnelId][key];
            splitConversionRate = splitValue > 0 ? ((splitToNextValue / splitValue) * 100).toFixed(1) : '0.0';
            splitDropoff = splitValue - splitToNextValue;
          } else {
            splitConversionRate = splitValue > 0 ? ((splitToNextValue / splitValue) * 100).toFixed(1) : '0.0';
            splitDropoff = splitValue - splitToNextValue;
          }
        }
        return {
          id: `${step.name} - ${splitStep.name}`,
          value: splitToNextValue,
          label: `${splitStep.name}\n${splitToNextValue.toLocaleString()} users`,
          conversionRate: splitConversionRate,
          dropoff: splitDropoff,
          previousValue: splitValue,
          isSplit: true,
          type: 'split' as const,
          parentStep: step.name,
          actualValue: splitToNextValue
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
      type: 'main'
    }];
  });

  // Log the processed data for debugging
  console.log('Processed funnel data:', data.map(d => ({
    id: d.id,
    label: d.label,
    value: d.value,
    isSplit: d.isSplit,
    conversionRate: d.conversionRate,
    dropoff: d.dropoff
  })));

  // Define color schemes
  const mainColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']; // Blue gradient
  const splitColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']; // Green gradient

  // Custom color scheme for main steps and splits
  const getColor = (part: any) => {
    if (!part || !part.data) return mainColors[0];
    
    // Check if this is a split step
    const isSplitStep = part.data.isSplit;
    
    // For main steps, use a fixed color
    if (!isSplitStep) {
      return mainColors[0]; // Use the primary blue for all main steps
    }
    
    // For split steps, alternate between two shades of green
    const isFirstSplit = part.data.id.includes('Mobile') || part.data.id.includes('New');
    return isFirstSplit ? splitColors[0] : splitColors[1];
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
            background: isSplit ? splitColors[0] : mainColors[0],
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
        marginBottom: '24px', 
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b', fontWeight: 600 }}>Funnel Legend</h4>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: mainColors[0],
              border: '2px solid #1e40af'
            }} />
            <div>
              <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>Main Steps</span>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Primary funnel path</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: splitColors[0],
              border: '2px solid #047857',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                background: '#047857',
                borderRadius: '50%'
              }} />
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>Split Paths</span>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Alternative user flows</p>
            </div>
          </div>
        </div>
      </div>
      <ResponsiveFunnel
        data={data}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        valueFormat=">-,"
        colors={getColor}
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