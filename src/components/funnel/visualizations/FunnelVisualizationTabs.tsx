import React, { useState } from 'react';
import FunnelGraphVisualization from './funnel-graph/FunnelGraphVisualization';
import { FunnelStep } from '@/types/funnel';

interface FunnelVisualizationTabsProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

const FunnelVisualizationTabs: React.FC<FunnelVisualizationTabsProps> = ({ steps, initialValue, funnelId }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);

  return (
    <div className="space-y-4">
      <FunnelGraphVisualization
        steps={enabledSteps}
        initialValue={initialValue}
      />
    </div>
  );
};

export default FunnelVisualizationTabs; 